-- Applied to the connected project: private video storage and admin-only motivation editing.
begin;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('campus-motivacion','campus-motivacion',false,52428800,array['video/mp4','video/webm']) on conflict (id) do nothing;
create policy campus_motivacion_read_approved on storage.objects for select to authenticated using (bucket_id='campus-motivacion' and (select campus_privado.campus_activo()));
create policy campus_motivacion_insert_admin on storage.objects for insert to authenticated with check (bucket_id='campus-motivacion' and (storage.foldername(name))[1]=(select auth.uid())::text and (select campus_privado.campus_admin()));
create policy campus_motivacion_remove_admin on storage.objects for delete to authenticated using (bucket_id='campus-motivacion' and (select campus_privado.campus_admin()));
alter table public.campus_contenido drop constraint campus_contenido_clave_check;
alter table public.campus_contenido add constraint campus_contenido_clave_check check (clave = any (array['noticias','inventario','horario','portada','motivacion']::text[]));
commit;
