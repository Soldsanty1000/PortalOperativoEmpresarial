import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearVinculacion } from "@/app/actions/vinculaciones";
import { asFormAction } from "@/lib/form-action";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevaVinculacionPage() {
  const { miembro } = await requireAuth();
  const supabase = createClient();

  // Para "para": cualquier miembro activo (RLS lo permite)
  const { data: miembros } = await supabase
    .from("miembros")
    .select("id, nombre, plaza:plaza_id(nombre)")
    .eq("estatus", "activo")
    .neq("id", miembro.id)
    .order("nombre");

  return (
    <div>
      <PageHeader title="Nueva vinculación" description="Registra una oportunidad de negocio." />

      <Card>
        <CardContent className="pt-6">
          <form action={asFormAction(crearVinculacion)} className="space-y-4">
            <FormField label="Para (miembro)" htmlFor="para_miembro_id">
              <Select id="para_miembro_id" name="para_miembro_id" required>
                <option value="">— Selecciona —</option>
                {miembros?.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.plaza?.nombre})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Nombre del contacto" htmlFor="contacto_nombre">
              <Input id="contacto_nombre" name="contacto_nombre" required minLength={2} />
            </FormField>

            <FormField label="Teléfono del contacto" htmlFor="contacto_telefono">
              <Input id="contacto_telefono" name="contacto_telefono" type="tel" />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fecha" htmlFor="fecha">
                <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              </FormField>
              <FormField label="Estatus" htmlFor="estatus">
                <Select id="estatus" name="estatus" defaultValue="generada">
                  <option value="generada">Generada</option>
                  <option value="en_gestion">En gestión</option>
                  <option value="cerrada">Cerrada</option>
                </Select>
              </FormField>
            </div>

            <FormField label="Monto de negocio (MXN)" htmlFor="monto_negocio" hint="Solo aplica si está cerrada">
              <Input id="monto_negocio" name="monto_negocio" type="number" step="0.01" min="0" defaultValue="0" />
            </FormField>

            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" name="notas" rows={3} />
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/vinculaciones">Cancelar</Link>
              </Button>
              <SubmitButton>Guardar vinculación</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
