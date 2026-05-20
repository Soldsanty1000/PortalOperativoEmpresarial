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
import {
  VerComprobanteButton,
  ValidarAportacionForm,
} from "./_components/aportacion-acciones";

const STATUS_VARIANT: Record<string, "warning" | "success" | "destructive" | "default"> = {
  por_validar: "warning",
  confirmado: "success",
  rechazado: "destructive",
  revisar: "default",
};

export default async function AportacionesPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const { data: aportaciones } = await supabase
    .from("aportaciones")
    .select("*, miembro:miembro_id(nombre), validador:validado_por_id(nombre)")
    .order("created_at", { ascending: false })
    .limit(100);

  const puedeValidar = miembro.rol === "admin" || miembro.rol === "licenciatario";

  return (
    <div>
      <PageHeader
        title="Aportaciones"
        description="Control interno de membresías y sesiones."
        action={
          <Button asChild>
            <Link href="/aportaciones/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        }
      />

      {!aportaciones || aportaciones.length === 0 ? (
        <EmptyState title="Sin aportaciones registradas" description="Registra tu primera aportación." />
      ) : (
        <div className="space-y-3">
          {aportaciones.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{a.miembro?.nombre}</p>
                    <p className="text-sm text-muted-foreground capitalize">{a.tipo}</p>
                    {a.notas && <p className="text-sm mt-2">{a.notas}</p>}
                    {a.notas_admin && (
                      <p className="text-xs italic text-muted-foreground mt-1">
                        Admin: {a.notas_admin}
                      </p>
                    )}
                    {a.validador?.nombre && a.estado !== "por_validar" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Validado por {a.validador.nombre} · {formatDate(a.fecha_validacion ?? a.created_at)}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <VerComprobanteButton path={a.comprobante_url} />
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 sm:min-w-[180px]">
                    <p className="text-lg font-semibold">{formatCurrency(Number(a.monto))}</p>
                    <Badge variant={STATUS_VARIANT[a.estado] ?? "default"}>
                      {a.estado.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{formatDate(a.fecha)}</p>
                    {puedeValidar && (
                      <ValidarAportacionForm
                        id={a.id}
                        estadoActual={a.estado}
                        esPropia={a.miembro_id === miembro.id}
                      />
                    )}
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
