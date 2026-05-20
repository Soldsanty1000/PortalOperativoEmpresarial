import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function UnoAUnoPage() {
  await requireAuth();
  const supabase = createClient();

  const { data: reuniones } = await supabase
    .from("uno_a_uno")
    .select("*, miembro:miembro_id(nombre), con_quien:con_quien_id(nombre)")
    .order("fecha", { ascending: false })
    .limit(50);

  return (
    <div>
      <PageHeader
        title="1 a 1"
        description="Reuniones registradas entre miembros."
        action={
          <Button asChild>
            <Link href="/uno-a-uno/nueva">
              <Plus className="h-4 w-4 mr-1" />
              Nueva
            </Link>
          </Button>
        }
      />

      {!reuniones || reuniones.length === 0 ? (
        <EmptyState title="Sin reuniones registradas" />
      ) : (
        <div className="space-y-3">
          {reuniones.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {r.miembro?.nombre} ↔ {r.con_quien?.nombre}
                    </p>
                    {r.notas && <p className="text-sm text-muted-foreground mt-1">{r.notas}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(r.fecha)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
