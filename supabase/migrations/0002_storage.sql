-- =====================================================================
-- STORAGE: buckets comprobantes + recursos + policies
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('comprobantes', 'comprobantes', false),
  ('recursos',     'recursos',     false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- COMPROBANTES (aportaciones)
-- Ruta: <miembro_id>/<aportacion_id>/<filename>
-- ---------------------------------------------------------------------

-- INSERT: el dueño sube en su carpeta. Admin/lic suben en cualquiera.
create policy "comprobantes_insert_dueno_o_admin"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'comprobantes'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.auth_rol() in ('admin', 'licenciatario')
    )
  );

-- SELECT: dueño ve los suyos. Admin todo. Lic los de su plaza (vía join app)
create policy "comprobantes_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'comprobantes'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.auth_rol() in ('admin', 'licenciatario')
    )
  );

-- UPDATE / DELETE: solo admin
create policy "comprobantes_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'comprobantes' and public.auth_rol() = 'admin');

create policy "comprobantes_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'comprobantes' and public.auth_rol() = 'admin');

-- ---------------------------------------------------------------------
-- RECURSOS (repositorio interno)
-- Ruta: <plaza_id>/<filename>   (o "nacional/<filename>")
-- ---------------------------------------------------------------------

create policy "recursos_select_auth"
  on storage.objects for select to authenticated
  using (bucket_id = 'recursos');

create policy "recursos_insert_admin_lic"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'recursos'
    and public.auth_rol() in ('admin', 'licenciatario')
  );

create policy "recursos_update_admin_lic"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'recursos'
    and public.auth_rol() in ('admin', 'licenciatario')
  );

create policy "recursos_delete_admin_lic"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'recursos'
    and public.auth_rol() in ('admin', 'licenciatario')
  );
