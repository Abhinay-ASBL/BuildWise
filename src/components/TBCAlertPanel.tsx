import { useMemo } from 'react';
import { useTBCItems, useBudgetStore } from '../store';
import { formatINR } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, CircleDot } from 'lucide-react';

export default function TBCAlertPanel() {
  const tbcItems = useTBCItems();
  const scenario = useBudgetStore((s) => s.scenarios[s.activeScenarioId]);

  const grouped = useMemo(() => {
    if (!scenario) return [];

    const catMap = scenario.categories;
    const groups: Record<string, { categoryName: string; items: typeof tbcItems }> = {};

    for (const item of tbcItems) {
      const cat = catMap[item.categoryId];
      const catName = cat?.name ?? 'Unknown';
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = { categoryName: catName, items: [] };
      }
      groups[item.categoryId].items.push(item);
    }

    return Object.values(groups).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName)
    );
  }, [tbcItems, scenario]);

  const totalExposure = tbcItems.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0
  );

  if (tbcItems.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/90 to-green-50/80 backdrop-blur-xl border border-emerald-200/60 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300">
        {/* Green left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-2xl" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />

        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-600 rounded-xl p-2.5 shadow-sm">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <span className="text-sm font-bold text-emerald-900">
              All items have confirmed costs
            </span>
            <p className="text-xs text-emerald-600 mt-0.5">
              No pending cost confirmations. Budget figures are fully resolved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300">
      {/* Amber left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-l-2xl" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="bg-amber-100 text-amber-600 rounded-xl p-2.5 shadow-sm shrink-0">
            <AlertTriangle size={20} />
          </span>
          <div>
            <span className="text-sm font-bold text-slate-900">
              {tbcItems.length} item{tbcItems.length !== 1 ? 's' : ''} need cost confirmation
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Total TBC exposure:{' '}
              <span className="font-bold text-amber-700">{formatINR(totalExposure)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grouped list */}
      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.categoryName}>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {group.categoryName}
            </div>
            <div className="grid gap-2">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-200/40 hover:border-amber-300/60 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CircleDot size={14} className="text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-800 font-medium truncate group-hover:text-amber-900 transition-colors">
                        {item.name}
                      </div>
                      {item.team && (
                        <span className="text-xs text-slate-400">{item.team}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-800 font-mono tabular-nums shrink-0">
                    {formatINR(item.unitCost * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
