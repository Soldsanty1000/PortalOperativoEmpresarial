import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { ToggleEstatusBtn } from "./_components/miembro-acciones";

export default async function AdminMiembrosPage() {
  const { miembro: me } = await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  const { data: miembros } = await supabase
    .from("miembros")
    .select("*, plaza:plaza_id(nombre)")
    .order("nombre");

  return (
    <div>
      <PageHeader
        title="Miembros"
        description="Gestión de miembros. Admin: todos. Licenciatario: solo su Plaza."
        action={
          me.rol === "admin" ? (
            <Button asChild>
              <Link href="/admin/miembros/nuevo">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Link>
            </Button>
          ) : null
        }
      />

      {!miembros || miembros.length === 0 ? (
        <EmptyState title="Sin miembros registrados" />
      ) : (
        <div className="space-y-3">
          {miembros.map((m: any) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{m.nombre}</p>
                    <p className="text-sm text-muted-foreground">{m.correo}</p>
                    {m.empresa && <p className="text-xs text-muted-foreground mt-1">{m.empresa}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="capitalize">{m.rol}</Badge>
                      <Badge variant={m.estatus === "activo" ? "success" : "secondary"}>{m.estatus}</Badge>
                      <p className="text-xs text-muted-foreground">{m.plaza?.nombre}</p>
                    </div>
                    {me.rol === "admin" && (
                      <div className="flex gap-2 mt-1">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/miembros/${m.id}`}>
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Link>
                        </Button>
                        <ToggleEstatusBtn id={m.id} estatusActual={m.estatus} />
                      </div>
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
