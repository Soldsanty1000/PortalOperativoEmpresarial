import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Link2, UserPlus, TrendingUp } from "lucide-react";
import { RankingCard, type RankingItem } from "./_components/rankings";

const TOP_N = 5;

export default async function MiMovimientoPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const [
    { data: encuentro },
    { count: generadas },
    { count: enGestion },
    { count: cerradas },
    { count: invitados },
    { data: misNegocioRows },
    { data: allCerradas },
    { data: allInvitados },
    { data: allPlazas },
  ] = await Promise.all([
    supabase.from("encuentros").select("*")
      .eq("plaza_id", miembro.plaza_id).eq("activo", true).maybeSingle(),
    supabase.from("vinculaciones").select("id", { count: "exact", head: true })
      .eq("de_miembro_id", miembro.id).eq("estatus", "generada"),
    supabase.from("vinculaciones").select("id", { count: "exact", head: true })
      .eq("de_miembro_id", miembro.id).eq("estatus", "en_gestion"),
    supabase.from("vinculaciones").select("id", { count: "exact", head: true })
      .eq("de_miembro_id", miembro.id).eq("estatus", "cerrada"),
    supabase.from("invitados").select("id", { count: "exact", head: true })
      .eq("invitado_por_id", miembro.id),
    supabase.from("vinculaciones").select("monto_negocio")
      .eq("de_miembro_id", miembro.id).eq("estatus", "cerrada"),
    // Rankings: vinculaciones cerradas globales con monto + autor + plaza
    supabase.from("vinculaciones")
      .select("de_miembro_id, monto_negocio, plaza_id, de:de_miembro_id(nombre)")
      .eq("estatus", "cerrada"),
    // Rankings: invitados globales con autor
    supabase.from("invitados")
      .select("invitado_por_id, por:invitado_por_id(nombre)"),
    supabase.from("plazas").select("id, nombre"),
  ]);

  const negocioTotal = (misNegocioRows ?? []).reduce(
    (sum: number, r: any) => sum + Number(r.monto_negocio || 0),
    0
  );

  // Top vinculaciones cerradas (por count)
  const topCerradas = aggregate(
    allCerradas ?? [],
    (r: any) => r.de_miembro_id,
    (r: any) => r.de?.nombre ?? "—",
    () => 1
  );

  // Top negocio (por suma de monto)
  const topNegocio = aggregate(
    allCerradas ?? [],
    (r: any) => r.de_miembro_id,
    (r: any) => r.de?.nombre ?? "—",
    (r: any) => Number(r.monto_negocio || 0)
  );

  // Top invitados (por count)
  const topInvitados = aggregate(
    allInvitados ?? [],
    (r: any) => r.invitado_por_id,
    (r: any) => r.por?.nombre ?? "—",
    () => 1
  );

  // Top plazas por negocio
  const plazaMap = new Map<string, string>((allPlazas ?? []).map((p: any) => [p.id, p.nombre]));
  const topPlazas = aggregate(
    allCerradas ?? [],
    (r: any) => r.plaza_id,
    (r: any) => plazaMap.get(r.plaza_id) ?? "—",
    (r: any) => Number(r.monto_negocio || 0)
  );

  return (
    <div>
      <PageHeader
        title={`Hola, ${miembro.nombre.split(" ")[0]}`}
        description="Resumen de tu actividad en la red."
      />

      {encuentro && (
        <Card className="mb-6 border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              Próximo encuentro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatDate(encuentro.fecha)} · {encuentro.hora}</p>
            <p className="text-sm text-muted-foreground mt-1">{encuentro.lugar}</p>
            {encuentro.direccion && (
              <p className="text-xs text-muted-foreground mt-0.5">{encuentro.direccion}</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Vinculaciones generadas" value={generadas ?? 0} icon={Link2} />
        <StatCard label="En gestión" value={enGestion ?? 0} icon={Link2} />
        <StatCard label="Cerradas" value={cerradas ?? 0} icon={Link2} />
        <StatCard label="Invitados" value={invitados ?? 0} icon={UserPlus} />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Negocio generado por ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatCurrency(negocioTotal)}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="success">{miembro.estatus}</Badge>
            <span className="text-xs text-muted-foreground">membresía activa</span>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-3">Rankings de la red</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RankingCard titulo="Top miembros por vinculaciones cerradas" items={topCerradas.slice(0, TOP_N)} />
        <RankingCard titulo="Top miembros por negocio generado" items={topNegocio.slice(0, TOP_N)} formato="moneda" />
        <RankingCard titulo="Top miembros por invitados" items={topInvitados.slice(0, TOP_N)} />
        <RankingCard titulo="Top plazas por negocio" items={topPlazas.slice(0, TOP_N)} formato="moneda" />
      </div>
    </div>
  );
}

function aggregate<T>(
  rows: T[],
  idFn: (r: T) => string | null,
  nameFn: (r: T) => string,
  valueFn: (r: T) => number
): RankingItem[] {
  const map = new Map<string, RankingItem>();
  for (const r of rows) {
    const id = idFn(r);
    if (!id) continue;
    const prev = map.get(id);
    const v = valueFn(r);
    if (prev) prev.valor += v;
    else map.set(id, { id, nombre: nameFn(r), valor: v });
  }
  return Array.from(map.values())
    .filter((it) => it.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
