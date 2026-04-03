import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ArrowRightLeft,
  SlidersHorizontal,
  GitCompare,
  ChevronDown,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useBudgetStore } from '../store';
import { formatINR, formatINRCompact, formatCostPerSqft } from '../utils/formatters';
import type { Scenario } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────

function getScenarioCapex(scenario: Scenario): number {
  const capexCatIds = new Set(
    Object.values(scenario.categories)
      .filter((c) => c.section === 'capex' && !c.isArchived)
      .map((c) => c.id)
  );
  return Object.values(scenario.lineItems)
    .filter((li) => capexCatIds.has(li.categoryId) && !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

function getScenarioOpex(scenario: Scenario): number {
  const opexCatIds = new Set(
    Object.values(scenario.categories)
      .filter((c) => c.section === 'opex' && !c.isArchived)
      .map((c) => c.id)
  );
  return Object.values(scenario.lineItems)
    .filter((li) => opexCatIds.has(li.categoryId) && !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

function getScenarioCostPerSqft(scenario: Scenario): number {
  const capex = getScenarioCapex(scenario);
  const area = scenario.metadata.totalBUA || 1;
  return area > 0 ? capex / area : 0;
}

function getCategoryTotal(scenario: Scenario, categoryId: string): number {
  return Object.values(scenario.lineItems)
    .filter((li) => li.categoryId === categoryId && !li.isArchived)
    .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Component ──────────────────────────────────────────────────────

export default function ScenariosView() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Scenario Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, compare, and run what-if analyses across budget scenarios
        </p>
      </div>

      <ScenarioList />
      <WhatIfCalculator />
      <SideBySideComparison />
    </div>
  );
}

// ─── Scenario List ──────────────────────────────────────────────────

function ScenarioList() {
  const scenarios = useBudgetStore((s) => s.scenarios);
  const activeId = useBudgetStore((s) => s.activeScenarioId);
  const switchScenario = useBudgetStore((s) => s.switchScenario);
  const deleteScenario = useBudgetStore((s) => s.deleteScenario);
  const createScenario = useBudgetStore((s) => s.createScenario);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [cloneFrom, setCloneFrom] = useState('');

  const updateScenario = useBudgetStore((s) => s.updateScenario);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const editNameRef = useRef<HTMLInputElement>(null);

  const scenarioList = Object.values(scenarios);
  const canDelete = scenarioList.length > 1;

  function startEditing(scenario: Scenario) {
    setEditingId(scenario.id);
    setEditName(scenario.name);
    setEditDesc(scenario.description);
  }

  function saveEditing() {
    if (editingId && editName.trim()) {
      updateScenario(editingId, { name: editName.trim(), description: editDesc.trim() });
    }
    setEditingId(null);
  }

  useEffect(() => {
    if (editingId && editNameRef.current) {
      editNameRef.current.focus();
      editNameRef.current.select();
    }
  }, [editingId]);

  function handleCreate() {
    if (!newName.trim()) return;
    createScenario(newName.trim(), cloneFrom || undefined);
    setNewName('');
    setCloneFrom('');
    setShowForm(false);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Scenarios</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create New Scenario
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Scenario Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Budget-Optimised V2"
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Clone From (optional)
              </label>
              <div className="relative">
                <select
                  value={cloneFrom}
                  onChange={(e) => setCloneFrom(e.target.value)}
                  className="w-full appearance-none rounded-md border border-slate-300 px-3 py-1.5 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Start empty</option>
                  {scenarioList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewName('');
                  setCloneFrom('');
                }}
                className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scenarioList.map((scenario) => {
          const isActive = scenario.id === activeId;
          const capex = getScenarioCapex(scenario);
          const opex = getScenarioOpex(scenario);
          const costSqft = getScenarioCostPerSqft(scenario);

          return (
            <div
              key={scenario.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50/30 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                {editingId === scenario.id ? (
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input
                      ref={editNameRef}
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full rounded-md border border-blue-300 px-2 py-1 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Scenario name"
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-1">
                      <button onClick={saveEditing} className="rounded-md bg-blue-600 p-1 text-white hover:bg-blue-700">
                        <Check size={12} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="rounded-md border border-slate-300 p-1 text-slate-500 hover:bg-slate-50">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group/sname min-w-0 flex-1 cursor-pointer" onDoubleClick={() => startEditing(scenario)}>
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {scenario.name}
                      </h3>
                      <Pencil className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover/sname:opacity-100" />
                    </div>
                    {scenario.description && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {scenario.description}
                      </p>
                    )}
                  </div>
                )}
                {isActive && (
                  <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-700">
                    Active
                  </span>
                )}
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">CAPEX</span>
                  <p className="font-medium text-slate-800">{formatINRCompact(capex)}</p>
                </div>
                <div>
                  <span className="text-slate-500">OPEX</span>
                  <p className="font-medium text-slate-800">{formatINRCompact(opex)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Cost/sqft</span>
                  <p className="font-medium text-slate-800">{formatCostPerSqft(costSqft)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Created</span>
                  <p className="font-medium text-slate-800">
                    {formatDate(scenario.metadata.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isActive && (
                  <button
                    onClick={() => switchScenario(scenario.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowRightLeft size={12} />
                    Switch
                  </button>
                )}
                <button
                  onClick={() => createScenario(`${scenario.name} (Copy)`, scenario.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <Copy size={12} />
                  Clone
                </button>
                {canDelete && !isActive && (
                  <button
                    onClick={() => deleteScenario(scenario.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── What-If Calculator ─────────────────────────────────────────────

function WhatIfCalculator() {
  const scenarios = useBudgetStore((s) => s.scenarios);
  const activeId = useBudgetStore((s) => s.activeScenarioId);
  const createScenario = useBudgetStore((s) => s.createScenario);
  const store = useBudgetStore;

  const activeScenario = scenarios[activeId];
  const categories = useMemo(
    () =>
      activeScenario
        ? Object.values(activeScenario.categories)
            .filter((c) => !c.isArchived)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    [activeScenario]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [adjustmentPct, setAdjustmentPct] = useState(0);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const preview = useMemo(() => {
    if (!selectedCategoryId || adjustmentPct === 0 || !activeScenario) return null;

    const currentTotal = getCategoryTotal(activeScenario, selectedCategoryId);
    const saving = currentTotal * (adjustmentPct / 100);
    const newTotal = currentTotal + saving;

    const currentCapex = getScenarioCapex(activeScenario);
    const newCapex = currentCapex + saving;
    const area = activeScenario.metadata.totalBUA || 1;
    const newCostPerSqft = area > 0 ? newCapex / area : 0;

    return { currentTotal, saving, newTotal, newCostPerSqft };
  }, [selectedCategoryId, adjustmentPct, activeScenario]);

  function handleApply() {
    if (!selectedCategoryId || adjustmentPct === 0 || !activeScenario) return;

    const catName = selectedCategory?.name ?? 'Category';
    const sign = adjustmentPct > 0 ? '+' : '';
    const scenarioName = `${activeScenario.name} (${catName} ${sign}${adjustmentPct}%)`;

    createScenario(scenarioName, activeId);

    // After creation, the new scenario is now active. Apply adjustments.
    const state = store.getState();
    const newScenario = state.scenarios[state.activeScenarioId];
    if (!newScenario) return;

    const factor = 1 + adjustmentPct / 100;
    Object.values(newScenario.lineItems).forEach((item) => {
      if (item.categoryId === selectedCategoryId && !item.isArchived) {
        state.updateLineItem(item.id, {
          unitCost: Math.round(item.unitCost * factor * 100) / 100,
        });
      }
    });

    setAdjustmentPct(0);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal size={20} className="text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-800">What-If Calculator</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
          <div className="relative">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Adjustment: {adjustmentPct > 0 ? '+' : ''}
            {adjustmentPct}%
          </label>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={adjustmentPct}
            onChange={(e) => setAdjustmentPct(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>-50%</span>
            <span>0%</span>
            <span>+50%</span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Adjustment Input
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={-50}
              max={50}
              value={adjustmentPct}
              onChange={(e) => {
                const v = Math.max(-50, Math.min(50, Number(e.target.value)));
                setAdjustmentPct(v);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500">%</span>
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleApply}
            disabled={!selectedCategoryId || adjustmentPct === 0}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Apply What-If
          </button>
        </div>
      </div>

      {preview && selectedCategory && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Adjusting <span className="font-semibold">{selectedCategory.name}</span> by{' '}
          <span className="font-semibold">
            {adjustmentPct > 0 ? '+' : ''}
            {adjustmentPct}%
          </span>{' '}
          would {preview.saving < 0 ? 'save' : 'add'}{' '}
          <span className="font-semibold">{formatINR(Math.abs(preview.saving))}</span>, bringing
          cost/sqft to{' '}
          <span className="font-semibold">{formatCostPerSqft(preview.newCostPerSqft)}</span>
        </div>
      )}
    </section>
  );
}

// ─── Side-by-Side Comparison ────────────────────────────────────────

function SideBySideComparison() {
  const scenarios = useBudgetStore((s) => s.scenarios);
  const scenarioList = Object.values(scenarios);

  const [scenarioAId, setScenarioAId] = useState('');
  const [scenarioBId, setScenarioBId] = useState('');

  const scenarioA = scenarioAId ? scenarios[scenarioAId] : null;
  const scenarioB = scenarioBId ? scenarios[scenarioBId] : null;

  const comparisonData = useMemo(() => {
    if (!scenarioA || !scenarioB) return null;

    // Merge all category IDs from both scenarios
    const allCatIds = new Set([
      ...Object.keys(scenarioA.categories),
      ...Object.keys(scenarioB.categories),
    ]);

    const rows: Array<{
      id: string;
      name: string;
      section: string;
      amountA: number;
      amountB: number;
      diff: number;
      pctChange: number;
    }> = [];

    allCatIds.forEach((catId) => {
      const catA = scenarioA.categories[catId];
      const catB = scenarioB.categories[catId];
      if ((!catA || catA.isArchived) && (!catB || catB.isArchived)) return;

      const name = catA?.name ?? catB?.name ?? 'Unknown';
      const section = catA?.section ?? catB?.section ?? 'capex';
      const amountA = catA && !catA.isArchived ? getCategoryTotal(scenarioA, catId) : 0;
      const amountB = catB && !catB.isArchived ? getCategoryTotal(scenarioB, catId) : 0;
      const diff = amountB - amountA;
      const pctChange = amountA !== 0 ? (diff / amountA) * 100 : amountB !== 0 ? 100 : 0;

      rows.push({ id: catId, name, section, amountA, amountB, diff, pctChange });
    });

    rows.sort((a, b) => {
      if (a.section !== b.section) return a.section === 'capex' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const grandA = rows.reduce((s, r) => s + r.amountA, 0);
    const grandB = rows.reduce((s, r) => s + r.amountB, 0);
    const grandDiff = grandB - grandA;
    const grandPct = grandA !== 0 ? (grandDiff / grandA) * 100 : 0;

    return { rows, grandA, grandB, grandDiff, grandPct };
  }, [scenarioA, scenarioB]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <GitCompare size={20} className="text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-800">Side-by-Side Comparison</h2>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Scenario A</label>
          <div className="relative">
            <select
              value={scenarioAId}
              onChange={(e) => setScenarioAId(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select scenario...</option>
              {scenarioList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Scenario B</label>
          <div className="relative">
            <select
              value={scenarioBId}
              onChange={(e) => setScenarioBId(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select scenario...</option>
              {scenarioList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {comparisonData ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4 text-right">{scenarioA?.name ?? 'A'}</th>
                  <th className="pb-2 pr-4 text-right">{scenarioB?.name ?? 'B'}</th>
                  <th className="pb-2 pr-4 text-right">Difference</th>
                  <th className="pb-2 text-right">% Change</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-4">
                      <span className="text-slate-800">{row.name}</span>
                      <span className="ml-1.5 text-[10px] uppercase text-slate-400">
                        {row.section}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700">
                      {formatINR(row.amountA)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono text-slate-700">
                      {formatINR(row.amountB)}
                    </td>
                    <td
                      className={`py-2.5 pr-4 text-right font-mono font-medium ${
                        row.diff < 0 ? 'text-emerald-600' : row.diff > 0 ? 'text-red-600' : 'text-slate-500'
                      }`}
                    >
                      {row.diff < 0 ? '-' : row.diff > 0 ? '+' : ''}
                      {formatINR(Math.abs(row.diff))}
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono text-xs font-medium ${
                        row.pctChange < 0
                          ? 'text-emerald-600'
                          : row.pctChange > 0
                            ? 'text-red-600'
                            : 'text-slate-500'
                      }`}
                    >
                      {row.pctChange > 0 ? '+' : ''}
                      {row.pctChange.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 font-semibold">
                  <td className="pt-3 pr-4 text-slate-900">Grand Total</td>
                  <td className="pt-3 pr-4 text-right font-mono text-slate-900">
                    {formatINR(comparisonData.grandA)}
                  </td>
                  <td className="pt-3 pr-4 text-right font-mono text-slate-900">
                    {formatINR(comparisonData.grandB)}
                  </td>
                  <td
                    className={`pt-3 pr-4 text-right font-mono ${
                      comparisonData.grandDiff < 0
                        ? 'text-emerald-600'
                        : comparisonData.grandDiff > 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }`}
                  >
                    {comparisonData.grandDiff < 0 ? '-' : comparisonData.grandDiff > 0 ? '+' : ''}
                    {formatINR(Math.abs(comparisonData.grandDiff))}
                  </td>
                  <td
                    className={`pt-3 text-right font-mono text-xs ${
                      comparisonData.grandPct < 0
                        ? 'text-emerald-600'
                        : comparisonData.grandPct > 0
                          ? 'text-red-600'
                          : 'text-slate-500'
                    }`}
                  >
                    {comparisonData.grandPct > 0 ? '+' : ''}
                    {comparisonData.grandPct.toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
              comparisonData.grandDiff < 0
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                : comparisonData.grandDiff > 0
                  ? 'border border-red-200 bg-red-50 text-red-800'
                  : 'border border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {comparisonData.grandDiff === 0
              ? 'Both scenarios have the same total cost.'
              : `${scenarioB?.name ?? 'Scenario B'} is ${formatINR(Math.abs(comparisonData.grandDiff))} ${
                  comparisonData.grandDiff < 0 ? 'cheaper' : 'more expensive'
                } overall.`}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400">
          Select two scenarios above to compare them side by side
        </div>
      )}
    </section>
  );
}
