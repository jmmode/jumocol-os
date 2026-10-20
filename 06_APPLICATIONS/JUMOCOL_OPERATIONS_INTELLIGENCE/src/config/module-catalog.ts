import type { AreaId } from "@/config/areas";

export type ModuleCategory =
  | "Unidad operativa"
  | "Marca o programa"
  | "Línea de servicio"
  | "Entidad legal"
  | "Activo digital"
  | "Sistema";

export type ModuleDefinition = {
  id: string;
  name: string;
  category: ModuleCategory;
  areas: readonly AreaId[];
  accessByArea?: Partial<
    Record<
      AreaId,
      {
        href: string;
        label: string;
        statusLabel: string;
      }
    >
  >;
};

export const MODULE_CATALOG = [
  {
    id: "tiviplay",
    name: "TiviPlay",
    category: "Unidad operativa",
    areas: ["operations", "finance-accounting", "people-hiring", "marketing-commercial"],
    accessByArea: {
      operations: {
        href: "/operaciones/tiviplay",
        label: "Command Center",
        statusLabel: "Contexto en revisión",
      },
    },
  },
  {
    id: "mira-plus",
    name: "Mira+",
    category: "Marca o programa",
    areas: ["operations", "marketing-commercial"],
  },
  {
    id: "web-clients",
    name: "Clientes Web",
    category: "Línea de servicio",
    areas: ["operations", "marketing-commercial", "technology-ai"],
    accessByArea: {
      operations: {
        href: "/operaciones/clientes-web",
        label: "Entrega y Soporte",
        statusLabel: "Activo / Estructuración",
      },
    },
  },
  {
    id: "jumocol-sas",
    name: "JUMOCOL SAS",
    category: "Entidad legal",
    areas: ["operations", "finance-accounting", "people-hiring"],
  },
  {
    id: "jumocol-llc",
    name: "JUMOCOL LLC",
    category: "Entidad legal",
    areas: ["finance-accounting"],
  },
  {
    id: "jumocol-com",
    name: "JUMOCOL.com",
    category: "Activo digital",
    areas: ["marketing-commercial", "technology-ai"],
  },
  {
    id: "operations-intelligence",
    name: "Operations Intelligence",
    category: "Sistema",
    areas: ["technology-ai"],
  },
] as const satisfies readonly ModuleDefinition[];

export function getModulesForArea(areaId: AreaId): readonly ModuleDefinition[] {
  return MODULE_CATALOG.filter((module) => (module.areas as readonly AreaId[]).includes(areaId));
}
