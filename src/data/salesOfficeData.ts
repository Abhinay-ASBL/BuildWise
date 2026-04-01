import type { BudgetCategory, BudgetLineItem, AreaStatement, ProjectMetadata } from '../types';

// ─── Categories from CSV ────────────────────────────────────────────
export const defaultCategories: BudgetCategory[] = [
  { id: 'cat-sitework', name: 'Site Work', section: 'capex', sortOrder: 0, isArchived: false, color: '#2ECC71', budgetCap: null },
  { id: 'cat-structure', name: 'Structure', section: 'capex', sortOrder: 1, isArchived: false, color: '#4A90D9', budgetCap: null },
  { id: 'cat-interiors', name: 'Interior Work', section: 'capex', sortOrder: 2, isArchived: false, color: '#7B68EE', budgetCap: null },
  { id: 'cat-landscape', name: 'Landscape', section: 'capex', sortOrder: 3, isArchived: false, color: '#27AE60', budgetCap: null },
  { id: 'cat-it', name: 'IT Infrastructure', section: 'capex', sortOrder: 4, isArchived: false, color: '#E67E22', budgetCap: null },
  { id: 'cat-scalemodel', name: 'Scale Model', section: 'capex', sortOrder: 5, isArchived: false, color: '#8E44AD', budgetCap: null },
  { id: 'cat-branding', name: 'Branding', section: 'capex', sortOrder: 6, isArchived: false, color: '#E74C3C', budgetCap: null },
  // OPEX categories
  { id: 'cat-utilities', name: 'Utilities', section: 'opex', sortOrder: 7, isArchived: false, color: '#F39C12', budgetCap: null },
  { id: 'cat-manpower', name: 'Manpower', section: 'opex', sortOrder: 8, isArchived: false, color: '#1ABC9C', budgetCap: null },
  { id: 'cat-hospitality', name: 'Hospitality', section: 'opex', sortOrder: 9, isArchived: false, color: '#D4A574', budgetCap: null },
];

// ─── Line Items from CSV (exact data) ──────────────────────────────
const now = Date.now();

export const defaultLineItems: BudgetLineItem[] = [
  // Site Work — all TBC
  { id: 'li-sw-1', categoryId: 'cat-sitework', name: 'Site Leveling', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'PMO', remark: 'PMO to add budget', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-sw-2', categoryId: 'cat-sitework', name: 'Plinth Beam and Site Works', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'PMO', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-sw-3', categoryId: 'cat-sitework', name: 'Driveway Paving', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'PMO', remark: '', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },

  // Structure
  { id: 'li-st-1', categoryId: 'cat-structure', name: 'Modular and PEB Structure (Including Flooring, Ceiling, Wall finishes, Electrical and Plumbing Fixtures, Facade Glazing)', unitCost: 5800, quantity: 6653, unit: 'sqft', status: 'Estimated', team: 'AAED', remark: 'PMO to finalize vendor and budget', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-2', categoryId: 'cat-structure', name: 'Civil Works', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-3', categoryId: 'cat-structure', name: 'Air Conditioners', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-4', categoryId: 'cat-structure', name: 'Transportation + Crane Cost', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-st-5', categoryId: 'cat-structure', name: 'Facade Elements (Aluminum Fins, Concrete Portals, Semi-Covered Roofing BOH Area 1st Floor)', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },

  // Interior Work — all TBC
  { id: 'li-int-1', categoryId: 'cat-interiors', name: 'Furniture', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-2', categoryId: 'cat-interiors', name: 'Additional Lighting Requirements', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-int-3', categoryId: 'cat-interiors', name: 'Styling and Decor', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },

  // Landscape — all TBC
  { id: 'li-ls-1', categoryId: 'cat-landscape', name: 'Indoor Landscape', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ls-2', categoryId: 'cat-landscape', name: 'Outdoor Landscape', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },

  // IT Infrastructure
  { id: 'li-it-1', categoryId: 'cat-it', name: 'TV in Conference Rooms', unitCost: 0, quantity: 2, unit: 'nos', status: 'TBC', team: 'AAED', remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-2', categoryId: 'cat-it', name: 'Screens for Discussion Tables', unitCost: 183000, quantity: 20, unit: 'nos', status: 'Estimated', team: 'AAED', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-3', categoryId: 'cat-it', name: 'Outdoor Screen-1', unitCost: 0, quantity: 1, unit: 'nos', status: 'TBC', team: 'AAED', remark: '', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-4', categoryId: 'cat-it', name: 'Outdoor Screen-2', unitCost: 0, quantity: 1, unit: 'nos', status: 'TBC', team: 'AAED', remark: '', sortOrder: 3, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-5', categoryId: 'cat-it', name: 'Auditorium Screen', unitCost: 0, quantity: 1, unit: 'nos', status: 'TBC', team: 'AAED', remark: '', sortOrder: 4, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-it-6', categoryId: 'cat-it', name: 'WIFI Connection', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 5, isArchived: false, createdAt: now, updatedAt: now },

  // Scale Model
  { id: 'li-sm-1', categoryId: 'cat-scalemodel', name: '1:100 Site Scale Model', unitCost: 3605000, quantity: 1, unit: 'nos', status: 'Estimated', team: 'AAED', remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },

  // Branding
  { id: 'li-br-1', categoryId: 'cat-branding', name: 'Signage', unitCost: 0, quantity: 1, unit: 'lumpsum', status: 'TBC', team: 'AAED', remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-br-2', categoryId: 'cat-branding', name: 'Flex', unitCost: 800000, quantity: 1, unit: 'lumpsum', status: 'Estimated', team: 'AAED', remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },

  // OPEX — Utilities (all TBC)
  { id: 'li-ut-1', categoryId: 'cat-utilities', name: 'Electricity', unitCost: 0, quantity: 1, unit: 'months', status: 'TBC', team: null, remark: '', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ut-2', categoryId: 'cat-utilities', name: 'Water', unitCost: 0, quantity: 1, unit: 'months', status: 'TBC', team: null, remark: '', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-ut-3', categoryId: 'cat-utilities', name: 'Misc. Supplies', unitCost: 0, quantity: 1, unit: 'months', status: 'TBC', team: null, remark: '', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },

  // OPEX — Manpower
  { id: 'li-mp-1', categoryId: 'cat-manpower', name: 'Security', unitCost: 25500, quantity: 3, unit: 'months', status: 'Estimated', team: null, remark: 'Per month cost', sortOrder: 0, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-mp-2', categoryId: 'cat-manpower', name: 'Housekeeping', unitCost: 23000, quantity: 5, unit: 'months', status: 'Estimated', team: null, remark: 'Per month cost', sortOrder: 1, isArchived: false, createdAt: now, updatedAt: now },
  { id: 'li-mp-3', categoryId: 'cat-manpower', name: 'Valet Parking', unitCost: 23000, quantity: 3, unit: 'months', status: 'Estimated', team: null, remark: 'Per month cost', sortOrder: 2, isArchived: false, createdAt: now, updatedAt: now },
];

// ─── Area Statement from CSV ────────────────────────────────────────
export const defaultAreaStatement: AreaStatement[] = [
  { label: 'Ground Floor BUA', areaSqft: 6416.15 },
  { label: 'First Floor BUA', areaSqft: 830.3 },
  { label: 'Landscape Area 1', areaSqft: 3050 },
  { label: 'Landscape Area 2', areaSqft: 700 },
];

// ─── Project Metadata ───────────────────────────────────────────────
export const defaultMetadata: ProjectMetadata = {
  projectName: 'Legacy Modular Sales Office',
  totalBUA: 7246.45, // GF 6416.15 + FF 830.3
  landscapeArea: 3750, // 3050 + 700
  totalArea: 10996.45, // BUA + landscape
  budgetCap: 105974400, // ₹10,59,74,400 from CSV header
  opexMonths: 24,
  createdAt: now,
  updatedAt: now,
};
