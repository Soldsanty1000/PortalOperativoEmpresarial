import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearEncuentro } from "@/app/actions/encuentros";
import { asFormAction } from "@/lib/form-action";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevoEncuentroPage() {
  const { miembro } = await requireRol(["admin", "licenciatario"]);
  const supabase = createClient();

  const { data: plazas } =
    miembro.rol === "admin"
      ? await supabase.from("plazas").select("id, nombre").eq("activa", true).order("nombre")
      : { data: null };

  return (
    <div>
      <PageHeader title="Nuevo encuentro" description="Si se marca como activo, desactiva el anterior de la misma Plaza." />

      <Card>
        <CardContent className="pt-6">
          <form action={asFormAction(crearEncuentro)} className="space-y-4">
            {miembro.rol === "admin" && (
              <FormField label="Plaza" htmlFor="plaza_id">
                <Select id="plaza_id" name="plaza_id" required>
                  <option value="">— Selecciona —</option>
                  {plazas?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Select>
              </FormField>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fecha" htmlFor="fecha">
                <Input id="fecha" name="fecha" type="date" required />
              </FormField>
              <FormField label="Hora" htmlFor="hora">
                <Input id="hora" name="hora" type="time" required />
              </FormField>
            </div>

            <FormField label="Lugar" htmlFor="lugar">
              <Input id="lugar" name="lugar" placeholder="Hotel, restaurante, oficina…" />
            </FormField>

            <FormField label="Dirección" htmlFor="direccion">
              <Input id="direccion" name="direccion" />
            </FormField>

            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" name="notas" rows={3} />
            </FormField>

            <FormField>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="activo" defaultChecked className="h-4 w-4" />
                Marcar como encuentro activo de la Plaza
              </label>
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/encuentros">Cancelar</Link>
              </Button>
              <SubmitButton>Crear encuentro</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
