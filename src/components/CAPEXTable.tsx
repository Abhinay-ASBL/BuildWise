import { useState, useMemo } from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
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

      // Check if any items match filters
      const matchingItems = catItems.filter((li) => {
        const matchesSearch = !query || li.name.toLowerCase().includes(query);
        const matchesStatus = statusFilters.size === 0 || statusFilters.has(li.status);
        const matchesTeam =
          teamFilter === 'All' ||
          (teamFilter === 'PMO' && li.team === 'PMO') ||
          (teamFilter === 'AAED' && li.team === 'AAED');
        return matchesSearch && matchesStatus && matchesTeam;
      });

      // Also check if category name matches search
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
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3
              text-sm placeholder:text-gray-400 focus:border-blue-300 focus:bg-white
              focus:ring-1 focus:ring-blue-200 focus:outline-none"
          />
        </div>

        {/* Status multi-select */}
        <div className="relative">
          <button
            onClick={() => setStatusDropdownOpen((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium
              transition-colors
              ${statusFilters.size > 0
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-gray-600 hover:bg-slate-50'
              }`}
          >
            <Filter className="h-3.5 w-3.5" />
            Status
            {statusFilters.size > 0 && (
              <span className="rounded-full bg-blue-200 px-1.5 text-[10px] font-bold text-blue-700">
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
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {STATUS_ORDER.map((s) => {
                  const c = STATUS_CONFIG[s];
                  const isSelected = statusFilters.has(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleStatusFilter(s)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors
                        hover:bg-slate-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="h-3 w-3 rounded border-gray-300 text-blue-600"
                      />
                      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                      <span className={`${c.text} font-medium`}>{s}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Team filter */}
        <div className="flex rounded-md border border-slate-200 bg-white">
          {(['All', 'PMO', 'AAED'] as TeamFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-md
                last:rounded-r-md
                ${teamFilter === t
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-slate-50'
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
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs
              text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-700"
          >
            <X className="h-3 w-3" />
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
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
            <p className="text-sm text-gray-400">No categories match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}

        {filteredCategories.length === 0 && !hasActiveFilters && (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
            <p className="text-sm text-gray-400">No CAPEX categories yet.</p>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div
        className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg
          border-t-2 border-gray-800 bg-white px-6 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Total CAPEX
          </span>
          <span className="text-xs text-gray-400 font-[tabular-nums]">
            {formatCostPerSqft(costPerSqft)}
          </span>
        </div>
        <span className="text-lg font-bold font-[tabular-nums] text-gray-900">
          {formatINR(capexTotal)}
        </span>
      </div>

      {/* Add Category */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => {
            const usedColors = capexCategories.map((c) => c.color);
            const nextColor =
              CATEGORY_COLORS.find((c) => !usedColors.includes(c)) ?? CATEGORY_COLORS[0];
            addCategory({ section: 'capex', color: nextColor });
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300
            px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors
            hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>
    </div>
  );
}
