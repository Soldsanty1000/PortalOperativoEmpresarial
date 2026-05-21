"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { actualizarMiembro, resetPasswordMiembro } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form-field";
import { GiroSelect } from "@/components/giro-select";

type Plaza = { id: string; nombre: string };

export function EditarMiembroForm({ miembro, plazas }: { miembro: any; plazas: Plaza[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetPwd, setResetPwd] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setOk(false);
    const res = await actualizarMiembro(miembro.id, formData);
    setLoading(false);
    if ("error" in res && res.error) setError(res.error);
    else {
      setOk(true);
      router.refresh();
    }
  }

  async function onResetPassword() {
    if (!confirm("¿Generar nueva contraseña temporal?")) return;
    setResetPwd(null);
    const res = await resetPasswordMiembro(miembro.id);
    if ("error" in res && res.error) setError(res.error);
    else if ("passwordTemp" in res && res.passwordTemp) setResetPwd(res.passwordTemp);
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nombre" htmlFor="nombre">
          <Input id="nombre" name="nombre" required minLength={2} defaultValue={miembro.nombre} />
        </FormField>
        <FormField label="Correo" htmlFor="correo">
          <Input id="correo" name="correo" type="email" required defaultValue={miembro.correo} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Plaza" htmlFor="plaza_id">
          <Select id="plaza_id" name="plaza_id" required defaultValue={miembro.plaza_id}>
            {plazas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Rol" htmlFor="rol">
          <Select id="rol" name="rol" defaultValue={miembro.rol}>
            <option value="miembro">Miembro</option>
            <option value="licenciatario">Licenciatario</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Empresa" htmlFor="empresa">
          <Input id="empresa" name="empresa" defaultValue={miembro.empresa ?? ""} />
        </FormField>
        <FormField label="Giro" htmlFor="giro">
          <GiroSelect defaultValue={miembro.giro} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Teléfono" htmlFor="telefono">
          <Input id="telefono" name="telefono" type="tel" defaultValue={miembro.telefono ?? ""} />
        </FormField>
        <FormField label="Estatus" htmlFor="estatus">
          <Select id="estatus" name="estatus" defaultValue={miembro.estatus}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </FormField>
      </div>

      <FormField label="Descripción del negocio" htmlFor="descripcion_negocio">
        <Textarea id="descripcion_negocio" name="descripcion_negocio" rows={3} defaultValue={miembro.descripcion_negocio ?? ""} />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {ok && <p className="text-sm text-emerald-700">Cambios guardados.</p>}
      {resetPwd && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
          <p className="text-xs text-emerald-900">Nueva contraseña temporal:</p>
          <code className="block mt-1 p-2 bg-white rounded text-sm font-mono break-all">{resetPwd}</code>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between pt-2">
        <Button type="button" variant="outline" onClick={onResetPassword}>
          Reset contraseña
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/miembros">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
}
