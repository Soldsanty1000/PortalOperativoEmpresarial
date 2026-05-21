import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearUnoAUno } from "@/app/actions/uno-a-uno";
import { asFormAction } from "@/lib/form-action";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevoUnoAUnoPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, plaza:plaza_id(nombre)")
    .eq("estatus", "activo")
    .neq("id", miembro.id)
    .order("nombre");

  return (
    <div>
      <PageHeader title="Nueva reunión 1 a 1" />

      <Card>
        <CardContent className="pt-6">
          <form action={asFormAction(crearUnoAUno)} className="space-y-4">
            <FormField label="Con quién" htmlFor="con_quien_id">
              <Select id="con_quien_id" name="con_quien_id" required>
                <option value="">— Selecciona —</option>
                {miembros?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.plaza?.nombre})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Fecha" htmlFor="fecha">
              <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </FormField>

            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" name="notas" rows={4} placeholder="Temas tratados, acuerdos…" />
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/uno-a-uno">Cancelar</Link>
              </Button>
              <SubmitButton>Guardar reunión</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
