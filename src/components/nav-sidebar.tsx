"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Link2, Users, UserPlus, Calendar, Compass,
  User, FolderOpen, Wallet, Shield, MapPin, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Rol = "admin" | "licenciatario" | "miembro";

const itemsMiembro = [
  { href: "/mi-movimiento", label: "Mi movimiento", icon: Home },
  { href: "/vinculaciones", label: "Vinculaciones", icon: Link2 },
  { href: "/uno-a-uno",     label: "1 a 1",         icon: Users },
  { href: "/invitados",     label: "Invitados",     icon: UserPlus },
  { href: "/encuentros",    label: "Encuentros",    icon: Calendar },
  { href: "/aportaciones",  label: "Aportaciones",  icon: Wallet },
  { href: "/recursos",      label: "Recursos",      icon: FolderOpen },
  { href: "/explorar-red",  label: "Explorar la red", icon: Compass },
  { href: "/mi-espacio",    label: "Mi espacio",    icon: User },
];

const itemsAdmin = [
  { href: "/admin/miembros", label: "Miembros", icon: Users },
  { href: "/admin/plazas",   label: "Plazas",   icon: MapPin },
];

export function NavSidebar({ rol, nombre, plaza }: { rol: Rol; nombre: string; plaza: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
      <div className="flex flex-col flex-1">
        <div className="px-6 py-5 border-b">
          <h2 className="text-lg font-bold text-primary">Portal Operativo</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{plaza}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {itemsMiembro.map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} active={pathname === href}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}

          {(rol === "admin" || rol === "licenciatario") && (
            <>
              <div className="pt-4 pb-2 px-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Administración
                </p>
              </div>
              {itemsAdmin.map(({ href, label, icon: Icon }) =>
                rol === "admin" || href === "/admin/miembros" ? (
                  <NavLink key={href} href={href} active={pathname === href}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ) : null
              )}
            </>
          )}
        </nav>

        <div className="px-3 py-3 border-t">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{nombre}</p>
            <p className="text-xs text-muted-foreground capitalize">{rol}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent/10 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
