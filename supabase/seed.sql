-- =====================================================================
-- Seed de demo
-- =====================================================================
-- INSTRUCCIONES:
-- 1. Crear primero los usuarios en Authentication → Users (dashboard Supabase)
-- 2. Reemplazar los UUIDs abajo con los IDs reales generados
-- 3. Ejecutar este script
-- =====================================================================

-- Plazas
insert into plazas (id, nombre, ciudad) values
  ('11111111-1111-1111-1111-111111111111', 'Plaza Puebla',   'Puebla'),
  ('22222222-2222-2222-2222-222222222222', 'Plaza Tlaxcala', 'Tlaxcala'),
  ('33333333-3333-3333-3333-333333333333', 'Plaza CDMX',     'Ciudad de México'),
  ('44444444-4444-4444-4444-444444444444', 'Plaza Irapuato', 'Irapuato')
on conflict (nombre) do nothing;

-- Miembros de prueba — REEMPLAZAR los IDs con los UUIDs reales de auth.users
-- Ejemplo:
-- insert into miembros (id, nombre, correo, plaza_id, rol, estatus, empresa, giro) values
--   ('UUID-DEL-ADMIN',         'Admin Principal',    'admin@demo.com',    '11111111-1111-1111-1111-111111111111', 'admin',         'activo', 'Portal', 'Plataforma'),
--   ('UUID-DEL-LICENCIATARIO', 'Lic Puebla',         'lic.pue@demo.com',  '11111111-1111-1111-1111-111111111111', 'licenciatario', 'activo', 'Despacho XYZ', 'Consultoría'),
--   ('UUID-DEL-MIEMBRO-1',     'Juan Pérez',         'juan@demo.com',     '11111111-1111-1111-1111-111111111111', 'miembro',       'activo', 'Constructora ABC', 'Construcción'),
--   ('UUID-DEL-MIEMBRO-2',     'María López',        'maria@demo.com',    '33333333-3333-3333-3333-333333333333', 'miembro',       'activo', 'Boutique Estilo', 'Retail');
