import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Building2, Ruler, IndianRupee, TrendingUp } from 'lucide-react';
import {
  useCategories,
  useCategoryItems,
  useSectionTotal,
  useActiveScenario,
} from '../store';
import type { BudgetCategory } from '../types';
import {
  formatINR,
  formatINRCompact,
  formatCostPerSqft,
  formatIndianNumber,
} from '../utils/formatters';

// ─── Helpers ───────────────────────────────────────────────────────

/** Hook: compute total cost for a single category (non-archived items) */
function useCatTotal(categoryId: string): number {
  const items = useCategoryItems(categoryId);
  return items.reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
}

/** Wrapper component that reads per-category total via hooks */
function CategoryCostRow({
  category,
  totalBUA,
  maxCostPerSqft,
}: {
  category: BudgetCategory;
  totalBUA: number;
  maxCostPerSqft: number;
}) {
  const total = useCatTotal(category.id);
  const costPerSqft = totalBUA > 0 ? total / totalBUA : 0;
  const barWidth = maxCostPerSqft > 0 ? (costPerSqft / maxCostPerSqft) * 100 : 0;

  if (total === 0) return null;

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="py-2.5 pl-4 pr-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-sm text-slate-700">{category.name}</span>
        </div>
      </td>
      <td className="py-2.5 pr-4 text-right text-sm tabular-nums text-slate-700">
        {formatINR(total)}
      </td>
      <td className="py-2.5 pr-4 text-right text-sm tabular-nums text-slate-500">
        {formatIndianNumber(totalBUA)}
      </td>
      <td className="py-2.5 pr-4 text-right text-sm font-medium tabular-nums text-slate-800">
        {formatCostPerSqft(costPerSqft)}
      </td>
      <td className="w-40 py-2.5 pr-4">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(barWidth, 1)}%`,
              backgroundColor: category.color,
            }}
          />
        </div>
      </td>
    </tr>
  );
}

/** Component to compute max cost/sqft across categories (needs hooks) */
function CostPerSqftTable({
  categories,
  totalBUA,
}: {
  categories: BudgetCategory[];
  totalBUA: number;
}) {
  // We need per-category totals for the max calculation.
  // Since hooks can't be called in loops, we compute section total
  // and use that for the grand total row. Individual rows use their own hooks.
  const capexTotal = useSectionTotal('capex');
  const grandCostPerSqft = totalBUA > 0 ? capexTotal / totalBUA : 0;

  // Estimate max cost/sqft — use capex total as upper bound for bar scaling
  const maxCostPerSqft = grandCostPerSqft * 1.2;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Cost Per Sqft Analysis
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          CAPEX breakdown by category per sqft of BUA
        </p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/60">
            <th className="py-2 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Category
            </th>
            <th className="py-2 pr-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Cost
            </th>
            <th className="py-2 pr-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              Area (BUA)
            </th>
            <th className="py-2 pr-4 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
              Cost/Sqft
            </th>
            <th className="w-40 py-2 pr-4 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Relative
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <CategoryCostRow
              key={cat.id}
              category={cat}
              totalBUA={totalBUA}
              maxCostPerSqft={maxCostPerSqft}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200 bg-slate-50">
            <td className="py-3 pl-4 pr-3 text-sm font-bold text-slate-800">
              Grand Total
            </td>
            <td className="py-3 pr-4 text-right text-sm font-bold tabular-nums text-slate-800">
              {formatINR(capexTotal)}
            </td>
            <td className="py-3 pr-4 text-right text-sm tabular-nums text-slate-500">
              {formatIndianNumber(totalBUA)}
            </td>
            <td className="py-3 pr-4 text-right text-sm font-bold tabular-nums text-slate-900">
              {formatCostPerSqft(grandCostPerSqft)}
            </td>
            <td className="w-40 py-3 pr-4">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-full rounded-full bg-slate-600" />
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────
function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'blue',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const palette = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  };
  const p = palette[color];

  return (
    <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
      <div className={`rounded-lg p-2 ${p.bg}`}>
        <Icon size={20} className={p.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">
          {value}
        </p>
        {sub && (
          <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ─── Recharts Custom Tooltip ───────────────────────────────────────
function AreaTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; areaSqft: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-800">{d.label}</p>
      <p className="mt-0.5 tabular-nums text-slate-600">
        {formatIndianNumber(d.areaSqft)} sqft
      </p>
    </div>
  );
}

// ─── Area Analysis Component ───────────────────────────────────────
export default function AreaAnalysis() {
  const scenario = useActiveScenario();
  const capexCategories = useCategories('capex');
  const capexTotal = useSectionTotal('capex');
  const opexMonthly = useSectionTotal('opex');

  const metadata = scenario?.metadata;
  const areaStatement = scenario?.areaStatement ?? [];
  const totalBUA = metadata?.totalBUA ?? 1;
  const totalArea = metadata?.totalArea ?? 1;

  // Chart data — color BUA vs Landscape differently
  const chartData = useMemo(() => {
    return areaStatement.map((a) => ({
      ...a,
      fill: a.label.toLowerCase().includes('landscape')
        ? '#27AE60'
        : '#4A90D9',
    }));
  }, [areaStatement]);

  const capexPerSqft = totalBUA > 0 ? capexTotal / totalBUA : 0;
  const opexPerSqftMonth = totalBUA > 0 ? opexMonthly / totalBUA : 0;
  const totalCostPerSqft =
    totalBUA > 0 ? (capexTotal + opexMonthly * 12) / totalBUA : 0;

  return (
    <div className="space-y-6">
      {/* ── Summary KPI Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={Building2}
          label="Total BUA"
          value={`${formatIndianNumber(totalBUA)} sqft`}
          sub={`Total with landscape: ${formatIndianNumber(totalArea)} sqft`}
          color="blue"
        />
        <KPICard
          icon={IndianRupee}
          label="CAPEX / sqft"
          value={formatCostPerSqft(capexPerSqft)}
          sub={`Total: ${formatINRCompact(capexTotal)}`}
          color="emerald"
        />
        <KPICard
          icon={TrendingUp}
          label="OPEX / sqft / month"
          value={formatCostPerSqft(opexPerSqftMonth)}
          sub={`Monthly total: ${formatINRCompact(opexMonthly)}`}
          color="amber"
        />
        <KPICard
          icon={Ruler}
          label="Total Cost / sqft"
          value={formatCostPerSqft(totalCostPerSqft)}
          sub="CAPEX + Annual OPEX / BUA"
          color="violet"
        />
      </div>

      {/* ── Area Breakdown ────────────────────────────── */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">
            Area Breakdown
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Built-up and landscape area distribution
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* Area Cards */}
          <div className="space-y-3">
            {areaStatement.map((a, i) => {
              const isLandscape = a.label.toLowerCase().includes('landscape');
              const pct = totalArea > 0 ? (a.areaSqft / totalArea) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: isLandscape ? '#27AE60' : '#4A90D9',
                      }}
                    />
                    <span className="text-sm text-slate-700">{a.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold tabular-nums text-slate-800">
                      {formatIndianNumber(a.areaSqft)} sqft
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Total BUA */}
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
              <span className="text-sm font-semibold text-blue-800">
                Total BUA
              </span>
              <span className="text-sm font-bold tabular-nums text-blue-900">
                {formatIndianNumber(totalBUA)} sqft
              </span>
            </div>

            {/* Total with Landscape */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <span className="text-sm font-semibold text-emerald-800">
                Total with Landscape
              </span>
              <span className="text-sm font-bold tabular-nums text-emerald-900">
                {formatIndianNumber(totalArea)} sqft
              </span>
            </div>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={Math.max(200, areaStatement.length * 55 + 40)}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}K`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<AreaTooltip />} />
                <Bar dataKey="areaSqft" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Cost Per Sqft Analysis ────────────────────── */}
      <CostPerSqftTable categories={capexCategories} totalBUA={totalBUA} />
    </div>
  );
}
