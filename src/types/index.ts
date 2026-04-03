export type BudgetItemStatus =
  | 'TBC'
  | 'Estimated'
  | 'Quoted'
  | 'Committed'
  | 'Invoiced'
  | 'Paid';

export type BudgetSection = 'capex' | 'opex';
export type Team = 'PMO' | 'AAED' | null;

export interface BudgetLineItem {
  id: string;
  categoryId: string;
  name: string;
  unitCost: number;
  quantity: number;
  unit: string; // "sqft", "nos", "lumpsum", "months"
  status: BudgetItemStatus;
  team: Team;
  remark: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  section: BudgetSection;
  sortOrder: number;
  isArchived: boolean;
  color: string;
  budgetCap: number | null; // optional per-category budget
}

export interface AreaStatement {
  id: string;
  label: string;
  areaSqft: number;
}

export interface ProjectMetadata {
  projectName: string;
  totalBUA: number; // Built-Up Area in sqft
  landscapeArea: number;
  totalArea: number; // BUA + landscape
  budgetCap: number | null;
  opexMonths: number; // how many months to project OPEX
  createdAt: number;
  updatedAt: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  metadata: ProjectMetadata;
  categories: Record<string, BudgetCategory>;
  lineItems: Record<string, BudgetLineItem>;
  areaStatement: AreaStatement[];
}

export interface AppState {
  scenarios: Record<string, Scenario>;
  activeScenarioId: string;
  editingCellId: string | null;
  sidebarOpen: boolean;
}

export const STATUS_ORDER: BudgetItemStatus[] = [
  'TBC',
  'Estimated',
  'Quoted',
  'Committed',
  'Invoiced',
  'Paid',
];

export const STATUS_CONFIG: Record<
  BudgetItemStatus,
  { bg: string; text: string; dot: string }
> = {
  TBC: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  Estimated: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  Quoted: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400' },
  Committed: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Invoiced: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export const CATEGORY_COLORS = [
  '#4A90D9', // Structure - blue
  '#7B68EE', // Interiors - purple
  '#E67E22', // IT Infra - orange
  '#27AE60', // Landscape - green
  '#8E44AD', // Scale Model - deep purple
  '#E74C3C', // Branding - red
  '#2ECC71', // Site Work - light green
  '#F39C12', // OPEX - gold
  '#1ABC9C', // Misc - teal
  '#D4A574', // Furniture - tan
];
