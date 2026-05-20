import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { GIROS } from "@/lib/constants";

export default async function ExplorarRedPage({
  searchParams,
}: {
  searchParams: { q?: string; plaza?: string; giro?: string };
}) {
  await requireAuth();
  const supabase = createClient();

  let query = supabase
    .from("miembros")
    .select("*, plaza:plaza_id(nombre, ciudad)")
    .eq("estatus", "activo")
    .order("nombre");

  if (searchParams.q) {
    query = query.or(
      `nombre.ilike.%${searchParams.q}%,empresa.ilike.%${searchParams.q}%,giro.ilike.%${searchParams.q}%`
    );
  }
  if (searchParams.giro) query = query.eq("giro", searchParams.giro);
  if (searchParams.plaza) query = query.eq("plaza_id", searchParams.plaza);

  const [{ data: miembros }, { data: plazas }] = await Promise.all([
    query.limit(100),
    supabase.from("plazas").select("id, nombre").eq("activa", true).order("nombre"),
  ]);

  return (
    <div>
      <PageHeader
        title="Explorar la red"
        description="Directorio nacional de miembros activos. Para networking y generación de negocio."
      />

      <form className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input name="q" defaultValue={searchParams.q ?? ""} placeholder="Buscar nombre, empresa o giro…" className="flex-1" />
        <Select name="plaza" defaultValue={searchParams.plaza ?? ""} className="sm:max-w-[180px]">
          <option value="">Todas las plazas</option>
          {(plazas ?? []).map((p: any) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </Select>
        <Select name="giro" defaultValue={searchParams.giro ?? ""} className="sm:max-w-[180px]">
          <option value="">Todos los giros</option>
          {GIROS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Select>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
          Buscar
        </button>
      </form>

      {!miembros || miembros.length === 0 ? (
        <EmptyState title="Sin resultados" description="Ajusta los filtros e intenta de nuevo." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {miembros.map((m: any) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{m.nombre}</p>
                    {m.empresa && <p className="text-sm text-muted-foreground">{m.empresa}</p>}
                    {m.giro && <p className="text-xs text-muted-foreground mt-1">{m.giro}</p>}
                  </div>
                  <Badge variant="outline">{m.plaza?.nombre}</Badge>
                </div>
                {m.descripcion_negocio && (
                  <p className="text-sm mt-3 text-muted-foreground line-clamp-2">{m.descripcion_negocio}</p>
                )}
                <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                  {m.telefono && <span>{m.telefono}</span>}
                  {m.correo && <span className="truncate">{m.correo}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
