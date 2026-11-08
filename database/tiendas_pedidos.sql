-- Solicitudes de compra: el catálogo y las cantidades se confirman al recoger.
create table public.campus_pedidos (
 id uuid primary key,
 usuario_id uuid not null references public.perfiles(id),
 tipo text not null check(tipo in ('antojitos','bazar')),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 50),
 total numeric(12,2) not null default 0 check(total>=0),
 estado text not null default 'Pendiente' check(estado in ('Pendiente','Confirmado','Entregado','Cancelado')),
 created_at timestamptz not null default now()
);
create index campus_pedidos_usuario_fecha on public.campus_pedidos(usuario_id,created_at desc);
alter table public.campus_pedidos enable row level security;
grant select,insert on public.campus_pedidos to authenticated;
grant update(estado) on public.campus_pedidos to authenticated;
create policy pedidos_ver on public.campus_pedidos for select to authenticated using ((select campus_privado.campus_admin()) or (usuario_id=(select auth.uid()) and (select campus_privado.campus_activo())));
create policy pedidos_solicitar on public.campus_pedidos for insert to authenticated with check (usuario_id=(select auth.uid()) and (select campus_privado.campus_activo()) and estado='Pendiente');
create policy pedidos_gestionar on public.campus_pedidos for update to authenticated using ((select campus_privado.campus_admin())) with check ((select campus_privado.campus_admin()));
create function campus_privado.validar_pedido_tienda() returns trigger language plpgsql security invoker set search_path='' as $$
declare catalogo jsonb; item jsonb; producto jsonb; cantidad integer; resultado jsonb='[]'; importe numeric=0; vistos text[]='{}';
begin
 if auth.uid() is null or new.usuario_id<>auth.uid() then raise exception 'Inicia sesión para solicitar un pedido.'; end if;
 select datos->'productos' into catalogo from public.campus_tienda where id=true;
 for item in select value from jsonb_array_elements(new.items) loop
  if item->>'id'=any(vistos) then raise exception 'Producto duplicado.'; end if;
  vistos=array_append(vistos,item->>'id');
  select value into producto from jsonb_array_elements(coalesce(catalogo,'[]')) where value->>'id'=item->>'id' and value->>'tipo'=new.tipo;
  cantidad=(item->>'cantidad')::integer;
  if producto is null or cantidad is null or cantidad<1 or cantidad>99 or cantidad>coalesce((producto->>'stock')::integer,0) then raise exception 'Un producto ya no está disponible en esa cantidad. Actualiza el catálogo.'; end if;
  importe=importe+round((producto->>'precio')::numeric,2)*cantidad;
  resultado=resultado||jsonb_build_array(jsonb_build_object('id',producto->>'id','nombre',producto->>'nombre','precio',round((producto->>'precio')::numeric,2),'cantidad',cantidad));
 end loop;
 new.items=resultado; new.total=importe; new.estado='Pendiente'; new.created_at=now();return new;
end $$;
revoke all on function campus_privado.validar_pedido_tienda() from public;
create trigger validar_pedido before insert on public.campus_pedidos for each row execute function campus_privado.validar_pedido_tienda();
