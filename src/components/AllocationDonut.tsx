import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useCategories, useBudgetStore, useActiveScenario } from '../store';
import { formatINR, formatINRCompact, formatPercent } from '../utils/formatters';

interface SliceData {
  name: string;
  value: number;
  color: string;
}

// More vivid palette
const VIVID_COLORS = [
  '#0D9488', '#0369A1', '#7C3AED', '#DB2777', '#EA580C',
  '#CA8A04', '#059669', '#4F46E5', '#BE185D', '#DC2626',
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: SliceData }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl shadow-black/10 border border-white/60 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-semibold text-slate-900">{data.name}</span>
      </div>
      <div className="text-sm text-slate-600 mt-1 ml-5 font-medium">{formatINR(data.value)}</div>
    </div>
  );
}

function CenterLabel({
  cx,
  cy,
  total,
  projectName,
}: {
  cx: number;
  cy: number;
  total: number;
  projectName: string;
}) {
  // Truncate project name if too long
  const displayName = projectName.length > 16 ? projectName.slice(0, 14) + '...' : projectName;
  return (
    <g>
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        className="fill-slate-400"
        style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}
      >
        {displayName.toUpperCase()}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="fill-slate-900"
        style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'ui-monospace, monospace' }}
      >
        {formatINRCompact(total)}
      </text>
    </g>
  );
}

export default function AllocationDonut() {
  const capexCategories = useCategories('capex');
  const scenario = useBudgetStore((s) => s.scenarios[s.activeScenarioId]);
  const activeScenario = useActiveScenario();
  const projectName = activeScenario?.metadata.projectName ?? 'CAPEX';

  const data = useMemo(() => {
    if (!scenario) return [];
    const items = Object.values(scenario.lineItems).filter((li) => !li.isArchived);

    return capexCategories
      .map((cat, idx) => {
        const catTotal = items
          .filter((li) => li.categoryId === cat.id)
          .reduce((sum, li) => sum + li.unitCost * li.quantity, 0);
        return {
          name: cat.name,
          value: catTotal,
          color: VIVID_COLORS[idx % VIVID_COLORS.length],
        };
      })
      .filter((d) => d.value > 0);
  }, [capexCategories, scenario]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 flex items-center justify-center h-80">
        <span className="text-sm text-slate-400">No CAPEX data to display</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        CAPEX Allocation
      </h3>

      <div className="h-72 relative">
        {/* Subtle drop shadow behind the chart */}
        <div className="absolute inset-x-8 bottom-4 h-8 bg-black/[0.03] blur-xl rounded-full" />
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.color}
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <CustomTooltip
                  active={active}
                  payload={payload as unknown as ReadonlyArray<{ payload: SliceData }>}
                />
              )}
            />
            {/* Center text */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={0}
              dataKey="value"
              label={({ cx, cy }) => (
                <CenterLabel cx={cx} cy={cy} total={total} projectName={projectName} />
              )}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal pill legend */}
      <div className="flex flex-wrap gap-2 mt-3">
        {data.map((d) => (
          <div
            key={d.name}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50/80 border border-slate-200/60 text-xs transition-all duration-200 hover:scale-105 hover:shadow-sm"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-slate-600 font-medium">{d.name}</span>
            <span className="text-slate-800 font-bold">{formatINRCompact(d.value)}</span>
            <span className="text-slate-400">{formatPercent((d.value / total) * 100, 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
