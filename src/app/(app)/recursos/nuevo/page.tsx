import { requireRol } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { crearRecurso } from "@/app/actions/recursos";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NuevoRecursoPage() {
  const { miembro } = await requireRol(["admin", "licenciatario"]);

  return (
    <div>
      <PageHeader title="Nuevo recurso" description="Subir documento, guía o presentación." />

      <Card>
        <CardContent className="pt-6">
          <form action={crearRecurso} className="space-y-4" encType="multipart/form-data">
            <FormField label="Nombre" htmlFor="nombre">
              <Input id="nombre" name="nombre" required minLength={2} />
            </FormField>

            <FormField label="Tipo" htmlFor="tipo">
              <Select id="tipo" name="tipo" required defaultValue="documento">
                <option value="documento">Documento</option>
                <option value="guia">Guía</option>
                <option value="presentacion">Presentación</option>
              </Select>
            </FormField>

            <FormField label="Archivo" htmlFor="archivo" hint="Máximo 20 MB.">
              <Input id="archivo" name="archivo" type="file" required />
            </FormField>

            {miembro.rol === "admin" && (
              <FormField>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="visible_todos" className="h-4 w-4" />
                  Recurso nacional (visible para todas las plazas)
                </label>
              </FormField>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" asChild>
                <Link href="/recursos">Cancelar</Link>
              </Button>
              <SubmitButton pendingText="Subiendo…">Subir recurso</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
