"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { validarAportacion, getComprobanteSignedUrl } from "@/app/actions/aportaciones";
import { ExternalLink, Loader2 } from "lucide-react";

export function VerComprobanteButton({ path }: { path: string | null }) {
  const [loading, setLoading] = useState(false);

  if (!path) return <span className="text-xs text-muted-foreground">Sin comprobante</span>;

  async function abrir() {
    setLoading(true);
    const res = await getComprobanteSignedUrl(path!);
    setLoading(false);
    if ("url" in res && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    else alert(res.error ?? "Error");
  }

  return (
    <Button size="sm" variant="outline" onClick={abrir} disabled={loading}>
      {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ExternalLink className="h-3 w-3 mr-1" />}
      Ver comprobante
    </Button>
  );
}

export function ValidarAportacionForm({
  id,
  estadoActual,
  esPropia,
}: {
  id: string;
  estadoActual: string;
  esPropia: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [estado, setEstado] = useState(estadoActual);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (esPropia) {
    return <p className="text-xs text-muted-foreground italic">No puedes validar la tuya</p>;
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Validar
      </Button>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.append("estado", estado);
    fd.append("notas_admin", notas);
    startTransition(async () => {
      const res = await validarAportacion(id, fd);
      if ("error" in res && res.error) setError(res.error);
      else setOpen(false);
    });
  }

  return (
    <Card className="mt-3 bg-muted/30">
      <CardContent className="p-3 space-y-2">
        <form onSubmit={onSubmit} className="space-y-2">
          <Select value={estado} onChange={(e) => setEstado(e.target.value)} className="h-9">
            <option value="por_validar">Por validar</option>
            <option value="confirmado">Confirmado</option>
            <option value="revisar">Revisar</option>
            <option value="rechazado">Rechazado</option>
          </Select>
          <Textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Notas (opcional)"
            className="text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Aplicar"}
            </Button>
            <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
