import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NavSidebar } from "@/components/nav-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { miembro } = await requireAuth();
  const supabase = createClient();
  const { data: plaza } = await supabase
    .from("plazas")
    .select("nombre")
    .eq("id", miembro.plaza_id)
    .maybeSingle();

  const plazaNombre = plaza?.nombre ?? "—";

  const mobileItems = [
    { href: "/mi-movimiento", label: "Mi movimiento" },
    { href: "/vinculaciones", label: "Vinculaciones" },
    { href: "/uno-a-uno",     label: "1 a 1" },
    { href: "/invitados",     label: "Invitados" },
    { href: "/encuentros",    label: "Encuentros" },
    { href: "/aportaciones",  label: "Aportaciones" },
    { href: "/recursos",      label: "Recursos" },
    { href: "/explorar-red",  label: "Explorar la red" },
    { href: "/mi-espacio",    label: "Mi espacio" },
    ...(miembro.rol === "admin" || miembro.rol === "licenciatario"
      ? [{ href: "/admin/miembros", label: "Miembros" }]
      : []),
    ...(miembro.rol === "admin" ? [{ href: "/admin/plazas", label: "Plazas" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavSidebar rol={miembro.rol} nombre={miembro.nombre} plaza={plazaNombre} />
      <MobileNav items={mobileItems} plaza={plazaNombre} />
      <main className="md:pl-64">
        <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
