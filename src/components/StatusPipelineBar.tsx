import { useState } from 'react';
import { useStatusBreakdown } from '../store';
import { STATUS_ORDER } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

interface TooltipData {
  status: string;
  amount: number;
  percent: number;
  x: number;
}

const statusGradientMap: Record<string, { from: string; to: string; pill: string }> = {
  TBC: { from: '#9CA3AF', to: '#6B7280', pill: 'bg-gray-100 text-gray-700 border-gray-200' },
  Estimated: { from: '#60A5FA', to: '#3B82F6', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  Quoted: { from: '#A78BFA', to: '#8B5CF6', pill: 'bg-violet-50 text-violet-700 border-violet-200' },
  Committed: { from: '#FBBF24', to: '#F59E0B', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  Invoiced: { from: '#FB923C', to: '#F97316', pill: 'bg-orange-50 text-orange-700 border-orange-200' },
  Paid: { from: '#34D399', to: '#10B981', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function StatusPipelineBar() {
  const breakdown = useStatusBreakdown();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;

  const segments = STATUS_ORDER.filter((s) => (breakdown[s] ?? 0) > 0).map((status) => ({
    status,
    amount: breakdown[status] ?? 0,
    percent: ((breakdown[status] ?? 0) / total) * 100,
    colors: statusGradientMap[status] ?? statusGradientMap.TBC,
  }));

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Budget by Status
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {formatINR(total)} total
        </span>
      </div>

      {/* Segmented bar */}
      <div className="relative">
        <div className="flex h-5 rounded-full overflow-hidden gap-[2px] shadow-inner bg-slate-100/60">
          {segments.map((seg, idx) => (
            <div
              key={seg.status}
              className="relative h-full cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-y-110"
              style={{
                width: `${Math.max(seg.percent, 2)}%`,
                background: `linear-gradient(135deg, ${seg.colors.from}, ${seg.colors.to})`,
                borderRadius:
                  idx === 0 && idx === segments.length - 1
                    ? '9999px'
                    : idx === 0
                      ? '9999px 0 0 9999px'
                      : idx === segments.length - 1
                        ? '0 9999px 9999px 0'
                        : '0',
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                setTooltip({
                  status: seg.status,
                  amount: seg.amount,
                  percent: seg.percent,
                  x: parentRect ? rect.left - parentRect.left + rect.width / 2 : 0,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {seg.percent > 10 && (
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white drop-shadow-sm">
                  {formatPercent(seg.percent, 0)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Subtle glow below bar */}
        <div className="h-3 mx-4 -mt-1 bg-gradient-to-b from-black/[0.04] to-transparent rounded-b-full blur-sm" />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute -top-[72px] z-10 bg-white/90 backdrop-blur-xl text-slate-800 text-xs rounded-xl px-4 py-2.5 whitespace-nowrap pointer-events-none shadow-xl shadow-black/10 border border-white/60"
            style={{
              left: tooltip.x,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-900">{tooltip.status}</div>
            <div className="text-slate-600 mt-0.5">
              {formatINR(tooltip.amount)} &middot; {formatPercent(tooltip.percent, 1)}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white/90 border-r border-b border-white/60" />
          </div>
        )}
      </div>

      {/* Legend — pill badges */}
      <div className="flex flex-wrap gap-2 mt-5">
        {segments.map((seg) => (
          <div
            key={seg.status}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${seg.colors.pill} transition-all duration-200 hover:scale-105`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${seg.colors.from}, ${seg.colors.to})`,
              }}
            />
            <span>{seg.status}</span>
            <span className="font-bold">{formatINR(seg.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
