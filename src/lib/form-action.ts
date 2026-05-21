// Helper para usar server actions que retornan { error } directamente como form.action.
// React/Next exige Promise<void> en form.action, pero nuestras actions retornan
// { error } en validación o redirigen en éxito. Cast seguro: en éxito el redirect
// interrumpe; en error el { error } simplemente no se muestra al user en estas
// páginas (las que requieren UI de error usan client component con useTransition).
export function asFormAction<T>(
  fn: (formData: FormData) => Promise<T>
): (formData: FormData) => Promise<void> {
  return fn as unknown as (formData: FormData) => Promise<void>;
}
