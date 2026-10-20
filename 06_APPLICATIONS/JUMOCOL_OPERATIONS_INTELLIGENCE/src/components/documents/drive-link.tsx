/** Abre el original en Google Drive. Google aplica sus permisos: la intranet no los cambia ni los elude. */
export function DriveLink({ url, compact = false }: { url: string; compact?: boolean }) {
  return <div className={compact ? "mt-3" : "my-5 rounded-xl border border-brand-border bg-brand-surface p-4"}>
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-brand-primary-dark px-4 py-2 text-sm font-semibold text-white">
      Abrir original en Drive <span aria-hidden="true">↗</span>
    </a>
    <p className="mt-2 text-xs text-brand-muted">
      Se abre con tu cuenta de Google. Si Google muestra «Necesitas acceso», pulsa «Solicitar acceso» o pide permiso a Dirección: la intranet no cambia permisos de Drive.
    </p>
  </div>;
}
