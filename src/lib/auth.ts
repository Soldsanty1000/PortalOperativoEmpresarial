import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Database } from "./supabase/types";

export type Rol = "admin" | "licenciatario" | "miembro";
export type Miembro = Database["public"]["Tables"]["miembros"]["Row"];

export const getSessionUser = cache(async (): Promise<{ miembro: Miembro } | null> => {
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

  return miembro ? { miembro: miembro as Miembro } : null;
});

export async function requireAuth(): Promise<{ miembro: Miembro }> {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireRol(roles: Rol[]): Promise<{ miembro: Miembro }> {
  const session = await requireAuth();
  if (!roles.includes(session.miembro.rol as Rol)) {
    redirect("/mi-movimiento");
  }
  return session;
}
