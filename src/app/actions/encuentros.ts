"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";
import { encuentroSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearEncuentro(formData: FormData) {
  const { miembro } = await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  const plaza_id =
    miembro.rol === "admin"
      ? (formData.get("plaza_id") as string)
      : miembro.plaza_id;

  const activo = formData.get("activo") === "on";

  const parsed = encuentroSchema.safeParse({
    plaza_id,
    fecha: formData.get("fecha"),
    hora: formData.get("hora"),
    lugar: formData.get("lugar") || undefined,
    direccion: formData.get("direccion") || undefined,
    notas: formData.get("notas") || undefined,
    activo,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Si se marca activo, desactivar el anterior activo de la misma plaza
  if (parsed.data.activo) {
    await supabase
      .from("encuentros")
      .update({ activo: false })
      .eq("plaza_id", parsed.data.plaza_id)
      .eq("activo", true);
  }

  const { error } = await supabase.from("encuentros").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/encuentros");
  revalidatePath("/mi-movimiento");
  redirect("/encuentros");
}

export async function toggleEncuentroActivo(id: string, plaza_id: string, activo: boolean) {
  await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  if (activo) {
    await supabase
      .from("encuentros")
      .update({ activo: false })
      .eq("plaza_id", plaza_id)
      .eq("activo", true)
      .neq("id", id);
  }

  const { error } = await supabase.from("encuentros").update({ activo }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/encuentros");
  revalidatePath("/mi-movimiento");
  return { ok: true };
}
