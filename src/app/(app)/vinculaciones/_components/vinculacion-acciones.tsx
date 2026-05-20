"use client";

import { useState, useTransition } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { actualizarEstatusVinculacion } from "@/app/actions/vinculaciones";

const ESTATUS = [
  { value: "generada", label: "Generada" },
  { value: "en_gestion", label: "En gestión" },
  { value: "cerrada", label: "Cerrada" },
];

export function VinculacionEstatusForm({
  id,
  estatusActual,
  montoActual,
  puedeEditar,
}: {
  id: string;
  estatusActual: string;
  montoActual: number;
  puedeEditar: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [estatus, setEstatus] = useState(estatusActual);
  const [monto, setMonto] = useState(String(montoActual ?? 0));
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
      const m = estatus === "cerrada" ? Number(monto) || 0 : undefined;
      const res = await actualizarEstatusVinculacion(id, estatus, m);
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
      {estatus === "cerrada" && (
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Monto cerrado"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      )}
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
