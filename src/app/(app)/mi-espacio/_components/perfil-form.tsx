"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { GiroSelect } from "@/components/giro-select";
import { actualizarPerfil } from "@/app/actions/perfil";

type Inicial = {
  empresa: string | null;
  giro: string | null;
  telefono: string | null;
  descripcion_negocio: string | null;
};

export function PerfilForm({ inicial }: { inicial: Inicial }) {
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setOk(false);
    startTransition(async () => {
      const res = await actualizarPerfil(formData);
      if ("error" in res && res.error) setError(res.error);
      else {
        setOk(true);
        setEdit(false);
      }
    });
  }

  if (!edit) {
    return (
      <div>
        {ok && <p className="text-sm text-emerald-700 mb-3">Perfil actualizado.</p>}
        <Button variant="outline" size="sm" onClick={() => setEdit(true)}>
          Editar mi información
        </Button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4 border-t pt-4 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Empresa" htmlFor="empresa">
          <Input id="empresa" name="empresa" defaultValue={inicial.empresa ?? ""} />
        </FormField>
        <FormField label="Giro" htmlFor="giro">
          <GiroSelect defaultValue={inicial.giro} />
        </FormField>
      </div>

      <FormField label="Teléfono" htmlFor="telefono">
        <Input id="telefono" name="telefono" type="tel" defaultValue={inicial.telefono ?? ""} />
      </FormField>

      <FormField label="Descripción del negocio" htmlFor="descripcion_negocio">
        <Textarea
          id="descripcion_negocio"
          name="descripcion_negocio"
          rows={3}
          defaultValue={inicial.descripcion_negocio ?? ""}
        />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => setEdit(false)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
