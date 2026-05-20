"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";
import { plazaSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearPlaza(formData: FormData) {
  await requireRol(["admin"]);
  const supabase = createClient();

  const parsed = plazaSchema.safeParse({
    nombre: formData.get("nombre"),
    ciudad: formData.get("ciudad") || undefined,
    activa: formData.get("activa") === "on",
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("plazas").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/plazas");
  redirect("/admin/plazas");
}

export async function togglePlazaActiva(id: string, activa: boolean) {
  await requireRol(["admin"]);
  const supabase = createClient();

  const { error } = await supabase.from("plazas").update({ activa }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/plazas");
  return { ok: true };
}
