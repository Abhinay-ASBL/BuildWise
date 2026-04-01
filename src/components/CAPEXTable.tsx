import { useState, useMemo } from 'react';
import { Search, Plus, Filter, X, IndianRupee, TrendingUp } from 'lucide-react';
import {
  useBudgetStore,
  useCategories,
  useSectionTotal,
  useCostPerSqft,
} from '../store';
import { STATUS_ORDER, STATUS_CONFIG, CATEGORY_COLORS } from '../types';
import type { BudgetItemStatus } from '../types';
import { formatINR, formatCostPerSqft } from '../utils/formatters';
import CategoryAccordion from './CategoryAccordion';

type TeamFilter = 'All' | 'PMO' | 'AAED';

export default function CAPEXTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<BudgetItemStatus>>(new Set());
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('All');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const capexCategories = useCategories('capex');
  const capexTotal = useSectionTotal('capex');
  const costPerSqft = useCostPerSqft();
  const addCategory = useBudgetStore((s) => s.addCategory);

  const scenario = useBudgetStore((s) => s.scenarios[s.activeScenarioId]);

  // Filter categories and items based on active filters
  const filteredCategories = useMemo(() => {
    if (!scenario) return [];
    const hasFilters = searchQuery || statusFilters.size > 0 || teamFilter !== 'All';
    if (!hasFilters) return capexCategories;

    const query = searchQuery.toLowerCase().trim();

    return capexCategories.filter((cat) => {
      const catItems = Object.values(scenario.lineItems).filter(
        (li) => li.categoryId === cat.id && !li.isArchived
      );

      const matchingItems = catItems.filter((li) => {
        const matchesSearch = !query || li.name.toLowerCase().includes(query);
        const matchesStatus = statusFilters.size === 0 || statusFilters.has(li.status);
        const matchesTeam =
          teamFilter === 'All' ||
          (teamFilter === 'PMO' && li.team === 'PMO') ||
          (teamFilter === 'AAED' && li.team === 'AAED');
        return matchesSearch && matchesStatus && matchesTeam;
      });

      const catNameMatches = query && cat.name.toLowerCase().includes(query);
      return matchingItems.length > 0 || catNameMatches;
    });
  }, [capexCategories, scenario, searchQuery, statusFilters, teamFilter]);

  function toggleStatusFilter(status: BudgetItemStatus) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearchQuery('');
    setStatusFilters(new Set());
    setTeamFilter('All');
  }

  const hasActiveFilters = searchQuery || statusFilters.size > 0 || teamFilter !== 'All';

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar — glass card */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/60
          bg-white/80 px-5 py-4 shadow-lg shadow-black/5 backdrop-blur-xl"
      >
        {/* Search — pill input */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-full border border-slate-200/80 bg-slate-50/60 py-2 pl-10 pr-4
              text-sm shadow-sm shadow-black/[0.03] placeholder:text-slate-400
              transition-all duration-200
              focus:border-teal-300 focus:bg-white focus:shadow-md focus:shadow-teal-500/10
              focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
          />
        </div>

        {/* Status pill multi-select */}
        <div className="relative">
          <button
            onClick={() => setStatusDropdownOpen((p) => !p)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold
              shadow-sm transition-all duration-200
              ${statusFilters.size > 0
                ? 'border-teal-200 bg-teal-50 text-teal-700 shadow-teal-500/10'
                : 'border-slate-200/80 bg-white/90 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-md'
              }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Status
            {statusFilters.size > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-600 px-1.5 text-[10px] font-bold text-white">
                {statusFilters.size}
              </span>
            )}
          </button>

          {statusDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setStatusDropdownOpen(false)}
              />
              <div
                className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/60
                  bg-white/90 py-1.5 shadow-xl shadow-black/10 backdrop-blur-xl"
              >
                {STATUS_ORDER.map((s) => {
                  const c = STATUS_CONFIG[s];
                  const isSelected = statusFilters.has(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatusFilter(s)}
                      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                        transition-all duration-150
                        ${isSelected
                          ? 'bg-teal-50/80 font-semibold'
                          : 'hover:bg-slate-50/80'
                        }`}
                    >
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors
                          ${isSelected
                            ? 'border-teal-600 bg-teal-600'
                            : 'border-slate-300 bg-white'
                          }`}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                      <span className={`${c.text} font-medium`}>{s}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Team filter — segmented control */}
        <div className="relative flex rounded-full border border-slate-200/80 bg-slate-100/60 p-0.5 shadow-sm">
          {(['All', 'PMO', 'AAED'] as TeamFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200
                ${teamFilter === t
                  ? 'bg-white text-slate-800 shadow-sm shadow-black/10'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs
              font-medium text-slate-500 transition-all duration-200
              hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-3">
        {filteredCategories.map((cat) => (
          <CategoryAccordion key={cat.id} category={cat} />
        ))}

        {filteredCategories.length === 0 && hasActiveFilters && (
          <div
            className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40
              py-14 text-center backdrop-blur-sm"
          >
            <p className="text-sm text-slate-400">No categories match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs font-semibold text-teal-600 transition-colors hover:text-teal-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {filteredCategories.length === 0 && !hasActiveFilters && (
          <div
            className="rounded-2xl border border-dashed border-slate-300/60 bg-white/40
              py-14 text-center backdrop-blur-sm"
          >
            <p className="text-sm text-slate-400">No CAPEX categories yet.</p>
          </div>
        )}
      </div>

      {/* Grand Total — gradient glass card */}
      <div
        className="sticky bottom-0 z-20 flex items-center justify-between rounded-2xl
          bg-gradient-to-r from-teal-700 to-teal-600 px-7 py-5
          shadow-xl shadow-teal-900/20"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <IndianRupee className="h-5 w-5 text-white/90" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-100/80">
              Total CAPEX
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white font-[tabular-nums]">
                {formatINR(capexTotal)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
            <TrendingUp className="h-3.5 w-3.5 text-teal-100" />
            <span className="text-sm font-semibold text-white font-[tabular-nums]">
              {formatCostPerSqft(costPerSqft)}
            </span>
          </div>
        </div>
      </div>

      {/* Add Category — dashed card */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => {
            const usedColors = capexCategories.map((c) => c.color);
            const nextColor =
              CATEGORY_COLORS.find((c) => !usedColors.includes(c)) ?? CATEGORY_COLORS[0];
            addCategory({ section: 'capex', color: nextColor });
          }}
          className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-300/60
            px-6 py-3 text-sm font-semibold text-slate-400 transition-all duration-200
            hover:border-teal-400 hover:bg-teal-50/50 hover:text-teal-600 hover:shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>
    </div>
  );
}
