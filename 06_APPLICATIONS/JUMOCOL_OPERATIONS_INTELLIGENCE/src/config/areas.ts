export type AreaId =
  | "operations"
  | "finance-accounting"
  | "people-hiring"
  | "marketing-commercial"
  | "technology-ai";

export type AreaTone = "blue" | "cyan" | "green" | "yellow" | "red";

export type AreaDefinition = {
  id: AreaId;
  index: string;
  label: string;
  shortLabel: string;
  href: string;
  description: string;
  tone: AreaTone;
};

export const AREA_CATALOG = [
  {
    id: "operations",
    index: "01",
    label: "Operaciones",
    shortLabel: "Operaciones",
    href: "/operaciones",
    description: "Ejecución diaria, continuidad del servicio y control operacional.",
    tone: "green",
  },
  {
    id: "finance-accounting",
    index: "02",
    label: "Finanzas y contabilidad",
    shortLabel: "Finanzas",
    href: "/finanzas-contabilidad",
    description: "Recaudo, obligaciones, soportes y lectura financiera integrada.",
    tone: "blue",
  },
  {
    id: "people-hiring",
    index: "03",
    label: "Personas y contratación",
    shortLabel: "Personas",
    href: "/personas-contratacion",
    description: "Ciclo de colaboradores, documentación y capacidades del equipo.",
    tone: "yellow",
  },
  {
    id: "marketing-commercial",
    index: "04",
    label: "Marketing & Comercial",
    shortLabel: "Marketing",
    href: "/marketing-comercial",
    description: "Demanda, conversaciones, propuestas, ventas y entrega comercial.",
    tone: "red",
  },
  {
    id: "technology-ai",
    index: "05",
    label: "Tecnología & Inteligencia Artificial",
    shortLabel: "Tecnología",
    href: "/tecnologia-ia",
    description: "Sistemas, datos, integraciones futuras e inteligencia aplicada.",
    tone: "cyan",
  },
] as const satisfies readonly AreaDefinition[];

export function getArea(areaId: AreaId): AreaDefinition {
  const area = AREA_CATALOG.find((item) => item.id === areaId);

  if (!area) {
    throw new Error(`Area no registrada: ${areaId}`);
  }

  return area;
}
