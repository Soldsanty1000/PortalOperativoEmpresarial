import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { DescargarRecursoBtn, EliminarRecursoBtn } from "./_components/recurso-download";

export default async function RecursosPage() {
  const { miembro } = await requireAuth();
  const puedeSubir = miembro.rol === "admin" || miembro.rol === "licenciatario";
  const supabase = createClient();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("*, plaza:plaza_id(nombre), subido_por:subido_por_id(nombre)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Recursos"
        description="Repositorio interno de documentos, guías y presentaciones."
        action={
          puedeSubir ? (
            <Button asChild>
              <Link href="/recursos/nuevo">
                <Plus className="h-4 w-4 mr-1" />
                Subir
              </Link>
            </Button>
          ) : null
        }
      />

      {!recursos || recursos.length === 0 ? (
        <EmptyState title="Sin recursos disponibles" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recursos.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-start gap-3">
                <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.nombre}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">{r.tipo}</Badge>
                    {r.visible_todos ? (
                      <span className="text-xs text-accent font-medium">Nacional</span>
                    ) : (
                      r.plaza && <span className="text-xs text-muted-foreground">{r.plaza.nombre}</span>
                    )}
                  </div>
                  {r.subido_por?.nombre && (
                    <p className="text-xs text-muted-foreground mt-1">Subido por: {r.subido_por.nombre}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <DescargarRecursoBtn path={r.archivo_url} />
                    {puedeSubir && <EliminarRecursoBtn id={r.id} path={r.archivo_url} />}
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
