-- Funciones y tabla adicionales. No modifica cuentas ni políticas de reservas existentes.
begin;
create table if not exists public.campus_talleres (
 id uuid primary key default gen_random_uuid(),
 autor_id uuid not null default auth.uid() references public.perfiles(id),
 titulo text not null check (length(titulo) between 1 and 180),
 indicaciones text not null check (length(indicaciones) between 1 and 5000),
 facilitador text not null check (length(facilitador) between 1 and 180),
 laboratorio text not null default '' check (length(laboratorio)<=180),
 fecha date,
 estado text not null default 'Pendiente' check (estado in ('Pendiente','En curso','Completado')),
 created_at timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
alter table public.campus_talleres enable row level security;
revoke all on public.campus_talleres from anon;
grant select,insert,update,delete on public.campus_talleres to authenticated;
create policy talleres_staff_read on public.campus_talleres for select to authenticated using (
 exists(select 1 from public.perfiles p where p.id=(select auth.uid()) and p.estado='Aprobado' and p.rol in ('administrador','docente'))
);
create policy talleres_staff_insert on public.campus_talleres for insert to authenticated with check (
 autor_id=(select auth.uid()) and exists(select 1 from public.perfiles p where p.id=(select auth.uid()) and p.estado='Aprobado' and p.rol in ('administrador','docente'))
);
create policy talleres_author_update on public.campus_talleres for update to authenticated using (
 exists(select 1 from public.perfiles p where p.id=(select auth.uid()) and p.estado='Aprobado' and (p.rol='administrador' or (p.rol='docente' and autor_id=p.id)))
) with check (
 exists(select 1 from public.perfiles p where p.id=(select auth.uid()) and p.estado='Aprobado' and (p.rol='administrador' or (p.rol='docente' and autor_id=p.id)))
);
create policy talleres_author_delete on public.campus_talleres for delete to authenticated using (
 exists(select 1 from public.perfiles p where p.id=(select auth.uid()) and p.estado='Aprobado' and (p.rol='administrador' or (p.rol='docente' and autor_id=p.id)))
);
create index if not exists campus_talleres_autor_idx on public.campus_talleres(autor_id);
create index if not exists campus_talleres_fecha_idx on public.campus_talleres(fecha);

-- Disponibilidad con color, sin publicar nombres de docentes, cursos o usuarios.
-- El definidor permanece en el esquema privado y exige una cuenta aprobada.
create or replace function campus_privado.disponibilidad_apolo()
returns table(laboratorio text,dia text,bloque text,estado text,color text)
language sql stable security definer set search_path='' as $$
 select r.laboratorio,r.dia,r.bloque,r.estado,
 coalesce(
  (select c.datos->>lower(trim(r.curso)) from public.campus_contenido c where c.clave='materia_colores' and (c.datos->>lower(trim(r.curso))) ~ '^#[0-9a-fA-F]{6}$'),
  (select x->>'color' from public.campus_contenido c cross join lateral jsonb_array_elements(case when jsonb_typeof(c.datos)='array' then c.datos else '[]'::jsonb end) x where c.clave='horario' and lower(trim(x->>'curso'))=lower(trim(r.curso)) and (x->>'color') ~ '^#[0-9a-fA-F]{6}$' limit 1),
  (array['#275fa0','#7e55a7','#1d7a6b','#b26220','#a13e65','#5065a1'])[1+mod(coalesce((select sum(ascii(substr(lower(trim(r.curso)),g,1))) from generate_series(1,length(trim(r.curso))) g),0),6)::int]
 )
 from public.reservas r
 where r.estado in ('Pendiente','Aprobado') and (select campus_privado.campus_activo());
$$;
revoke all on function campus_privado.disponibilidad_apolo() from public,anon;
grant execute on function campus_privado.disponibilidad_apolo() to authenticated;
create or replace function public.campus_disponibilidad_apolo()
returns table(laboratorio text,dia text,bloque text,estado text,color text)
language sql stable set search_path='' as $$select * from campus_privado.disponibilidad_apolo()$$;
revoke all on function public.campus_disponibilidad_apolo() from public,anon;
grant execute on function public.campus_disponibilidad_apolo() to authenticated;
commit;
