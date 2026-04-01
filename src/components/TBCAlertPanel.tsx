import { useMemo } from 'react';
import { useTBCItems, useBudgetStore } from '../store';
import { formatINR } from '../utils/formatters';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-xl p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">
            All items have confirmed costs
          </span>
        </div>
        <p className="text-xs text-emerald-600 mt-1 ml-6">
          No pending cost confirmations. Budget figures are fully resolved.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <div>
            <span className="text-sm font-semibold text-amber-900">
              {tbcItems.length} item{tbcItems.length !== 1 ? 's' : ''} need cost confirmation
            </span>
            <p className="text-xs text-amber-700 mt-0.5">
              Total TBC exposure: <span className="font-semibold">{formatINR(totalExposure)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grouped list */}
      <div className="space-y-3">
        {grouped.map((group) => (
          <div key={group.categoryName}>
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5">
              {group.categoryName}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white/60 hover:bg-white transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-slate-800 truncate group-hover:text-amber-900">
                      {item.name}
                    </div>
                    {item.team && (
                      <span className="text-xs text-slate-500">{item.team}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-amber-800 tabular-nums shrink-0">
                    {formatINR(item.unitCost * item.quantity)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
