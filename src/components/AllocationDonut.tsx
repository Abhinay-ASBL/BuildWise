import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCategories, useBudgetStore } from '../store';
import { formatINR, formatINRCompact, formatPercent } from '../utils/formatters';

interface SliceData {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: SliceData }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
        <span className="text-sm font-medium text-slate-800">{data.name}</span>
      </div>
      <div className="text-sm text-slate-600 mt-0.5">{formatINR(data.value)}</div>
    </div>
  );
}

function CenterLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-slate-500 text-xs">
        CAPEX
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-900 text-base font-bold">
        {formatINRCompact(total)}
      </text>
    </g>
  );
}

export default function AllocationDonut() {
  const capexCategories = useCategories('capex');
  const scenario = useBudgetStore((s) => s.scenarios[s.activeScenarioId]);

  const data = useMemo(() => {
    if (!scenario) return [];
    const items = Object.values(scenario.lineItems).filter((li) => !li.isArchived);

    return capexCategories
      .map((cat) => {
        const catTotal = items
          .filter((li) => li.categoryId === cat.id)
          .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
        return {
          name: cat.name,
          value: catTotal,
          color: cat.color,
        };
      })
      .filter((d) => d.value > 0);
  }, [capexCategories, scenario]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-center h-80">
        <span className="text-sm text-slate-400">No CAPEX data to display</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">CAPEX Allocation</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <CustomTooltip active={active} payload={payload as unknown as ReadonlyArray<{ payload: SliceData }>} />
              )}
            />
            {/* Center text rendered via customized label */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={0}
              dataKey="value"
              label={({ cx, cy }) => <CenterLabel cx={cx} cy={cy} total={total} />}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-slate-600">
              {d.name}{' '}
              <span className="font-medium text-slate-800">
                {formatINRCompact(d.value)}
              </span>
              <span className="text-slate-400 ml-1">
                {formatPercent((d.value / total) * 100, 0)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
