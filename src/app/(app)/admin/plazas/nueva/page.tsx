import { requireRol } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearPlaza } from "@/app/actions/plazas";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevaPlazaPage() {
  await requireRol(["admin"]);

  return (
    <div>
      <PageHeader title="Nueva Plaza" />

      <Card>
        <CardContent className="pt-6">
          <form action={crearPlaza} className="space-y-4">
            <FormField label="Nombre" htmlFor="nombre" hint="Ej: Plaza Querétaro">
              <Input id="nombre" name="nombre" required minLength={2} />
            </FormField>

            <FormField label="Ciudad" htmlFor="ciudad">
              <Input id="ciudad" name="ciudad" />
            </FormField>

            <FormField>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="activa" defaultChecked className="h-4 w-4" />
                Activa
              </label>
            </FormField>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/admin/plazas">Cancelar</Link>
              </Button>
              <SubmitButton>Crear Plaza</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
