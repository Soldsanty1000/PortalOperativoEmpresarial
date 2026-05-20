import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { GiroSelect } from "@/components/giro-select";
import { SubmitButton } from "@/components/submit-button";
import { crearInvitado } from "@/app/actions/invitados";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevoInvitadoPage() {
  await requireAuth();

  return (
    <div>
      <PageHeader title="Nuevo invitado" />

      <Card>
        <CardContent className="pt-6">
          <form action={crearInvitado} className="space-y-4">
            <FormField label="Nombre" htmlFor="nombre">
              <Input id="nombre" name="nombre" required minLength={2} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Teléfono" htmlFor="telefono">
                <Input id="telefono" name="telefono" type="tel" />
              </FormField>
              <FormField label="Fecha" htmlFor="fecha">
                <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Empresa" htmlFor="empresa">
                <Input id="empresa" name="empresa" />
              </FormField>
              <FormField label="Giro" htmlFor="giro">
                <GiroSelect />
              </FormField>
            </div>

            <FormField label="Estatus" htmlFor="estatus">
              <Select id="estatus" name="estatus" defaultValue="prospecto">
                <option value="prospecto">Prospecto</option>
                <option value="asistio">Asistió</option>
                <option value="no_asistio">No asistió</option>
                <option value="se_integro">Se integró</option>
              </Select>
            </FormField>

            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" name="notas" rows={3} />
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/invitados">Cancelar</Link>
              </Button>
              <SubmitButton>Guardar invitado</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
