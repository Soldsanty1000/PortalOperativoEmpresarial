import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminPlazasPage() {
  await requireRol(["admin"]);
  const supabase = createClient();

  const { data: plazas } = await supabase
    .from("plazas")
    .select("*, miembros:miembros(count)")
    .order("nombre");

  return (
    <div>
      <PageHeader
        title="Plazas"
        description="Estructura territorial de la red. Solo Admin."
        action={
          <Button asChild>
            <Link href="/admin/plazas/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        }
      />

      {!plazas || plazas.length === 0 ? (
        <EmptyState title="Sin plazas registradas" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plazas.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    {p.ciudad && <p className="text-sm text-muted-foreground">{p.ciudad}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {p.miembros?.[0]?.count ?? 0} miembros
                    </p>
                  </div>
                  <Badge variant={p.activa ? "success" : "secondary"}>
                    {p.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
