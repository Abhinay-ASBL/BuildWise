import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type {
  AppState,
  BudgetLineItem,
  BudgetCategory,
  BudgetItemStatus,
  Scenario,
  Team,
} from '../types';
import {
  defaultCategories,
  defaultLineItems,
  defaultAreaStatement,
  defaultMetadata,
} from '../data/salesOfficeData';

// ─── Build default scenario from CSV data ───────────────────────────
function buildDefaultScenario(): Scenario {
  const categories: Record<string, BudgetCategory> = {};
  for (const cat of defaultCategories) {
    categories[cat.id] = { ...cat };
  }

  const lineItems: Record<string, BudgetLineItem> = {};
  for (const li of defaultLineItems) {
    lineItems[li.id] = { ...li };
  }

  return {
    id: 'default',
    name: 'Legacy Modular Sales Office — Master',
    description: 'Based on Master Costing Sheet CSV',
    metadata: { ...defaultMetadata },
    categories,
    lineItems,
    areaStatement: [...defaultAreaStatement],
  };
}

// ─── Store Actions Interface ────────────────────────────────────────
interface BudgetActions {
  // Line items
  addLineItem: (categoryId: string, partial?: Partial<BudgetLineItem>) => void;
  updateLineItem: (itemId: string, changes: Partial<BudgetLineItem>) => void;
  archiveLineItem: (itemId: string) => void;
  restoreLineItem: (itemId: string) => void;
  duplicateLineItem: (itemId: string) => void;

  // Categories
  addCategory: (partial: Partial<BudgetCategory>) => void;
  updateCategory: (categoryId: string, changes: Partial<BudgetCategory>) => void;
  archiveCategory: (categoryId: string) => void;

  // Status
  updateItemStatus: (itemId: string, status: BudgetItemStatus) => void;
  updateItemTeam: (itemId: string, team: Team) => void;

  // Scenarios
  createScenario: (name: string, cloneFromId?: string) => void;
  switchScenario: (scenarioId: string) => void;
  deleteScenario: (scenarioId: string) => void;
  updateMetadata: (changes: Partial<Scenario['metadata']>) => void;

  // UI
  setEditingCell: (cellId: string | null) => void;
  toggleSidebar: () => void;

  // Reset
  resetToDefault: () => void;
}

type BudgetStore = AppState & BudgetActions;

export const useBudgetStore = create<BudgetStore>()(
  persist(
    immer((set, _get) => ({
      // ─── Initial State ──────────────────────────────────
      scenarios: { default: buildDefaultScenario() },
      activeScenarioId: 'default',
      editingCellId: null,
      sidebarOpen: true,

      // ─── Line Item Actions ──────────────────────────────
      addLineItem: (categoryId, partial) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          if (!scenario) return;

          const id = nanoid();
          const existingCount = Object.values(scenario.lineItems).filter(
            (li) => li.categoryId === categoryId && !li.isArchived
          ).length;

          scenario.lineItems[id] = {
            id,
            categoryId,
            name: partial?.name ?? 'New Item',
            unitCost: partial?.unitCost ?? 0,
            quantity: partial?.quantity ?? 1,
            unit: partial?.unit ?? 'nos',
            status: 'TBC',
            team: partial?.team ?? null,
            remark: partial?.remark ?? '',
            sortOrder: existingCount,
            isArchived: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }),

      updateLineItem: (itemId, changes) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const item = scenario?.lineItems[itemId];
          if (item) {
            Object.assign(item, changes, { updatedAt: Date.now() });
          }
        }),

      archiveLineItem: (itemId) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const item = scenario?.lineItems[itemId];
          if (item) {
            item.isArchived = true;
            item.updatedAt = Date.now();
          }
        }),

      restoreLineItem: (itemId) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const item = scenario?.lineItems[itemId];
          if (item) {
            item.isArchived = false;
            item.updatedAt = Date.now();
          }
        }),

      duplicateLineItem: (itemId) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const source = scenario?.lineItems[itemId];
          if (!source) return;

          const newId = nanoid();
          scenario.lineItems[newId] = {
            ...JSON.parse(JSON.stringify(source)),
            id: newId,
            name: `${source.name} (Copy)`,
            status: 'TBC' as BudgetItemStatus,
            sortOrder: source.sortOrder + 0.5,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }),

      // ─── Category Actions ───────────────────────────────
      addCategory: (partial) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          if (!scenario) return;

          const id = nanoid();
          const existingCount = Object.values(scenario.categories).filter(
            (c) => !c.isArchived
          ).length;

          scenario.categories[id] = {
            id,
            name: partial.name ?? 'New Category',
            section: partial.section ?? 'capex',
            sortOrder: existingCount,
            isArchived: false,
            color: partial.color ?? '#94A3B8',
            budgetCap: partial.budgetCap ?? null,
          };
        }),

      updateCategory: (categoryId, changes) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const cat = scenario?.categories[categoryId];
          if (cat) Object.assign(cat, changes);
        }),

      archiveCategory: (categoryId) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const cat = scenario?.categories[categoryId];
          if (cat) cat.isArchived = true;
        }),

      // ─── Status/Team Actions ────────────────────────────
      updateItemStatus: (itemId, status) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const item = scenario?.lineItems[itemId];
          if (item) {
            item.status = status;
            item.updatedAt = Date.now();
          }
        }),

      updateItemTeam: (itemId, team) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          const item = scenario?.lineItems[itemId];
          if (item) {
            item.team = team;
            item.updatedAt = Date.now();
          }
        }),

      // ─── Scenario Actions ──────────────────────────────
      createScenario: (name, cloneFromId) =>
        set((state) => {
          const newId = nanoid();

          if (cloneFromId && state.scenarios[cloneFromId]) {
            const source = JSON.parse(
              JSON.stringify(state.scenarios[cloneFromId])
            ) as Scenario;
            state.scenarios[newId] = {
              ...source,
              id: newId,
              name,
              metadata: {
                ...source.metadata,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            };
          } else {
            state.scenarios[newId] = {
              id: newId,
              name,
              description: '',
              metadata: {
                projectName: name,
                totalBUA: 7246.45,
                landscapeArea: 3750,
                totalArea: 10996.45,
                budgetCap: null,
                opexMonths: 24,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              categories: {},
              lineItems: {},
              areaStatement: [],
            };
          }

          state.activeScenarioId = newId;
        }),

      switchScenario: (scenarioId) =>
        set((state) => {
          if (state.scenarios[scenarioId]) {
            state.activeScenarioId = scenarioId;
          }
        }),

      deleteScenario: (scenarioId) =>
        set((state) => {
          if (
            scenarioId === 'default' ||
            Object.keys(state.scenarios).length <= 1
          )
            return;
          delete state.scenarios[scenarioId];
          if (state.activeScenarioId === scenarioId) {
            state.activeScenarioId = Object.keys(state.scenarios)[0];
          }
        }),

      updateMetadata: (changes) =>
        set((state) => {
          const scenario = state.scenarios[state.activeScenarioId];
          if (scenario) {
            Object.assign(scenario.metadata, changes, {
              updatedAt: Date.now(),
            });
          }
        }),

      // ─── UI Actions ────────────────────────────────────
      setEditingCell: (cellId) =>
        set((state) => {
          state.editingCellId = cellId;
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      // ─── Reset ─────────────────────────────────────────
      resetToDefault: () =>
        set((state) => {
          state.scenarios = { default: buildDefaultScenario() };
          state.activeScenarioId = 'default';
        }),
    })),
    {
      name: 'buildwise-store',
      partialize: (state) => ({
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
      }),
    }
  )
);

// ─── Selectors (stable references via JSON key comparison) ──────────

export const useActiveScenario = () =>
  useBudgetStore((s) => s.scenarios[s.activeScenarioId]);

// Helper: get raw data from store, memoize in component
export function getCategories(
  scenario: Scenario | undefined,
  section?: 'capex' | 'opex'
): BudgetCategory[] {
  if (!scenario) return [];
  return Object.values(scenario.categories)
    .filter((c) => !c.isArchived && (section ? c.section === section : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryItems(
  scenario: Scenario | undefined,
  categoryId: string
): BudgetLineItem[] {
  if (!scenario) return [];
  return Object.values(scenario.lineItems)
    .filter((li) => li.categoryId === categoryId && !li.isArchived)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryTotal(
  scenario: Scenario | undefined,
  categoryId: string
): number {
  if (!scenario) return 0;
  return Object.values(scenario.lineItems)
    .filter((li) => li.categoryId === categoryId && !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

export function getSectionTotal(
  scenario: Scenario | undefined,
  section: 'capex' | 'opex'
): number {
  if (!scenario) return 0;
  const sectionCatIds = new Set(
    Object.values(scenario.categories)
      .filter((c) => c.section === section && !c.isArchived)
      .map((c) => c.id)
  );
  return Object.values(scenario.lineItems)
    .filter((li) => sectionCatIds.has(li.categoryId) && !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

export function getGrandTotal(scenario: Scenario | undefined): number {
  if (!scenario) return 0;
  return Object.values(scenario.lineItems)
    .filter((li) => !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

export function getCostPerSqft(scenario: Scenario | undefined): number {
  if (!scenario) return 0;
  const capex = getSectionTotal(scenario, 'capex');
  const area = scenario.metadata.totalBUA || 1;
  return area > 0 ? capex / area : 0;
}

export function getTBCItems(
  scenario: Scenario | undefined
): BudgetLineItem[] {
  if (!scenario) return [];
  return Object.values(scenario.lineItems).filter(
    (li) => !li.isArchived && li.status === 'TBC'
  );
}

export function getStatusBreakdown(
  scenario: Scenario | undefined
): Record<string, number> {
  if (!scenario) return {};
  const breakdown: Record<string, number> = {};
  for (const item of Object.values(scenario.lineItems)) {
    if (item.isArchived) continue;
    const total = item.unitCost * item.quantity;
    breakdown[item.status] = (breakdown[item.status] ?? 0) + total;
  }
  return breakdown;
}

// ─── Hook wrappers (for backward compat — use useMemo in components) ─

export const useCategories = (section?: 'capex' | 'opex') => {
  const scenario = useActiveScenario();
  return useMemo(() => getCategories(scenario, section), [scenario, section]);
};

export const useCategoryItems = (categoryId: string) => {
  const scenario = useActiveScenario();
  return useMemo(() => getCategoryItems(scenario, categoryId), [scenario, categoryId]);
};

export const useCategoryTotal = (categoryId: string): number => {
  const scenario = useActiveScenario();
  return useMemo(() => getCategoryTotal(scenario, categoryId), [scenario, categoryId]);
};

export const useSectionTotal = (section: 'capex' | 'opex'): number => {
  const scenario = useActiveScenario();
  return useMemo(() => getSectionTotal(scenario, section), [scenario, section]);
};

export const useGrandTotal = (): number => {
  const scenario = useActiveScenario();
  return useMemo(() => getGrandTotal(scenario), [scenario]);
};

export const useCostPerSqft = (): number => {
  const scenario = useActiveScenario();
  return useMemo(() => getCostPerSqft(scenario), [scenario]);
};

export const useTBCItems = () => {
  const scenario = useActiveScenario();
  return useMemo(() => getTBCItems(scenario), [scenario]);
};

export const useStatusBreakdown = (): Record<string, number> => {
  const scenario = useActiveScenario();
  return useMemo(() => getStatusBreakdown(scenario), [scenario]);
};
