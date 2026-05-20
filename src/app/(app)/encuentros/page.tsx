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
import { ToggleEncuentroBtn } from "./_components/encuentro-toggle";

export default async function EncuentrosPage() {
  const { miembro } = await requireAuth();
  const puedeCrear = miembro.rol === "admin" || miembro.rol === "licenciatario";
  const supabase = createClient();

  const { data: encuentros } = await supabase
    .from("encuentros")
    .select("*, plaza:plaza_id(nombre)")
    .order("fecha", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="Encuentros"
        description="Sesiones semanales de la Plaza. Solo puede haber uno activo a la vez."
        action={
          puedeCrear ? (
            <Button asChild>
              <Link href="/encuentros/nuevo">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Link>
            </Button>
          ) : null
        }
      />

      {!encuentros || encuentros.length === 0 ? (
        <EmptyState title="Sin encuentros programados" />
      ) : (
        <div className="space-y-3">
          {encuentros.map((e: any) => (
            <Card key={e.id} className={e.activo ? "border-l-4 border-l-accent" : ""}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{formatDate(e.fecha)} · {e.hora}</p>
                      {e.activo && <Badge variant="success">Activo</Badge>}
                    </div>
                    {e.lugar && <p className="text-sm">{e.lugar}</p>}
                    {e.direccion && <p className="text-xs text-muted-foreground">{e.direccion}</p>}
                    {e.notas && <p className="text-sm text-muted-foreground mt-2">{e.notas}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground">{e.plaza?.nombre}</p>
                    {puedeCrear && (
                      <ToggleEncuentroBtn id={e.id} plazaId={e.plaza_id} activo={e.activo} />
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
