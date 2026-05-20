import { z } from "zod";

export const rolEnum = z.enum(["admin", "licenciatario", "miembro"]);
export const estatusEnum = z.enum(["activo", "inactivo"]);
export const vinculacionStatusEnum = z.enum(["generada", "en_gestion", "cerrada"]);
export const invitadoStatusEnum = z.enum(["asistio", "no_asistio", "prospecto", "se_integro"]);
export const aportacionTipoEnum = z.enum(["membresia", "sesion"]);
export const aportacionStatusEnum = z.enum(["por_validar", "confirmado", "revisar", "rechazado"]);
export const recursoTipoEnum = z.enum(["documento", "guia", "presentacion"]);

export const plazaSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres"),
  ciudad: z.string().optional(),
  activa: z.boolean().default(true),
});

export const miembroSchema = z.object({
  nombre: z.string().min(2),
  correo: z.string().email("Correo inválido"),
  empresa: z.string().optional(),
  giro: z.string().optional(),
  telefono: z.string().optional(),
  plaza_id: z.string().uuid(),
  rol: rolEnum.default("miembro"),
  estatus: estatusEnum.default("activo"),
  descripcion_negocio: z.string().optional(),
});

export const miembroEditPerfilSchema = z.object({
  empresa: z.string().optional(),
  giro: z.string().optional(),
  telefono: z.string().optional(),
  descripcion_negocio: z.string().optional(),
});

export const vinculacionSchema = z.object({
  para_miembro_id: z.string().uuid("Selecciona miembro"),
  contacto_nombre: z.string().min(2),
  contacto_telefono: z.string().optional(),
  notas: z.string().optional(),
  estatus: vinculacionStatusEnum.default("generada"),
  monto_negocio: z.coerce.number().min(0).default(0),
  fecha: z.string().default(() => new Date().toISOString().slice(0, 10)),
});

export const unoAUnoSchema = z.object({
  con_quien_id: z.string().uuid(),
  fecha: z.string(),
  notas: z.string().optional(),
});

export const invitadoSchema = z.object({
  nombre: z.string().min(2),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  giro: z.string().optional(),
  fecha: z.string().default(() => new Date().toISOString().slice(0, 10)),
  estatus: invitadoStatusEnum.default("prospecto"),
  notas: z.string().optional(),
});

export const encuentroSchema = z.object({
  plaza_id: z.string().uuid(),
  fecha: z.string(),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  lugar: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean().default(true),
});

export const aportacionSchema = z.object({
  tipo: aportacionTipoEnum,
  monto: z.coerce.number().positive(),
  fecha: z.string().default(() => new Date().toISOString().slice(0, 10)),
  notas: z.string().optional(),
  comprobante_url: z.string().url().optional(),
});

export const aportacionValidacionSchema = z.object({
  estado: aportacionStatusEnum,
  notas_admin: z.string().optional(),
});

export const recursoSchema = z.object({
  nombre: z.string().min(2),
  tipo: recursoTipoEnum,
  archivo_url: z.string().url(),
  plaza_id: z.string().uuid().optional(),
  visible_todos: z.boolean().default(false),
});

export const loginSchema = z.object({
  correo: z.string().email(),
  password: z.string().min(6),
});
