import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { useCategories, useBudgetStore } from '../store';
import { formatINRCompact, formatINR } from '../utils/formatters';

interface ChartRow {
  name: string;
  budgetCap: number;
  actual: number;
  color: string;
  overBudget: boolean;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: ChartRow; dataKey: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const variance = row.budgetCap > 0 ? row.budgetCap - row.actual : 0;

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl shadow-black/10 border border-white/60 px-4 py-3 text-xs">
      <div className="font-bold text-slate-900 text-sm mb-1.5">{row.name}</div>
      {row.budgetCap > 0 && (
        <div className="text-slate-500 flex items-center gap-2">
          <span className="w-2.5 h-1.5 rounded-sm bg-blue-200 inline-block" />
          Budget: <span className="font-semibold text-slate-700">{formatINR(row.budgetCap)}</span>
        </div>
      )}
      <div className="text-slate-500 flex items-center gap-2 mt-0.5">
        <span
          className="w-2.5 h-1.5 rounded-sm inline-block"
          style={{ backgroundColor: row.overBudget ? '#EF4444' : row.color }}
        />
        Actual: <span className="font-semibold text-slate-700">{formatINR(row.actual)}</span>
      </div>
      {row.budgetCap > 0 && (
        <div
          className={`mt-1.5 pt-1.5 border-t border-slate-200 font-semibold ${
            variance >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {variance >= 0 ? 'Under' : 'Over'} by {formatINR(Math.abs(variance))}
        </div>
      )}
    </div>
  );
}

export default function BudgetVsActualChart() {
  const allCategories = useCategories();
  const scenario = useBudgetStore((s) => s.scenarios[s.activeScenarioId]);

  const data = useMemo<ChartRow[]>(() => {
    if (!scenario) return [];
    const items = Object.values(scenario.lineItems).filter((li) => !li.isArchived);

    return allCategories
      .map((cat) => {
        const actual = items
          .filter((li) => li.categoryId === cat.id)
          .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);

        return {
          name: cat.name,
          budgetCap: cat.budgetCap ?? 0,
          actual,
          color: cat.color,
          overBudget: cat.budgetCap != null && cat.budgetCap > 0 && actual > cat.budgetCap,
        };
      })
      .filter((row) => row.budgetCap > 0 || row.actual > 0);
  }, [allCategories, scenario]);

  if (data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 flex items-center justify-center h-80">
        <span className="text-sm text-slate-400">No budget data to display</span>
      </div>
    );
  }

  const chartHeight = Math.max(data.length * 60, 220);

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Budget vs Actual
      </h3>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 6"
              stroke="#E2E8F0"
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatINRCompact(v)}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: '#94A3B8',
                fontFamily: 'ui-monospace, monospace',
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload }) => (
                <CustomTooltip
                  active={active}
                  payload={
                    payload as unknown as ReadonlyArray<{
                      payload: ChartRow;
                      dataKey: string;
                      value: number;
                    }>
                  }
                />
              )}
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)', radius: 6 }}
            />
            <ReferenceLine x={0} stroke="#E2E8F0" />

            {/* Budget cap bar (lighter, patterned feel) */}
            <Bar dataKey="budgetCap" barSize={16} radius={[0, 6, 6, 0]} name="Budget Cap">
              {data.map((_entry, idx) => (
                <Cell key={idx} fill="#BFDBFE" opacity={0.7} />
              ))}
            </Bar>

            {/* Actual bar */}
            <Bar dataKey="actual" barSize={16} radius={[0, 6, 6, 0]} name="Actual">
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.overBudget ? '#EF4444' : entry.color}
                  style={
                    entry.overBudget
                      ? { filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.35))' }
                      : undefined
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-xs font-medium text-blue-700">
          <span className="w-3 h-2 rounded-sm bg-blue-200" />
          Budget Cap
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50/80 border border-slate-200/60 text-xs font-medium text-slate-700">
          <span className="w-3 h-2 rounded-sm bg-slate-400" />
          Actual
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50/80 border border-red-200/60 text-xs font-medium text-red-700">
          <span className="w-3 h-2 rounded-sm bg-red-500" />
          Over Budget
        </div>
      </div>
    </div>
  );
}
