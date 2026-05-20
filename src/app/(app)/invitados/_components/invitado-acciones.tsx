"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { actualizarEstatusInvitado } from "@/app/actions/invitados";

const ESTATUS = [
  { value: "prospecto", label: "Prospecto" },
  { value: "asistio", label: "Asistió" },
  { value: "no_asistio", label: "No asistió" },
  { value: "se_integro", label: "Se integró" },
];

export function InvitadoEstatusForm({
  id,
  estatusActual,
  puedeEditar,
}: {
  id: string;
  estatusActual: string;
  puedeEditar: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [estatus, setEstatus] = useState(estatusActual);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!puedeEditar) return null;

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Cambiar estatus
      </Button>
    );
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const res = await actualizarEstatusInvitado(id, estatus);
      if ("error" in res && res.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <div className="space-y-2 w-full">
      <Select value={estatus} onChange={(e) => setEstatus(e.target.value)}>
        {ESTATUS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancelar
        </Button>
        <Button size="sm" onClick={onSave} disabled={pending}>
          {pending ? "…" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
