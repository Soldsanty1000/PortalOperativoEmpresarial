"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { validarAportacion, getComprobanteSignedUrl } from "@/app/actions/aportaciones";
import { Eye, Loader2, X, ExternalLink } from "lucide-react";

export function VerComprobanteButton({ path }: { path: string | null }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  if (!path) return <span className="text-xs text-muted-foreground">Sin comprobante</span>;

  const isPdf = path.toLowerCase().endsWith(".pdf");

  async function abrir() {
    setLoading(true);
    try {
      const res = await getComprobanteSignedUrl(path!);
      if ("url" in res && res.url) setUrl(res.url);
      else alert("Error: " + ((res as any).error ?? "desconocido"));
    } catch (e: any) {
      alert("Excepción: " + (e?.message ?? String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={abrir} disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
        Ver comprobante
      </Button>
      {url && (
        <ComprobanteModal url={url} isPdf={isPdf} onClose={() => setUrl(null)} />
      )}
    </>
  );
}

function ComprobanteModal({ url, isPdf, onClose }: { url: string; isPdf: boolean; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => { e.stopPropagation(); window.open(url, "_blank", "noopener,noreferrer"); }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Abrir en pestaña
        </Button>
        <Button size="sm" variant="secondary" onClick={onClose}>
          <X className="h-4 w-4 mr-1" />
          Cerrar (Esc)
        </Button>
      </div>
      <div
        className="max-w-[95vw] max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe src={url} className="w-full h-full bg-white rounded-md" title="Comprobante" />
        ) : (
          <img src={url} alt="Comprobante" className="max-w-full max-h-full object-contain rounded-md" />
        )}
      </div>
    </div>
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
