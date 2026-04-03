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
  Building2,
} from 'lucide-react';
import { useBudgetStore, useActiveScenario, useSectionTotal, useCostPerSqft } from '../store';
import { formatINRCompact, formatCostPerSqft, formatINR, formatIndianNumber, parseINR } from '../utils/formatters';
import SyncStatus from './SyncStatus';

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
      className={`flex h-screen flex-col bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'w-[272px]' : 'w-16'
      }`}
    >
      {/* ─── Logo & Header ──────────────────────────── */}
      <div className={`flex shrink-0 items-center border-b border-white/10 ${
        sidebarOpen ? 'h-16 justify-between px-5' : 'h-16 justify-center'
      }`}>
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/20">
                <Building2 size={16} className="text-teal-400" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {metadata?.projectName ?? 'BuildWise'}
                </h1>
                <p className="text-[11px] text-slate-400">
                  {metadata ? formatIndianNumber(metadata.totalArea) : '0'} sqft
                </p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="ml-2 rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
            aria-label="Expand sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* ─── Budget Cap ─────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-white/10 px-5 py-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Budget Cap
          </label>
          {editingBudget ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBudgetSave();
                  if (e.key === 'Escape') setEditingBudget(false);
                }}
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30"
                placeholder="e.g. 50000000"
              />
              <button
                onClick={handleBudgetSave}
                className="shrink-0 rounded-lg bg-teal-500 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-teal-400 transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={startEditBudget}
              className="w-full text-left text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              {metadata?.budgetCap ? formatINR(metadata.budgetCap) : 'Not set — click to set'}
            </button>
          )}
        </div>
      )}

      {/* ─── Quick Stats ────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-white/10 px-5 py-4">
          <label className="mb-3 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Quick Stats
          </label>
          <div className="glass-card-dark space-y-2.5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">CAPEX</span>
              <span className="font-semibold text-white tabular-nums">{formatINRCompact(capexTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">OPEX / mo</span>
              <span className="font-semibold text-white tabular-nums">{formatINRCompact(opexTotal)}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Cost/sqft</span>
              <span className="font-semibold text-teal-400 tabular-nums">{formatCostPerSqft(costPerSqft)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Scenario Switcher ──────────────────────── */}
      {sidebarOpen && (
        <div className="border-b border-white/10 px-5 py-4">
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Scenario
          </label>
          <div className="relative">
            <select
              value={activeScenarioId}
              onChange={(e) => switchScenario(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-8 text-xs font-medium text-slate-200 hover:bg-white/10 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
            >
              {scenarioList.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-800 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      )}

      {/* ─── Navigation ─────────────────────────────── */}
      <nav className="dark-scrollbar flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <li key={id}>
                <button
                  onClick={() => onTabChange(id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/15 font-medium text-teal-400'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  } ${!sidebarOpen ? 'justify-center px-0' : ''}`}
                  title={!sidebarOpen ? label : undefined}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-400" />
                  )}
                  <Icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {sidebarOpen && <span>{label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ─── Footer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Settings size={14} />
              <span>BuildWise v1.0</span>
            </div>
            <SyncStatus />
          </div>
        </div>
      )}

      {/* Collapsed: icon-only footer */}
      {!sidebarOpen && (
        <div className="border-t border-white/10 flex justify-center py-4">
          <Settings size={14} className="text-slate-600" />
        </div>
      )}
    </aside>
  );
}
