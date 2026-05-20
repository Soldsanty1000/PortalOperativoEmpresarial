"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";
import { recursoTipoEnum } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function crearRecurso(formData: FormData) {
  const { miembro } = await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  const nombre = (formData.get("nombre") as string)?.trim();
  const tipoRaw = formData.get("tipo");
  const visible_todos = formData.get("visible_todos") === "on";
  const file = formData.get("archivo") as File | null;

  if (!nombre || nombre.length < 2) return { error: "Nombre requerido (mín. 2)" };

  const tipoParsed = recursoTipoEnum.safeParse(tipoRaw);
  if (!tipoParsed.success) return { error: "Tipo inválido" };

  if (!file || file.size === 0) return { error: "Archivo requerido" };
  if (file.size > MAX_FILE_BYTES) return { error: "Archivo mayor a 20 MB" };

  // Licenciatario: solo su plaza. Admin: usa la suya o forma elige (simplificado: su plaza)
  // Para nacional (visible_todos), licenciatario no puede.
  if (visible_todos && miembro.rol !== "admin") {
    return { error: "Solo Admin puede subir recursos nacionales" };
  }

  const plaza_id = visible_todos ? null : miembro.plaza_id;
  const folder = visible_todos ? "nacional" : plaza_id;
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${Date.now()}-${nombre.replace(/[^a-z0-9]/gi, "_").slice(0, 40)}.${ext}`;
  const path = `${folder}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("recursos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) return { error: `Upload: ${uploadError.message}` };

  const { error: insertError } = await supabase.from("recursos").insert({
    nombre,
    tipo: tipoParsed.data,
    archivo_url: path,
    plaza_id,
    visible_todos,
    subido_por_id: miembro.id,
  });

  if (insertError) {
    await supabase.storage.from("recursos").remove([path]);
    return { error: insertError.message };
  }

  revalidatePath("/recursos");
  redirect("/recursos");
}

export async function getRecursoSignedUrl(path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("recursos")
    .createSignedUrl(path, 60 * 10);

  if (error || !data) return { error: error?.message ?? "No disponible" };
  return { url: data.signedUrl };
}

export async function eliminarRecurso(id: string, path: string) {
  await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  await supabase.storage.from("recursos").remove([path]);
  const { error } = await supabase.from("recursos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/recursos");
  return { ok: true };
}
