import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Rol = "admin" | "licenciatario" | "miembro";

export const getSessionUser = cache(async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const uid = session.access_token
    ? JSON.parse(atob(session.access_token.split(".")[1])).sub
    : null;
  if (!uid) return null;

  const { data: miembro } = await supabase
    .from("miembros")
    .select("*")
    .eq("id", uid)
    .maybeSingle();

  return miembro ? { miembro } : null;
});

export async function requireAuth() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireRol(roles: Rol[]) {
  const session = await requireAuth();
  if (!roles.includes(session.miembro.rol as Rol)) {
    redirect("/mi-movimiento");
  }
  return session;
}
