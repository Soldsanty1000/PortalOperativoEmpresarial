"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";
import { miembroSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// Crear miembro (genera usuario en auth + fila en miembros)
// Solo Admin. Service role bypassa RLS.
export async function crearMiembro(formData: FormData) {
  await requireRol(["admin"]);

  const parsed = miembroSchema.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    empresa: formData.get("empresa") || undefined,
    giro: formData.get("giro") || undefined,
    telefono: formData.get("telefono") || undefined,
    plaza_id: formData.get("plaza_id"),
    rol: formData.get("rol") || "miembro",
    estatus: formData.get("estatus") || "activo",
    descripcion_negocio: formData.get("descripcion_negocio") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const passwordTemp = formData.get("password")?.toString() || generarPassword();
  const admin = createServiceClient();

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: parsed.data.correo,
    password: passwordTemp,
    email_confirm: true,
  });

  if (userError || !userData.user) {
    return { error: userError?.message ?? "No se pudo crear el usuario" };
  }

  const { error: miembroError } = await admin.from("miembros").insert({
    id: userData.user.id,
    ...parsed.data,
  });

  if (miembroError) {
    await admin.auth.admin.deleteUser(userData.user.id);
    return { error: miembroError.message };
  }

  revalidatePath("/admin/miembros");
  return { ok: true, passwordTemp };
}

function generarPassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

// Editar miembro (campos administrativos completos)
export async function actualizarMiembro(id: string, formData: FormData) {
  await requireRol(["admin"]);

  const parsed = miembroSchema.safeParse({
    nombre: formData.get("nombre"),
    correo: formData.get("correo"),
    empresa: formData.get("empresa") || undefined,
    giro: formData.get("giro") || undefined,
    telefono: formData.get("telefono") || undefined,
    plaza_id: formData.get("plaza_id"),
    rol: formData.get("rol") || "miembro",
    estatus: formData.get("estatus") || "activo",
    descripcion_negocio: formData.get("descripcion_negocio") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const admin = createServiceClient();
  const { error } = await admin.from("miembros").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/miembros");
  revalidatePath(`/admin/miembros/${id}`);
  return { ok: true };
}

// Toggle estatus activo/inactivo (no borra)
export async function toggleEstatusMiembro(id: string, nuevoEstatus: "activo" | "inactivo") {
  await requireRol(["admin"]);
  const admin = createServiceClient();
  const { error } = await admin.from("miembros").update({ estatus: nuevoEstatus }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/miembros");
  return { ok: true };
}

// Reset password (genera nueva temporal)
export async function resetPasswordMiembro(id: string) {
  await requireRol(["admin"]);
  const admin = createServiceClient();
  const passwordTemp = generarPassword();

  const { error } = await admin.auth.admin.updateUserById(id, { password: passwordTemp });
  if (error) return { error: error.message };

  return { ok: true, passwordTemp };
}
