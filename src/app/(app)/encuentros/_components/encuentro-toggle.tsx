"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleEncuentroActivo } from "@/app/actions/encuentros";

export function ToggleEncuentroBtn({
  id,
  plazaId,
  activo,
}: {
  id: string;
  plazaId: string;
  activo: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const accion = activo ? "desactivar" : "marcar como activo";
    if (!confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} este encuentro? Esto desactivará otro encuentro activo en la misma plaza.`)) return;
    startTransition(async () => {
      await toggleEncuentroActivo(id, plazaId, !activo);
    });
  }

  return (
    <Button
      variant={activo ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "…" : activo ? "Desactivar" : "Activar"}
    </Button>
  );
}
