import type { AppState, Scenario } from '../types';

export type PersistedBudgetState = Pick<AppState, 'scenarios' | 'activeScenarioId'>;
export type PersistedBudgetSnapshot = {
  state: PersistedBudgetState;
  version: 0;
};

export function createEmptyScenario(): Scenario {
  const now = Date.now();

  return {
    id: 'primary',
    name: 'Primary Scenario',
    description: '',
    metadata: {
      projectName: '',
      totalBUA: 0,
      landscapeArea: 0,
      totalArea: 0,
      budgetCap: null,
      opexMonths: 0,
      createdAt: now,
      updatedAt: now,
    },
    categories: {},
    lineItems: {},
    areaStatement: [],
  };
}

export function createInitialAppState(): PersistedBudgetState {
  const scenario = createEmptyScenario();

  return {
    scenarios: {
      [scenario.id]: scenario,
    },
    activeScenarioId: scenario.id,
  };
}

export function createInitialPersistedBudgetSnapshot(): PersistedBudgetSnapshot {
  return {
    state: createInitialAppState(),
    version: 0,
  };
}
