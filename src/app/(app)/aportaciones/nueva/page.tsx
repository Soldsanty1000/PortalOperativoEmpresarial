import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearAportacion } from "@/app/actions/aportaciones";
import { asFormAction } from "@/lib/form-action";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevaAportacionPage() {
  await requireAuth();

  return (
    <div>
      <PageHeader
        title="Nueva aportación"
        description="Quedará en estado “Por validar” hasta que Admin o Licenciatario revisen el comprobante."
      />

      <Card>
        <CardContent className="pt-6">
          <form action={asFormAction(crearAportacion)} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tipo" htmlFor="tipo">
                <Select id="tipo" name="tipo" required defaultValue="membresia">
                  <option value="membresia">Membresía</option>
                  <option value="sesion">Sesión / Encuentro</option>
                </Select>
              </FormField>
              <FormField label="Monto (MXN)" htmlFor="monto">
                <Input id="monto" name="monto" type="number" step="0.01" min="0.01" required />
              </FormField>
            </div>

            <FormField label="Fecha de pago" htmlFor="fecha">
              <Input id="fecha" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </FormField>

            <FormField
              label="Comprobante"
              htmlFor="comprobante"
              hint="JPG, PNG, WebP, GIF o PDF. Máximo 5 MB."
            >
              <Input
                id="comprobante"
                name="comprobante"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                required
              />
            </FormField>

            <FormField label="Notas" htmlFor="notas">
              <Textarea id="notas" name="notas" rows={3} placeholder="Referencia, banco, etc." />
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/aportaciones">Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Subiendo…">Registrar aportación</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
