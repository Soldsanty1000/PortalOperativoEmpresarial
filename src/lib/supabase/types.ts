// Tipos de la base de datos. Generados a mano desde 0001_init.sql.
// Para regenerar automáticamente:
//   npx supabase login
//   npx supabase gen types typescript --project-id YOUR_PROJECT > src/lib/supabase/types.ts

export type Rol = "admin" | "licenciatario" | "miembro";
export type EstatusMiembro = "activo" | "inactivo";
export type EstatusVinculacion = "generada" | "en_gestion" | "cerrada";
export type EstatusInvitado = "asistio" | "no_asistio" | "prospecto" | "se_integro";
export type TipoAportacion = "membresia" | "sesion";
export type EstadoAportacion = "por_validar" | "confirmado" | "revisar" | "rechazado";
export type TipoRecurso = "documento" | "guia" | "presentacion";

export type Database = {
  public: {
    Tables: {
      plazas: {
        Row: {
          id: string;
          nombre: string;
          ciudad: string | null;
          activa: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          ciudad?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          ciudad?: string | null;
          activa?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      miembros: {
        Row: {
          id: string;
          nombre: string;
          empresa: string | null;
          giro: string | null;
          telefono: string | null;
          correo: string;
          plaza_id: string;
          rol: Rol;
          estatus: EstatusMiembro;
          descripcion_negocio: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          nombre: string;
          correo: string;
          plaza_id: string;
          empresa?: string | null;
          giro?: string | null;
          telefono?: string | null;
          rol?: Rol;
          estatus?: EstatusMiembro;
          descripcion_negocio?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          correo?: string;
          plaza_id?: string;
          empresa?: string | null;
          giro?: string | null;
          telefono?: string | null;
          rol?: Rol;
          estatus?: EstatusMiembro;
          descripcion_negocio?: string | null;
          fecha_inicio?: string | null;
          fecha_fin?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      vinculaciones: {
        Row: {
          id: string;
          de_miembro_id: string;
          para_miembro_id: string;
          contacto_nombre: string;
          contacto_telefono: string | null;
          notas: string | null;
          estatus: EstatusVinculacion;
          monto_negocio: number | null;
          plaza_id: string;
          fecha: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          de_miembro_id: string;
          para_miembro_id: string;
          contacto_nombre: string;
          plaza_id: string;
          contacto_telefono?: string | null;
          notas?: string | null;
          estatus?: EstatusVinculacion;
          monto_negocio?: number | null;
          fecha?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          de_miembro_id?: string;
          para_miembro_id?: string;
          contacto_nombre?: string;
          plaza_id?: string;
          contacto_telefono?: string | null;
          notas?: string | null;
          estatus?: EstatusVinculacion;
          monto_negocio?: number | null;
          fecha?: string;
          created_at?: string | null;
        };
        Relationships: [];
      };
      uno_a_uno: {
        Row: {
          id: string;
          miembro_id: string;
          con_quien_id: string;
          fecha: string;
          notas: string | null;
          plaza_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          miembro_id: string;
          con_quien_id: string;
          fecha: string;
          plaza_id: string;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          miembro_id?: string;
          con_quien_id?: string;
          fecha?: string;
          plaza_id?: string;
          notas?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      invitados: {
        Row: {
          id: string;
          nombre: string;
          telefono: string | null;
          empresa: string | null;
          giro: string | null;
          invitado_por_id: string;
          plaza_id: string;
          fecha: string;
          estatus: EstatusInvitado;
          notas: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          invitado_por_id: string;
          plaza_id: string;
          telefono?: string | null;
          empresa?: string | null;
          giro?: string | null;
          fecha?: string;
          estatus?: EstatusInvitado;
          notas?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          invitado_por_id?: string;
          plaza_id?: string;
          telefono?: string | null;
          empresa?: string | null;
          giro?: string | null;
          fecha?: string;
          estatus?: EstatusInvitado;
          notas?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      encuentros: {
        Row: {
          id: string;
          plaza_id: string;
          fecha: string;
          hora: string;
          lugar: string | null;
          direccion: string | null;
          notas: string | null;
          activo: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          plaza_id: string;
          fecha: string;
          hora: string;
          lugar?: string | null;
          direccion?: string | null;
          notas?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          plaza_id?: string;
          fecha?: string;
          hora?: string;
          lugar?: string | null;
          direccion?: string | null;
          notas?: string | null;
          activo?: boolean | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      aportaciones: {
        Row: {
          id: string;
          miembro_id: string;
          plaza_id: string;
          tipo: TipoAportacion;
          monto: number;
          fecha: string;
          comprobante_url: string | null;
          estado: EstadoAportacion;
          validado_por_id: string | null;
          fecha_validacion: string | null;
          notas: string | null;
          notas_admin: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          miembro_id: string;
          plaza_id: string;
          tipo: TipoAportacion;
          monto: number;
          fecha?: string;
          comprobante_url?: string | null;
          estado?: EstadoAportacion;
          validado_por_id?: string | null;
          fecha_validacion?: string | null;
          notas?: string | null;
          notas_admin?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          miembro_id?: string;
          plaza_id?: string;
          tipo?: TipoAportacion;
          monto?: number;
          fecha?: string;
          comprobante_url?: string | null;
          estado?: EstadoAportacion;
          validado_por_id?: string | null;
          fecha_validacion?: string | null;
          notas?: string | null;
          notas_admin?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      recursos: {
        Row: {
          id: string;
          nombre: string;
          tipo: TipoRecurso;
          archivo_url: string;
          plaza_id: string | null;
          visible_todos: boolean | null;
          subido_por_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: TipoRecurso;
          archivo_url: string;
          plaza_id?: string | null;
          visible_todos?: boolean | null;
          subido_por_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          tipo?: TipoRecurso;
          archivo_url?: string;
          plaza_id?: string | null;
          visible_todos?: boolean | null;
          subido_por_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_rol: { Args: Record<string, never>; Returns: Rol };
      auth_plaza: { Args: Record<string, never>; Returns: string };
      touch_updated_at: { Args: Record<string, never>; Returns: unknown };
    };
    Enums: {
      user_role: Rol;
      user_status: EstatusMiembro;
      vinculacion_status: EstatusVinculacion;
      invitado_status: EstatusInvitado;
      aportacion_tipo: TipoAportacion;
      aportacion_status: EstadoAportacion;
      recurso_tipo: TipoRecurso;
    };
    CompositeTypes: Record<string, never>;
  };
};
