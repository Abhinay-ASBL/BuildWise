import type { StateStorage } from 'zustand/middleware';
import type {
  AreaStatement,
  BudgetCategory,
  BudgetItemStatus,
  BudgetLineItem,
  BudgetSection,
  Scenario,
  Team,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  createInitialPersistedBudgetSnapshot,
  type PersistedBudgetSnapshot,
} from './initialAppState';

const LEGACY_TABLE = 'buildwise_state';
const APP_STATE_TABLE = 'buildwise_app_state';
const SCENARIOS_TABLE = 'buildwise_scenarios';
const CATEGORIES_TABLE = 'buildwise_categories';
const LINE_ITEMS_TABLE = 'buildwise_line_items';
const AREA_STATEMENTS_TABLE = 'buildwise_area_statements';
const APP_STATE_ROW_ID = 'primary';

type ScenarioRow = {
  id: string;
  name: string;
  description: string;
  project_name: string;
  total_bua: number;
  landscape_area: number;
  total_area: number;
  budget_cap: number | null;
  opex_months: number;
  created_at_ms: number;
  updated_at_ms: number;
  sort_order: number;
};

type CategoryRow = {
  id: string;
  scenario_id: string;
  name: string;
  section: BudgetSection;
  sort_order: number;
  is_archived: boolean;
  color: string;
  budget_cap: number | null;
};

type LineItemRow = {
  id: string;
  scenario_id: string;
  category_id: string;
  name: string;
  unit_cost: number;
  quantity: number;
  unit: string;
  status: BudgetItemStatus;
  team: Team;
  remark: string;
  sort_order: number;
  is_archived: boolean;
  created_at_ms: number;
  updated_at_ms: number;
};

type AreaStatementRow = {
  id: string;
  scenario_id: string;
  label: string;
  area_sqft: number;
  sort_order: number;
};

type AppStateRow = {
  id: string;
  active_scenario_id: string | null;
};

type NormalizedSnapshotRows = {
  appState: AppStateRow;
  scenarios: ScenarioRow[];
  categories: CategoryRow[];
  lineItems: LineItemRow[];
  areaStatements: AreaStatementRow[];
};

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

type SyncListener = (status: SyncStatus) => void;
const listeners = new Set<SyncListener>();

export function onSyncStatus(fn: SyncListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function emit(status: SyncStatus) {
  listeners.forEach((fn) => fn(status));
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let statusTimer: ReturnType<typeof setTimeout> | null = null;

function setSyncStatus(status: SyncStatus) {
  emit(status);

  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }

  if (status === 'saved' || status === 'error') {
    statusTimer = setTimeout(() => emit('idle'), 2500);
  }
}

function normalizeSnapshot(raw: unknown): PersistedBudgetSnapshot {
  if (
    raw &&
    typeof raw === 'object' &&
    'state' in raw &&
    raw.state &&
    typeof raw.state === 'object' &&
    'scenarios' in raw.state &&
    'activeScenarioId' in raw.state
  ) {
    const state = raw.state as PersistedBudgetSnapshot['state'];
    // Patch area statements to ensure they have IDs
    for (const scenario of Object.values(state.scenarios)) {
      if (Array.isArray(scenario.areaStatement)) {
        scenario.areaStatement = scenario.areaStatement.map((entry: any, idx: number) => ({
          id: entry.id || `${scenario.id}:${idx}`,
          label: entry.label ?? '',
          areaSqft: entry.areaSqft ?? 0,
        }));
      }
    }
    return { state, version: 0 };
  }

  return createInitialPersistedBudgetSnapshot();
}

function buildRowsFromSnapshot(snapshot: PersistedBudgetSnapshot): NormalizedSnapshotRows {
  const orderedScenarios = Object.values(snapshot.state.scenarios);

  const scenarios: ScenarioRow[] = [];
  const categories: CategoryRow[] = [];
  const lineItems: LineItemRow[] = [];
  const areaStatements: AreaStatementRow[] = [];

  orderedScenarios.forEach((scenario, scenarioIndex) => {
    scenarios.push({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      project_name: scenario.metadata.projectName,
      total_bua: scenario.metadata.totalBUA,
      landscape_area: scenario.metadata.landscapeArea,
      total_area: scenario.metadata.totalArea,
      budget_cap: scenario.metadata.budgetCap,
      opex_months: scenario.metadata.opexMonths,
      created_at_ms: scenario.metadata.createdAt,
      updated_at_ms: scenario.metadata.updatedAt,
      sort_order: scenarioIndex,
    });

    Object.values(scenario.categories).forEach((category) => {
      categories.push({
        id: category.id,
        scenario_id: scenario.id,
        name: category.name,
        section: category.section,
        sort_order: category.sortOrder,
        is_archived: category.isArchived,
        color: category.color,
        budget_cap: category.budgetCap,
      });
    });

    Object.values(scenario.lineItems).forEach((item) => {
      lineItems.push({
        id: item.id,
        scenario_id: scenario.id,
        category_id: item.categoryId,
        name: item.name,
        unit_cost: item.unitCost,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        team: item.team,
        remark: item.remark,
        sort_order: item.sortOrder,
        is_archived: item.isArchived,
        created_at_ms: item.createdAt,
        updated_at_ms: item.updatedAt,
      });
    });

    scenario.areaStatement.forEach((entry, index) => {
      areaStatements.push({
        id: entry.id || `${scenario.id}:${index}`,
        scenario_id: scenario.id,
        label: entry.label,
        area_sqft: entry.areaSqft,
        sort_order: index,
      });
    });
  });

  return {
    appState: {
      id: APP_STATE_ROW_ID,
      active_scenario_id: snapshot.state.activeScenarioId,
    },
    scenarios,
    categories,
    lineItems,
    areaStatements,
  };
}

function buildSnapshotFromRows(
  appState: AppStateRow | null,
  scenarioRows: ScenarioRow[],
  categoryRows: CategoryRow[],
  lineItemRows: LineItemRow[],
  areaStatementRows: AreaStatementRow[]
): PersistedBudgetSnapshot | null {
  if (!scenarioRows.length) return null;

  const orderedScenarioRows = [...scenarioRows].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const scenarios: Record<string, Scenario> = {};

  for (const row of orderedScenarioRows) {
    const categoriesForScenario = categoryRows
      .filter((category) => category.scenario_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const lineItemsForScenario = lineItemRows
      .filter((item) => item.scenario_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const areaStatementsForScenario = areaStatementRows
      .filter((entry) => entry.scenario_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const categories: Record<string, BudgetCategory> = {};
    for (const category of categoriesForScenario) {
      categories[category.id] = {
        id: category.id,
        name: category.name,
        section: category.section,
        sortOrder: category.sort_order,
        isArchived: category.is_archived,
        color: category.color,
        budgetCap: category.budget_cap,
      };
    }

    const lineItems: Record<string, BudgetLineItem> = {};
    for (const item of lineItemsForScenario) {
      lineItems[item.id] = {
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        unitCost: item.unit_cost,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        team: item.team,
        remark: item.remark,
        sortOrder: item.sort_order,
        isArchived: item.is_archived,
        createdAt: item.created_at_ms,
        updatedAt: item.updated_at_ms,
      };
    }

    const areaStatement: AreaStatement[] = areaStatementsForScenario.map((entry) => ({
      id: entry.id,
      label: entry.label,
      areaSqft: entry.area_sqft,
    }));

    scenarios[row.id] = {
      id: row.id,
      name: row.name,
      description: row.description,
      metadata: {
        projectName: row.project_name,
        totalBUA: row.total_bua,
        landscapeArea: row.landscape_area,
        totalArea: row.total_area,
        budgetCap: row.budget_cap,
        opexMonths: row.opex_months,
        createdAt: row.created_at_ms,
        updatedAt: row.updated_at_ms,
      },
      categories,
      lineItems,
      areaStatement,
    };
  }

  const fallbackActiveScenarioId = orderedScenarioRows[0].id;
  const activeScenarioId =
    appState?.active_scenario_id && scenarios[appState.active_scenario_id]
      ? appState.active_scenario_id
      : fallbackActiveScenarioId;

  return {
    state: {
      scenarios,
      activeScenarioId,
    },
    version: 0,
  };
}

async function selectExistingIds(table: string): Promise<string[]> {
  const { data, error } = await supabase!.from(table).select('id');

  if (error) throw error;

  return (data ?? [])
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string');
}

async function deleteMissingIds(table: string, nextIds: string[]) {
  const existingIds = await selectExistingIds(table);
  const idsToDelete = existingIds.filter((id) => !nextIds.includes(id));

  if (!idsToDelete.length) return;

  const { error } = await supabase!.from(table).delete().in('id', idsToDelete);
  if (error) throw error;
}

async function upsertRows(table: string, rows: object[], onConflict = 'id') {
  if (!rows.length) return;

  const { error } = await supabase!.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

function isTableMissing(error: { message: string } | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('could not find');
}

let normalizedTablesExist = true; // assume true, set false on first 404

async function readNormalizedSnapshot(): Promise<PersistedBudgetSnapshot | null> {
  if (!normalizedTablesExist) return null;

  const [
    appStateResult,
    scenariosResult,
    categoriesResult,
    lineItemsResult,
    areaStatementsResult,
  ] = await Promise.all([
    supabase!.from(APP_STATE_TABLE).select('id, active_scenario_id').eq('id', APP_STATE_ROW_ID).maybeSingle(),
    supabase!.from(SCENARIOS_TABLE).select(
      'id, name, description, project_name, total_bua, landscape_area, total_area, budget_cap, opex_months, created_at_ms, updated_at_ms, sort_order'
    ),
    supabase!.from(CATEGORIES_TABLE).select(
      'id, scenario_id, name, section, sort_order, is_archived, color, budget_cap'
    ),
    supabase!.from(LINE_ITEMS_TABLE).select(
      'id, scenario_id, category_id, name, unit_cost, quantity, unit, status, team, remark, sort_order, is_archived, created_at_ms, updated_at_ms'
    ),
    supabase!.from(AREA_STATEMENTS_TABLE).select(
      'id, scenario_id, label, area_sqft, sort_order'
    ),
  ]);

  // If any table is missing, fall back to legacy mode
  const allErrors = [appStateResult.error, scenariosResult.error, categoriesResult.error, lineItemsResult.error, areaStatementsResult.error];
  if (allErrors.some(isTableMissing)) {
    console.warn('[Supabase] Normalized tables not found — using legacy blob storage');
    normalizedTablesExist = false;
    return null;
  }

  if (appStateResult.error) throw appStateResult.error;
  if (scenariosResult.error) throw scenariosResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  if (lineItemsResult.error) throw lineItemsResult.error;
  if (areaStatementsResult.error) throw areaStatementsResult.error;

  return buildSnapshotFromRows(
    appStateResult.data as AppStateRow | null,
    (scenariosResult.data ?? []) as ScenarioRow[],
    (categoriesResult.data ?? []) as CategoryRow[],
    (lineItemsResult.data ?? []) as LineItemRow[],
    (areaStatementsResult.data ?? []) as AreaStatementRow[]
  );
}

async function readLegacySnapshot(name: string): Promise<PersistedBudgetSnapshot | null> {
  const { data, error } = await supabase!
    .from(LEGACY_TABLE)
    .select('data')
    .eq('key', name)
    .maybeSingle();

  if (error) {
    // Legacy table may not exist in fresh installs.
    const message = error.message.toLowerCase();
    if (message.includes('schema cache') || message.includes('does not exist')) {
      return null;
    }
    throw error;
  }

  return data?.data ? normalizeSnapshot(data.data) : null;
}

async function writeNormalizedSnapshot(snapshot: PersistedBudgetSnapshot): Promise<void> {
  const rows = buildRowsFromSnapshot(snapshot);

  await upsertRows(SCENARIOS_TABLE, rows.scenarios);
  await upsertRows(CATEGORIES_TABLE, rows.categories);
  await upsertRows(LINE_ITEMS_TABLE, rows.lineItems);
  await upsertRows(AREA_STATEMENTS_TABLE, rows.areaStatements);
  await upsertRows(APP_STATE_TABLE, [rows.appState]);

  await deleteMissingIds(LINE_ITEMS_TABLE, rows.lineItems.map((row) => row.id));
  await deleteMissingIds(CATEGORIES_TABLE, rows.categories.map((row) => row.id));
  await deleteMissingIds(AREA_STATEMENTS_TABLE, rows.areaStatements.map((row) => row.id));
  await deleteMissingIds(SCENARIOS_TABLE, rows.scenarios.map((row) => row.id));
}

async function writeLegacyBlob(name: string, value: string): Promise<void> {
  const { error } = await supabase!.from(LEGACY_TABLE).upsert(
    { key: name, data: JSON.parse(value), updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) throw error;
}

async function writeRemoteState(name: string, value: string): Promise<void> {
  if (name !== 'buildwise-store') return;

  if (!normalizedTablesExist) {
    await writeLegacyBlob(name, value);
    return;
  }

  try {
    const snapshot = normalizeSnapshot(JSON.parse(value));
    await writeNormalizedSnapshot(snapshot);
  } catch (err: any) {
    if (isTableMissing(err)) {
      console.warn('[Supabase] Normalized write failed — falling back to legacy blob');
      normalizedTablesExist = false;
      await writeLegacyBlob(name, value);
    } else {
      throw err;
    }
  }
}

async function seedRemoteState(name: string): Promise<string | null> {
  if (name !== 'buildwise-store') return null;

  const seed = createInitialPersistedBudgetSnapshot();
  const json = JSON.stringify(seed);

  if (normalizedTablesExist) {
    try {
      await writeNormalizedSnapshot(seed);
    } catch (err: any) {
      if (isTableMissing(err)) {
        normalizedTablesExist = false;
        await writeLegacyBlob(name, json);
      } else {
        throw err;
      }
    }
  } else {
    await writeLegacyBlob(name, json);
  }

  return json;
}

async function removeRemoteState(name: string): Promise<void> {
  if (name !== 'buildwise-store') return;

  if (!normalizedTablesExist) {
    await supabase!.from(LEGACY_TABLE).delete().eq('key', name);
    return;
  }

  await Promise.all([
    supabase!.from(APP_STATE_TABLE).delete().eq('id', APP_STATE_ROW_ID),
    supabase!.from(LINE_ITEMS_TABLE).delete().neq('id', ''),
    supabase!.from(CATEGORIES_TABLE).delete().neq('id', ''),
    supabase!.from(AREA_STATEMENTS_TABLE).delete().neq('id', ''),
    supabase!.from(SCENARIOS_TABLE).delete().neq('id', ''),
  ]);
}

export const supabaseStorage: StateStorage = {
  async getItem(name: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      return localStorage.getItem(name);
    }

    try {
      const normalizedSnapshot = await readNormalizedSnapshot();
      if (normalizedSnapshot) {
        const json = JSON.stringify(normalizedSnapshot);
        localStorage.setItem(name, json);
        return json;
      }

      const legacySnapshot = await readLegacySnapshot(name);
      if (legacySnapshot) {
        // Only migrate to normalized if those tables exist
        if (normalizedTablesExist) {
          try {
            await writeNormalizedSnapshot(legacySnapshot);
          } catch {
            // Migration failed — that's ok, we still have the data
          }
        }
        const json = JSON.stringify(legacySnapshot);
        localStorage.setItem(name, json);
        return json;
      }

      const seeded = await seedRemoteState(name);
      if (seeded) localStorage.setItem(name, seeded);
      return seeded;
    } catch (err) {
      console.error('[Supabase] getItem error:', err);
      setSyncStatus('error');
      // Fall back to localStorage on Supabase error
      return localStorage.getItem(name);
    }
  },

  async setItem(name: string, value: string): Promise<void> {
    // Always save to localStorage immediately as backup
    localStorage.setItem(name, value);

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    if (saveTimer) clearTimeout(saveTimer);
    setSyncStatus('saving');

    saveTimer = setTimeout(async () => {
      try {
        await writeRemoteState(name, value);
        setSyncStatus('saved');
      } catch (err) {
        console.error('[Supabase] setItem error:', err);
        setSyncStatus('error');
      }
    }, 1500);
  },

  async removeItem(name: string): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem(name);
      return;
    }

    try {
      await removeRemoteState(name);
    } catch (err) {
      console.error('[Supabase] removeItem error:', err);
      setSyncStatus('error');
    }
  },
};
