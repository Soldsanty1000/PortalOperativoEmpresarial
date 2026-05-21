"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRol } from "@/lib/auth";
import { aportacionSchema, aportacionValidacionSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "application/pdf",
]);

export async function crearAportacion(formData: FormData) {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const parsed = aportacionSchema.safeParse({
    tipo: formData.get("tipo"),
    monto: formData.get("monto"),
    fecha: formData.get("fecha") || new Date().toISOString().slice(0, 10),
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // 1) Validar + subir comprobante PRIMERO (si existe). Evita UPDATE post-insert
  //    que sería bloqueado por RLS (dueño no puede update su propia aportación).
  let comprobante_url: string | undefined;
  const file = formData.get("comprobante") as File | null;
  if (file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: "Archivo mayor a 5 MB" };
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return { error: "Tipo de archivo no permitido (jpg, png, webp, gif, pdf)" };
    }

    const ext = file.name.split(".").pop() ?? "bin";
    const aportId = crypto.randomUUID();
    const path = `${miembro.id}/${aportId}/comprobante.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("comprobantes")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) return { error: `Upload: ${uploadError.message}` };
    comprobante_url = path;

    // 2) Insert con id pre-generado + comprobante_url ya incluido
    const { error: insertError } = await supabase.from("aportaciones").insert({
      id: aportId,
      ...parsed.data,
      miembro_id: miembro.id,
      plaza_id: miembro.plaza_id,
      estado: "por_validar",
      comprobante_url,
    });

    if (insertError) {
      // Rollback: borrar archivo subido
      await supabase.storage.from("comprobantes").remove([path]);
      return { error: insertError.message };
    }
  } else {
    // Sin archivo: insert directo
    const { error: insertError } = await supabase.from("aportaciones").insert({
      ...parsed.data,
      miembro_id: miembro.id,
      plaza_id: miembro.plaza_id,
      estado: "por_validar",
    });
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/aportaciones");
  redirect("/aportaciones");
}

export async function validarAportacion(id: string, formData: FormData) {
  const { miembro } = await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  const parsed = aportacionValidacionSchema.safeParse({
    estado: formData.get("estado"),
    notas_admin: formData.get("notas_admin") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Seguridad extra: el dueño no puede validar la propia (DB también lo bloquea por RLS)
  const { data: aport } = await supabase
    .from("aportaciones")
    .select("miembro_id")
    .eq("id", id)
    .single();

  if (aport?.miembro_id === miembro.id) {
    return { error: "No puedes validar tu propia aportación" };
  }

  const { error } = await supabase
    .from("aportaciones")
    .update({
      ...parsed.data,
      validado_por_id: miembro.id,
      fecha_validacion: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/aportaciones");
  return { ok: true };
}

export async function getComprobanteSignedUrl(path: string) {
  await requireAuth();
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("comprobantes")
    .createSignedUrl(path, 60 * 10); // 10 minutos

  if (error || !data) return { error: error?.message ?? "No disponible" };
  return { url: data.signedUrl };
}
