"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { miembroEditPerfilSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function actualizarPerfil(formData: FormData) {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const parsed = miembroEditPerfilSchema.safeParse({
    empresa: formData.get("empresa") || undefined,
    giro: formData.get("giro") || undefined,
    telefono: formData.get("telefono") || undefined,
    descripcion_negocio: formData.get("descripcion_negocio") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase
    .from("miembros")
    .update(parsed.data)
    .eq("id", miembro.id);

  if (error) return { error: error.message };

  revalidatePath("/mi-espacio");
  return { ok: true };
}
