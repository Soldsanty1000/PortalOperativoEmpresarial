// Tipado base de DB. Generar con:
//   npx supabase gen types typescript --project-id YOUR_PROJECT > src/lib/supabase/types.ts
// Mientras tanto, tipo permisivo para no bloquear desarrollo.

export type Database = {
  public: {
    Tables: {
      plazas: {
        Row: {
          id: string;
          nombre: string;
          ciudad: string | null;
          activa: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["plazas"]["Row"]> & { nombre: string };
        Update: Partial<Database["public"]["Tables"]["plazas"]["Row"]>;
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
          rol: "admin" | "licenciatario" | "miembro";
          estatus: "activo" | "inactivo";
          descripcion_negocio: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["miembros"]["Row"]> & {
          id: string;
          nombre: string;
          correo: string;
          plaza_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["miembros"]["Row"]>;
      };
      vinculaciones: { Row: any; Insert: any; Update: any };
      uno_a_uno:     { Row: any; Insert: any; Update: any };
      invitados:     { Row: any; Insert: any; Update: any };
      encuentros:    { Row: any; Insert: any; Update: any };
      aportaciones:  { Row: any; Insert: any; Update: any };
      recursos:      { Row: any; Insert: any; Update: any };
    };
    Functions: {
      auth_rol:   { Args: Record<string, never>; Returns: "admin" | "licenciatario" | "miembro" };
      auth_plaza: { Args: Record<string, never>; Returns: string };
    };
  };
};
