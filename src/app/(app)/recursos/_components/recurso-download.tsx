"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getRecursoSignedUrl, eliminarRecurso } from "@/app/actions/recursos";
import { Download, Trash2, Loader2 } from "lucide-react";

export function DescargarRecursoBtn({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  async function abrir() {
    setLoading(true);
    const res = await getRecursoSignedUrl(path);
    setLoading(false);
    if ("url" in res && res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    else alert(res.error ?? "Error");
  }
  return (
    <Button size="sm" variant="outline" onClick={abrir} disabled={loading}>
      {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
      Descargar
    </Button>
  );
}

export function EliminarRecursoBtn({ id, path }: { id: string; path: string }) {
  const [loading, setLoading] = useState(false);
  async function confirmar() {
    if (!confirm("¿Eliminar este recurso? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const res = await eliminarRecurso(id, path);
    setLoading(false);
    if ("error" in res && res.error) alert(res.error);
  }
  return (
    <Button size="sm" variant="ghost" onClick={confirmar} disabled={loading} className="text-destructive">
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
