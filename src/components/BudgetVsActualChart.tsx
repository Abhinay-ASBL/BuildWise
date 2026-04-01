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
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-xs">
      <div className="font-semibold text-slate-800 mb-1">{row.name}</div>
      {row.budgetCap > 0 && (
        <div className="text-slate-600">
          Budget: <span className="font-medium">{formatINR(row.budgetCap)}</span>
        </div>
      )}
      <div className="text-slate-600">
        Actual: <span className="font-medium">{formatINR(row.actual)}</span>
      </div>
      {row.budgetCap > 0 && (
        <div className={variance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-center h-80">
        <span className="text-sm text-slate-400">No budget data to display</span>
      </div>
    );
  }

  const chartHeight = Math.max(data.length * 56, 200);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Budget vs Actual</h3>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <XAxis
              type="number"
              tickFormatter={(v: number) => formatINRCompact(v)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <Tooltip
              content={({ active, payload }) => (
                <CustomTooltip
                  active={active}
                  payload={payload as unknown as ReadonlyArray<{ payload: ChartRow; dataKey: string; value: number }>}
                />
              )}
              cursor={{ fill: '#F8FAFC' }}
            />
            <ReferenceLine x={0} stroke="#E2E8F0" />

            {/* Budget cap bar (light) */}
            <Bar dataKey="budgetCap" barSize={14} radius={[0, 4, 4, 0]} name="Budget Cap">
              {data.map((_entry, idx) => (
                <Cell key={idx} fill="#BFDBFE" />
              ))}
            </Bar>

            {/* Actual bar */}
            <Bar dataKey="actual" barSize={14} radius={[0, 4, 4, 0]} name="Actual">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.overBudget ? '#EF4444' : entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2.5 rounded-sm bg-blue-200" />
          Budget Cap
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2.5 rounded-sm bg-slate-500" />
          Actual
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-2.5 rounded-sm bg-red-500" />
          Over Budget
        </div>
      </div>
    </div>
  );
}
