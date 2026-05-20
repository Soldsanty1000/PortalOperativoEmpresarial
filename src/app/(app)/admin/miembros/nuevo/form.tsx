"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { crearMiembro } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { GiroSelect } from "@/components/giro-select";

type Plaza = { id: string; nombre: string };

export function NuevoMiembroForm({ plazas }: { plazas: Plaza[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ passwordTemp: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await crearMiembro(formData);
    setLoading(false);

    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("ok" in res && res.ok) {
      setSuccess({ passwordTemp: res.passwordTemp });
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-sm font-medium text-emerald-900">Miembro creado</p>
          <p className="text-xs text-emerald-800 mt-2">
            Contraseña temporal — compártela de forma segura con el miembro:
          </p>
          <code className="block mt-2 p-2 bg-white rounded text-sm font-mono break-all">
            {success.passwordTemp}
          </code>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/miembros")}>
            Volver al listado
          </Button>
          <Button onClick={() => { setSuccess(null); router.refresh(); }}>
            Crear otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nombre" htmlFor="nombre">
          <Input id="nombre" name="nombre" required minLength={2} />
        </FormField>
        <FormField label="Correo" htmlFor="correo">
          <Input id="correo" name="correo" type="email" required />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Plaza" htmlFor="plaza_id">
          <Select id="plaza_id" name="plaza_id" required>
            <option value="">— Selecciona —</option>
            {plazas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Rol" htmlFor="rol">
          <Select id="rol" name="rol" defaultValue="miembro">
            <option value="miembro">Miembro</option>
            <option value="licenciatario">Licenciatario</option>
            <option value="admin">Admin</option>
          </Select>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Teléfono" htmlFor="telefono">
          <Input id="telefono" name="telefono" type="tel" />
        </FormField>
        <FormField label="Estatus" htmlFor="estatus">
          <Select id="estatus" name="estatus" defaultValue="activo">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Descripción del negocio" htmlFor="descripcion_negocio">
        <Textarea id="descripcion_negocio" name="descripcion_negocio" rows={3} />
      </FormField>

      <FormField
        label="Contraseña temporal (opcional)"
        htmlFor="password"
        hint="Si se deja vacía, se generará automáticamente."
      >
        <Input id="password" name="password" type="text" minLength={8} />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" type="button" asChild>
          <Link href="/admin/miembros">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creando…" : "Crear miembro"}
        </Button>
      </div>
    </form>
  );
}
