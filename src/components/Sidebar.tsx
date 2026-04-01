import { useState } from 'react';
import {
  LayoutDashboard,
  Table2,
  Receipt,
  SquareStack,
  GitCompare,
  Menu,
  ChevronLeft,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { useBudgetStore, useActiveScenario, useSectionTotal, useCostPerSqft } from '../store';
import { formatINRCompact, formatCostPerSqft, formatINR, formatIndianNumber, parseINR } from '../utils/formatters';

export type TabId = 'dashboard' | 'capex' | 'opex' | 'area' | 'scenarios';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const NAV_ITEMS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'capex', label: 'CAPEX', icon: Table2 },
  { id: 'opex', label: 'OPEX', icon: Receipt },
  { id: 'area', label: 'Area Analysis', icon: SquareStack },
  { id: 'scenarios', label: 'Scenarios', icon: GitCompare },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const sidebarOpen = useBudgetStore((s) => s.sidebarOpen);
  const toggleSidebar = useBudgetStore((s) => s.toggleSidebar);
  const scenarios = useBudgetStore((s) => s.scenarios);
  const activeScenarioId = useBudgetStore((s) => s.activeScenarioId);
  const switchScenario = useBudgetStore((s) => s.switchScenario);
  const updateMetadata = useBudgetStore((s) => s.updateMetadata);
  const activeScenario = useActiveScenario();
  const capexTotal = useSectionTotal('capex');
  const opexTotal = useSectionTotal('opex');
  const costPerSqft = useCostPerSqft();

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const metadata = activeScenario?.metadata;
  const scenarioList = Object.values(scenarios);

  function handleBudgetSave() {
    const parsed = parseINR(budgetInput);
    updateMetadata({ budgetCap: parsed > 0 ? parsed : null });
    setEditingBudget(false);
  }

  function startEditBudget() {
    setBudgetInput(
      metadata?.budgetCap ? Math.round(metadata.budgetCap).toString() : ''
    );
    setEditingBudget(true);
  }

  return (
    <aside
      className={`flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3">
        {sidebarOpen ? (
          <>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-bold text-slate-900">
                {metadata?.projectName ?? 'BuildWise'}
              </h1>
              <p className="text-[10px] text-slate-500">
                {metadata ? formatIndianNumber(metadata.totalArea) : '0'} sqft
              </p>
            </div>
            <button
              onClick={toggleSidebar}
              className="ml-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="mx-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Expand sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* ─── Budget Cap ─────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-slate-200 px-4 py-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Budget Cap
          </label>
          {editingBudget ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBudgetSave();
                  if (e.key === 'Escape') setEditingBudget(false);
                }}
                autoFocus
                className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 50000000"
              />
              <button
                onClick={handleBudgetSave}
                className="shrink-0 rounded bg-blue-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={startEditBudget}
              className="w-full text-left text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors"
            >
              {metadata?.budgetCap ? formatINR(metadata.budgetCap) : 'Not set — click to set'}
            </button>
          )}
        </div>
      )}

      {/* ─── Quick Stats ────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-slate-200 px-4 py-3">
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Quick Stats
          </label>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">CAPEX</span>
              <span className="font-semibold text-slate-800">{formatINRCompact(capexTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">OPEX / mo</span>
              <span className="font-semibold text-slate-800">{formatINRCompact(opexTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Cost/sqft</span>
              <span className="font-semibold text-slate-800">{formatCostPerSqft(costPerSqft)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scenario Switcher ──────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-slate-200 px-4 py-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Scenario
          </label>
          <div className="relative">
            <select
              value={activeScenarioId}
              onChange={(e) => switchScenario(e.target.value)}
              className="w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 pr-7 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {scenarioList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      )}

      {/* ─── Navigation ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onTabChange(id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${!sidebarOpen ? 'justify-center px-0' : ''}`}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && <span>{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ─── Footer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Settings size={14} />
            <span>BuildWise v1.0</span>
          </div>
        </div>
      )}
    </aside>
  );
}
