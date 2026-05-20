"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { vinculacionSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearVinculacion(formData: FormData) {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const parsed = vinculacionSchema.safeParse({
    para_miembro_id: formData.get("para_miembro_id"),
    contacto_nombre: formData.get("contacto_nombre"),
    contacto_telefono: formData.get("contacto_telefono") || undefined,
    notas: formData.get("notas") || undefined,
    estatus: formData.get("estatus") || "generada",
    monto_negocio: formData.get("monto_negocio") || 0,
    fecha: formData.get("fecha") || new Date().toISOString().slice(0, 10),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { error } = await supabase.from("vinculaciones").insert({
    ...parsed.data,
    de_miembro_id: miembro.id,
    plaza_id: miembro.plaza_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/vinculaciones");
  revalidatePath("/mi-movimiento");
  redirect("/vinculaciones");
}

export async function actualizarEstatusVinculacion(id: string, estatus: string, monto?: number) {
  await requireAuth();
  const supabase = createClient();

  const update: Record<string, unknown> = { estatus };
  if (typeof monto === "number") update.monto_negocio = monto;

  const { error } = await supabase.from("vinculaciones").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/vinculaciones");
  revalidatePath("/mi-movimiento");
  return { ok: true };
}
