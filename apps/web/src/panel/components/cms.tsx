import Link from 'next/link'
import { IconArrowLeft, IconExternal } from './icons'

export const inputCls = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-4'

export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <p role="alert" className="mb-4 rounded-card bg-red-100 p-4 text-red-950">{error}</p>
  if (ok) return <p role="status" className="mb-4 rounded-card bg-emerald-100 p-4 text-emerald-950">{ok === '1' ? 'Cambios guardados. El sitio ya se actualizó.' : ok}</p>
  return null
}

export function PageHead({ title, intro, back, view }: { title: string; intro?: string; back?: { href: string; label: string }; view?: string }) {
  return (
    <header className="mb-6">
      {back && <Link href={back.href} className="inline-flex min-h-touch items-center underline"><IconArrowLeft /> {back.label}</Link>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">{title}</h1>
        {view !== undefined && (
          <a href={view} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Ver en el sitio <IconExternal /></a>
        )}
      </div>
      {intro && <p className="mt-2 max-w-2xl">{intro}</p>}
    </header>
  )
}

export function Text({ name, label, defaultValue, hint, textarea, rows = 3, placeholder }: { name: string; label: string; defaultValue?: string; hint?: string; textarea?: boolean; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="font-semibold">{label}</span>
      {hint && <span className="block text-sm">{hint}</span>}
      {textarea
        ? <textarea name={name} defaultValue={defaultValue} rows={rows} placeholder={placeholder} className={`${inputCls} py-3`} />
        : <input name={name} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />}
    </label>
  )
}

export function Check({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-6" />
      <span><span className="font-semibold">{label}</span>{hint && <span className="block text-sm">{hint}</span>}</span>
    </label>
  )
}

/** Campo de imagen: muestra la actual y permite subir una nueva o quitarla. El procesamiento (achicar, sacar EXIF) se hace en el servidor. */
export function ImageField({ name, label, current, hint }: { name: string; label: string; current?: string; hint?: string }) {
  return (
    <fieldset className="rounded-card border border-lila/70 p-4">
      <legend className="px-2 font-semibold">{label}</legend>
      <input type="hidden" name={name} value={current ?? ''} />
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="Imagen actual" className="mb-3 max-h-48 rounded-control object-cover" />
      ) : <p className="mb-3 text-sm">Sin imagen.</p>}
      <label className="block text-sm">{current ? 'Reemplazar por otra' : 'Subir imagen'} (JPG, PNG o WebP, hasta 4 MB)
        <input type="file" name={`${name}__file`} accept="image/jpeg,image/png,image/webp" className="mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white p-2" />
      </label>
      {hint && <p className="mt-1 text-sm">{hint}</p>}
      {current && <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name={`${name}__remove`} className="size-5" /> Quitar la imagen</label>}
    </fieldset>
  )
}

export const Save = ({ children = 'Guardar cambios' }: { children?: string }) => (
  <button type="submit" className="min-h-touch rounded-control bg-violeta-oscuro px-8 text-white">{children}</button>
)
