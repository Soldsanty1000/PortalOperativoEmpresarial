import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { VinculacionEstatusForm } from "./_components/vinculacion-acciones";

const STATUS_VARIANT: Record<string, "default" | "warning" | "success"> = {
  generada: "default",
  en_gestion: "warning",
  cerrada: "success",
};

export default async function VinculacionesPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const { data: vinculaciones } = await supabase
    .from("vinculaciones")
    .select("*, de:de_miembro_id(nombre), para:para_miembro_id(nombre)")
    .order("fecha", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="Vinculaciones"
        description="Oportunidades de negocio generadas entre miembros."
        action={
          <Button asChild>
            <Link href="/vinculaciones/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        }
      />

      {!vinculaciones || vinculaciones.length === 0 ? (
        <EmptyState title="Sin vinculaciones aún" description="Registra tu primera vinculación." />
      ) : (
        <div className="space-y-3">
          {vinculaciones.map((v: any) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{v.contacto_nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.de?.nombre} → {v.para?.nombre}
                    </p>
                    {v.contacto_telefono && (
                      <p className="text-xs text-muted-foreground mt-1">{v.contacto_telefono}</p>
                    )}
                    {v.notas && <p className="text-sm mt-2">{v.notas}</p>}
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1 sm:min-w-[200px]">
                    <Badge variant={STATUS_VARIANT[v.estatus] ?? "default"}>
                      {v.estatus.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{formatDate(v.fecha)}</p>
                    {v.monto_negocio > 0 && (
                      <p className="text-sm font-semibold text-accent">
                        {formatCurrency(Number(v.monto_negocio))}
                      </p>
                    )}
                    <VinculacionEstatusForm
                      id={v.id}
                      estatusActual={v.estatus}
                      montoActual={Number(v.monto_negocio ?? 0)}
                      puedeEditar={
                        v.de_miembro_id === miembro.id ||
                        miembro.rol === "admin" ||
                        miembro.rol === "licenciatario"
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
