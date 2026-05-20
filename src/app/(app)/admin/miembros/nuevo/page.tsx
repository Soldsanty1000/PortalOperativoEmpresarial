import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { NuevoMiembroForm } from "./form";

export default async function NuevoMiembroPage() {
  await requireRol(["admin"]);
  const supabase = createClient();

  const { data: plazas } = await supabase
    .from("plazas")
    .select("id, nombre")
    .eq("activa", true)
    .order("nombre");

  return (
    <div>
      <PageHeader
        title="Nuevo miembro"
        description="Crea el usuario en Auth y su ficha en la red. Se genera contraseña temporal."
      />

      <Card>
        <CardContent className="pt-6">
          <NuevoMiembroForm plazas={plazas ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
