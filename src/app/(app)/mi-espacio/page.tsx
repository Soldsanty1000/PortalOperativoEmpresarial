import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { PerfilForm } from "./_components/perfil-form";

export default async function MiEspacioPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();
  const { data: plaza } = await supabase
    .from("plazas")
    .select("nombre, ciudad")
    .eq("id", miembro.plaza_id)
    .maybeSingle();

  return (
    <div>
      <PageHeader title="Mi espacio" description="Tu perfil en la red." />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{miembro.nombre}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Empresa" value={miembro.empresa ?? "—"} />
          <Field label="Giro" value={miembro.giro ?? "—"} />
          <Field label="Teléfono" value={miembro.telefono ?? "—"} />
          <Field label="Correo" value={miembro.correo} />
          <Field label="Descripción del negocio" value={miembro.descripcion_negocio ?? "—"} />

          <PerfilForm
            inicial={{
              empresa: miembro.empresa,
              giro: miembro.giro,
              telefono: miembro.telefono,
              descripcion_negocio: miembro.descripcion_negocio,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de membresía</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Plaza" value={`${plaza?.nombre ?? "—"}${plaza?.ciudad ? ` · ${plaza.ciudad}` : ""}`} />
          <Field label="Rol" value={<span className="capitalize">{miembro.rol}</span>} />
          <Field
            label="Estatus"
            value={<Badge variant={miembro.estatus === "activo" ? "success" : "secondary"}>{miembro.estatus}</Badge>}
          />
          {miembro.fecha_inicio && <Field label="Inicio" value={formatDate(miembro.fecha_inicio)} />}
          {miembro.fecha_fin && <Field label="Fin" value={formatDate(miembro.fecha_fin)} />}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-4">
        Plaza, rol, estatus y fechas solo pueden ser modificados por Administración.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4 pb-3 border-b last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
