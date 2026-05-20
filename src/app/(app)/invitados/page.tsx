import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { InvitadoEstatusForm } from "./_components/invitado-acciones";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  asistio: "success",
  no_asistio: "destructive",
  prospecto: "warning",
  se_integro: "default",
};

export default async function InvitadosPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const { data: invitados } = await supabase
    .from("invitados")
    .select("*, por:invitado_por_id(nombre)")
    .order("fecha", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="Invitados"
        description="Historial y seguimiento de invitados."
        action={
          <Button asChild>
            <Link href="/invitados/nuevo">
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Link>
          </Button>
        }
      />

      {!invitados || invitados.length === 0 ? (
        <EmptyState title="Sin invitados registrados" />
      ) : (
        <div className="space-y-3">
          {invitados.map((i: any) => (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{i.nombre}</p>
                    {i.empresa && (
                      <p className="text-sm text-muted-foreground">
                        {i.empresa} {i.giro && `· ${i.giro}`}
                      </p>
                    )}
                    {i.telefono && <p className="text-xs text-muted-foreground mt-1">{i.telefono}</p>}
                    <p className="text-xs text-muted-foreground mt-2">Invitado por: {i.por?.nombre}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:min-w-[200px]">
                    <Badge variant={STATUS_VARIANT[i.estatus] ?? "default"}>
                      {i.estatus.replace("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{formatDate(i.fecha)}</p>
                    <InvitadoEstatusForm
                      id={i.id}
                      estatusActual={i.estatus}
                      puedeEditar={
                        i.invitado_por_id === miembro.id ||
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
