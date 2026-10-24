import { documentSections } from "./section-search";

// Accesos rápidos de Manuales y procesos: llevan directo a la sección de la Guía rápida de turno.
// Se resuelven por número de sección (estable ante cambios de título); sin ancla válida no hay enlace.
export const QUICK_GUIDE_ID = "tiviplay-guia-rapida-turno";
export const QUICK_ACCESS = [
  ["Se cayó el panel", "2.1"], ["Mensaje de espera", "3.2"], ["Recibí comprobante", "3.3"], ["Cierre de gestión", "3.5"],
  ["Downloader", "6."], ["Smarters", "4."], ["URL servidor", "5."], ["AT&T", "7."],
] as const;

export function resolveQuickAccess(markdown: string | null) {
  const sections = markdown ? documentSections(markdown) : [];
  return QUICK_ACCESS.map(([label, number]) => {
    const section = sections.find((s) => s.heading.startsWith(`${number} `));
    return { label, heading: section?.heading ?? null, href: section ? `/operaciones/tiviplay/manuales/${QUICK_GUIDE_ID}#${section.anchor}` : null };
  });
}
