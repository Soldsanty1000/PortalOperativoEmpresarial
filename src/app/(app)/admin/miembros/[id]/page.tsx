import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EditarMiembroForm } from "./form";
import { notFound } from "next/navigation";

export default async function EditarMiembroPage({ params }: { params: { id: string } }) {
  await requireRol(["admin"]);
  const supabase = createClient();

  const [{ data: miembro }, { data: plazas }] = await Promise.all([
    supabase.from("miembros").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("plazas").select("id, nombre").order("nombre"),
  ]);

  if (!miembro) notFound();

  return (
    <div>
      <PageHeader title={`Editar: ${miembro.nombre}`} description="Modifica datos del miembro." />
      <Card>
        <CardContent className="pt-6">
          <EditarMiembroForm miembro={miembro} plazas={plazas ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
