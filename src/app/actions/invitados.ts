"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { invitadoSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearInvitado(formData: FormData) {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const parsed = invitadoSchema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono") || undefined,
    empresa: formData.get("empresa") || undefined,
    giro: formData.get("giro") || undefined,
    fecha: formData.get("fecha") || new Date().toISOString().slice(0, 10),
    estatus: formData.get("estatus") || "prospecto",
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("invitados").insert({
    ...parsed.data,
    invitado_por_id: miembro.id,
    plaza_id: miembro.plaza_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/invitados");
  revalidatePath("/mi-movimiento");
  redirect("/invitados");
}

export async function actualizarEstatusInvitado(id: string, estatus: string) {
  await requireAuth();
  const supabase = createClient();

  const { error } = await supabase.from("invitados").update({ estatus }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/invitados");
  return { ok: true };
}
