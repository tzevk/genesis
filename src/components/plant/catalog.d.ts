/**
 * TypeScript declarations for plant catalog
 */

export interface CatalogComponent {
  id: string;
  label: string;
  slotHint: string;
  category: string;
  icon: string;
  sectorTags: string[];
}

export interface Category {
  id: string;
  label: string;
  order: number;
}

export type GroupedComponents = Record<string, CatalogComponent[]>;

export const ICONS: Record<string, string>;

export const COMPONENT_CATALOG: CatalogComponent[];

export const CATEGORIES: Category[];

export function getComponentsBySector(sector: string): GroupedComponents;

export function getComponentById(id: string): CatalogComponent | undefined;

export function getIconSvg(iconKey: string): string;
