"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { unoAUnoSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearUnoAUno(formData: FormData) {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const parsed = unoAUnoSchema.safeParse({
    con_quien_id: formData.get("con_quien_id"),
    fecha: formData.get("fecha"),
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { error } = await supabase.from("uno_a_uno").insert({
    ...parsed.data,
    miembro_id: miembro.id,
    plaza_id: miembro.plaza_id,
  });

  if (error) return { error: error.message };

  revalidatePath("/uno-a-uno");
  redirect("/uno-a-uno");
}
