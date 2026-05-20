"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleEstatusMiembro } from "@/app/actions/admin";

export function ToggleEstatusBtn({ id, estatusActual }: { id: string; estatusActual: "activo" | "inactivo" }) {
  const [pending, startTransition] = useTransition();
  const nuevoEstatus = estatusActual === "activo" ? "inactivo" : "activo";

  function onClick() {
    const verbo = nuevoEstatus === "inactivo" ? "desactivar" : "reactivar";
    if (!confirm(`¿${verbo.charAt(0).toUpperCase() + verbo.slice(1)} este miembro?`)) return;
    startTransition(async () => {
      await toggleEstatusMiembro(id, nuevoEstatus);
    });
  }

  return (
    <Button
      variant={estatusActual === "activo" ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "…" : estatusActual === "activo" ? "Desactivar" : "Reactivar"}
    </Button>
  );
}
