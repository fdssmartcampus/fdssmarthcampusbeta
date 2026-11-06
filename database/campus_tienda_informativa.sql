create table public.campus_tienda (
 id boolean primary key default true check (id),
 datos jsonb not null default '{}'::jsonb check (jsonb_typeof(datos)='object' and octet_length(datos::text)<=2097152),
 revision integer not null default 0 check (revision>=0),
 actualizado_en timestamptz not null default now()
);
alter table public.campus_tienda enable row level security;
revoke all on public.campus_tienda from anon, authenticated;
grant select, insert, update on public.campus_tienda to authenticated;
create policy tienda_lectura on public.campus_tienda for select to authenticated using ((select campus_privado.campus_activo()));
create policy tienda_admin_insert on public.campus_tienda for insert to authenticated with check ((select campus_privado.campus_admin()));
create policy tienda_admin_update on public.campus_tienda for update to authenticated using ((select campus_privado.campus_admin())) with check ((select campus_privado.campus_admin()));
insert into public.campus_tienda (id,datos) values (true,'{"title":"Tienda del campus","intro":"Material médico, estética, Antojitos, bazar y papelería.","notice":"Catálogo informativo de productos y menú. Consulta los detalles de cada publicación.","categories":[{"id":"medico","name":"Material médico"},{"id":"estetica","name":"Estética"},{"id":"antojitos","name":"Antojitos"},{"id":"bazar","name":"Bazar"},{"id":"papeleria","name":"Papelería"}],"products":[]}');

