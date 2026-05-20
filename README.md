# Portal Operativo Empresarial

Plataforma operativa privada para red empresarial nacional. Centraliza miembros, vinculaciones, encuentros, aportaciones, invitados, recursos y métricas por Plaza.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres + Auth + Storage + RLS)
- Tailwind CSS + shadcn/ui
- react-hook-form + zod
- @tanstack/react-table

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear proyecto en Supabase

1. Crear cuenta y proyecto en [supabase.com](https://supabase.com)
2. Copiar URL, anon key y service role key desde Settings → API
3. Crear archivo `.env.local`:

```bash
cp .env.local.example .env.local
```

Pegar los valores reales.

### 3. Aplicar migrations

En el SQL Editor de Supabase, ejecutar en orden:

1. `supabase/migrations/0001_init.sql` (schema + RLS)
2. `supabase/seed.sql` (datos de prueba — opcional)

Luego en Authentication → Users, crear manualmente al primer admin con el correo que aparezca en la fila `miembros` con rol admin (o ajustar el seed con el UUID del usuario creado).

### 4. Levantar dev server

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura

```
src/
  app/
    (auth)/login/              acceso privado
    (app)/                     rutas autenticadas
      mi-movimiento/           home del miembro
      vinculaciones/           oportunidades de negocio
      uno-a-uno/               reuniones entre miembros
      invitados/               registro de invitados
      encuentros/              sesiones semanales
      explorar-red/            directorio nacional
      mi-espacio/              perfil
      recursos/                repositorio de documentos
      aportaciones/            pagos internos
      admin/                   solo admin/licenciatario
  components/                  UI compartida
  lib/
    supabase/                  clients (browser + server + middleware)
    schemas/                   zod schemas
supabase/
  migrations/                  SQL versionado
  seed.sql                     datos de demo
```

## Roles

- **Admin** — acceso total
- **Licenciatario** — administrador de UNA Plaza
- **Miembro** — usuario estándar

La visibilidad se aplica con Row Level Security en Postgres (no en código frontend).

## Deploy a Vercel

### 1. Push a GitHub

```bash
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

### 2. Importar en Vercel

1. Entrar a [vercel.com/new](https://vercel.com/new)
2. Conectar GitHub y seleccionar el repo
3. Framework Preset: **Next.js** (auto-detectado)
4. **Environment Variables** — agregar las 3:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**

### 3. Configurar Supabase para producción

En Supabase dashboard → Authentication → URL Configuration:
- **Site URL**: `https://TU-PROYECTO.vercel.app`
- **Redirect URLs**: agregar `https://TU-PROYECTO.vercel.app/**`

### 4. Dominio custom (opcional)

Vercel → Project → Settings → Domains → agregar dominio. Apuntar DNS (CNAME a `cname.vercel-dns.com`).

## Reglas críticas

- No existe registro público. Solo Admin crea usuarios.
- Cada miembro pertenece a UNA Plaza.
- Solo miembros con estatus `activo` aparecen en "Explorar la red".
- Solo puede existir un Encuentro activo por Plaza (índice único en DB).
- Las Aportaciones siempre inician como `por_validar`. El miembro NO puede validar las propias.
