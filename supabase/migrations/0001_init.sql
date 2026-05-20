-- =====================================================================
-- Portal Operativo Empresarial — Schema inicial
-- =====================================================================

create extension if not exists "pgcrypto";

-- ENUMS -----------------------------------------------------------------
create type user_role           as enum ('admin', 'licenciatario', 'miembro');
create type user_status         as enum ('activo', 'inactivo');
create type vinculacion_status  as enum ('generada', 'en_gestion', 'cerrada');
create type invitado_status     as enum ('asistio', 'no_asistio', 'prospecto', 'se_integro');
create type aportacion_tipo     as enum ('membresia', 'sesion');
create type aportacion_status   as enum ('por_validar', 'confirmado', 'revisar', 'rechazado');
create type recurso_tipo        as enum ('documento', 'guia', 'presentacion');

-- TABLAS ----------------------------------------------------------------

create table plazas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  ciudad      text,
  activa      boolean default true,
  created_at  timestamptz default now()
);

create table miembros (
  id                   uuid primary key references auth.users(id) on delete cascade,
  nombre               text not null,
  empresa              text,
  giro                 text,
  telefono             text,
  correo               text not null unique,
  plaza_id             uuid not null references plazas(id),
  rol                  user_role not null default 'miembro',
  estatus              user_status not null default 'activo',
  descripcion_negocio  text,
  fecha_inicio         date default current_date,
  fecha_fin            date,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);
create index idx_miembros_plaza    on miembros(plaza_id);
create index idx_miembros_estatus  on miembros(estatus);
create index idx_miembros_rol      on miembros(rol);

create table vinculaciones (
  id                uuid primary key default gen_random_uuid(),
  de_miembro_id    uuid not null references miembros(id),
  para_miembro_id  uuid not null references miembros(id),
  contacto_nombre   text not null,
  contacto_telefono text,
  notas             text,
  estatus           vinculacion_status not null default 'generada',
  monto_negocio     numeric(12,2) default 0,
  plaza_id          uuid not null references plazas(id),
  fecha             date not null default current_date,
  created_at        timestamptz default now()
);
create index idx_vinc_de     on vinculaciones(de_miembro_id);
create index idx_vinc_para   on vinculaciones(para_miembro_id);
create index idx_vinc_plaza  on vinculaciones(plaza_id);

create table uno_a_uno (
  id            uuid primary key default gen_random_uuid(),
  miembro_id    uuid not null references miembros(id),
  con_quien_id  uuid not null references miembros(id),
  fecha         date not null,
  notas         text,
  plaza_id      uuid not null references plazas(id),
  created_at    timestamptz default now()
);
create index idx_1a1_miembro on uno_a_uno(miembro_id);

create table invitados (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  telefono        text,
  empresa         text,
  giro            text,
  invitado_por_id uuid not null references miembros(id),
  plaza_id        uuid not null references plazas(id),
  fecha           date not null default current_date,
  estatus         invitado_status not null default 'prospecto',
  notas           text,
  created_at      timestamptz default now()
);
create index idx_invitados_por   on invitados(invitado_por_id);
create index idx_invitados_plaza on invitados(plaza_id);

create table encuentros (
  id          uuid primary key default gen_random_uuid(),
  plaza_id    uuid not null references plazas(id),
  fecha       date not null,
  hora        time not null,
  lugar       text,
  direccion   text,
  notas       text,
  activo      boolean default true,
  created_at  timestamptz default now()
);
-- Regla: 1 encuentro activo por plaza
create unique index idx_encuentro_activo_unico
  on encuentros(plaza_id) where activo = true;

create table aportaciones (
  id                uuid primary key default gen_random_uuid(),
  miembro_id        uuid not null references miembros(id),
  plaza_id          uuid not null references plazas(id),
  tipo              aportacion_tipo not null,
  monto             numeric(12,2) not null check (monto > 0),
  fecha             date not null default current_date,
  comprobante_url   text,
  estado            aportacion_status not null default 'por_validar',
  validado_por_id   uuid references miembros(id),
  fecha_validacion  timestamptz,
  notas             text,
  notas_admin       text,
  created_at        timestamptz default now()
);
create index idx_aport_miembro on aportaciones(miembro_id);
create index idx_aport_estado  on aportaciones(estado);

create table recursos (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  tipo            recurso_tipo not null,
  archivo_url     text not null,
  plaza_id        uuid references plazas(id),
  visible_todos   boolean default false,
  subido_por_id   uuid references miembros(id),
  created_at      timestamptz default now()
);

-- =====================================================================
-- HELPERS: rol y plaza del usuario autenticado
-- =====================================================================

create or replace function public.auth_rol()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select rol from miembros where id = auth.uid()
$$;

create or replace function public.auth_plaza()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select plaza_id from miembros where id = auth.uid()
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table plazas         enable row level security;
alter table miembros       enable row level security;
alter table vinculaciones  enable row level security;
alter table uno_a_uno      enable row level security;
alter table invitados      enable row level security;
alter table encuentros     enable row level security;
alter table aportaciones   enable row level security;
alter table recursos       enable row level security;

-- PLAZAS: todos leen, solo admin escribe
create policy "plazas_select_auth" on plazas
  for select to authenticated using (true);
create policy "plazas_insert_admin" on plazas
  for insert to authenticated with check (auth_rol() = 'admin');
create policy "plazas_update_admin" on plazas
  for update to authenticated using (auth_rol() = 'admin');
create policy "plazas_delete_admin" on plazas
  for delete to authenticated using (auth_rol() = 'admin');

-- MIEMBROS
-- SELECT: admin todo / licenciatario su plaza / miembro ve activos (directorio)
create policy "miembros_select" on miembros for select to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
  or (auth_rol() = 'miembro' and estatus = 'activo')
  or id = auth.uid()
);
-- INSERT: solo admin (vía service_role normalmente, esta policy cubre cliente)
create policy "miembros_insert_admin" on miembros for insert to authenticated
  with check (auth_rol() = 'admin');
-- UPDATE: admin todo / dueño campos limitados (validación a nivel app)
create policy "miembros_update" on miembros for update to authenticated using (
  auth_rol() = 'admin'
  or id = auth.uid()
);
create policy "miembros_delete_admin" on miembros for delete to authenticated
  using (auth_rol() = 'admin');

-- VINCULACIONES
create policy "vinc_select" on vinculaciones for select to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
  or (auth_rol() = 'miembro' and (de_miembro_id = auth.uid() or para_miembro_id = auth.uid()))
);
create policy "vinc_insert" on vinculaciones for insert to authenticated
  with check (de_miembro_id = auth.uid() or auth_rol() in ('admin','licenciatario'));
create policy "vinc_update" on vinculaciones for update to authenticated using (
  de_miembro_id = auth.uid()
  or auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
);
create policy "vinc_delete_admin" on vinculaciones for delete to authenticated
  using (auth_rol() in ('admin','licenciatario'));

-- 1 a 1
create policy "1a1_select" on uno_a_uno for select to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
  or miembro_id = auth.uid()
  or con_quien_id = auth.uid()
);
create policy "1a1_insert" on uno_a_uno for insert to authenticated
  with check (miembro_id = auth.uid() or auth_rol() in ('admin','licenciatario'));
create policy "1a1_update" on uno_a_uno for update to authenticated using (
  miembro_id = auth.uid() or auth_rol() in ('admin','licenciatario')
);

-- INVITADOS
create policy "invitados_select" on invitados for select to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
  or invitado_por_id = auth.uid()
);
create policy "invitados_insert" on invitados for insert to authenticated
  with check (invitado_por_id = auth.uid() or auth_rol() in ('admin','licenciatario'));
create policy "invitados_update" on invitados for update to authenticated using (
  invitado_por_id = auth.uid() or auth_rol() in ('admin','licenciatario')
);

-- ENCUENTROS
create policy "encuentros_select" on encuentros for select to authenticated using (
  auth_rol() = 'admin'
  or plaza_id = auth_plaza()
);
create policy "encuentros_write" on encuentros for all to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
) with check (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
);

-- APORTACIONES
create policy "aport_select" on aportaciones for select to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
  or miembro_id = auth.uid()
);
create policy "aport_insert" on aportaciones for insert to authenticated
  with check (miembro_id = auth.uid() or auth_rol() in ('admin','licenciatario'));
-- Update: solo admin/licenciatario; nunca el dueño (no validar propias)
create policy "aport_update_validador" on aportaciones for update to authenticated using (
  (auth_rol() = 'admin' and miembro_id <> auth.uid())
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza() and miembro_id <> auth.uid())
);

-- RECURSOS
create policy "recursos_select" on recursos for select to authenticated using (
  visible_todos = true
  or auth_rol() = 'admin'
  or plaza_id = auth_plaza()
);
create policy "recursos_write" on recursos for all to authenticated using (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
) with check (
  auth_rol() = 'admin'
  or (auth_rol() = 'licenciatario' and plaza_id = auth_plaza())
);

-- =====================================================================
-- STORAGE BUCKETS (crear desde dashboard o vía sql)
-- =====================================================================
-- Buckets sugeridos:
--   comprobantes  (privado)  → para aportaciones
--   recursos      (privado)  → para repositorio
-- Configurar policies de storage desde dashboard Supabase.

-- =====================================================================
-- TRIGGER: updated_at automático en miembros
-- =====================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_miembros_touch
  before update on miembros
  for each row execute function public.touch_updated_at();
