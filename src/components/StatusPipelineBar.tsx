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

export default function StatusPipelineBar() {
  const breakdown = useStatusBreakdown();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  if (total === 0) return null;

  const statusColorMap: Record<string, string> = {
    TBC: '#9CA3AF',
    Estimated: '#60A5FA',
    Quoted: '#A78BFA',
    Committed: '#F59E0B',
    Invoiced: '#F97316',
    Paid: '#34D399',
  };

  const segments = STATUS_ORDER.filter((s) => (breakdown[s] ?? 0) > 0).map((status) => ({
    status,
    amount: breakdown[status] ?? 0,
    percent: ((breakdown[status] ?? 0) / total) * 100,
    color: statusColorMap[status],
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Budget by Status</h3>

      {/* Segmented bar */}
      <div className="relative">
        <div className="flex h-8 rounded-lg overflow-hidden gap-0.5">
          {segments.map((seg) => (
            <div
              key={seg.status}
              className="relative h-full cursor-pointer transition-opacity hover:opacity-80"
              style={{
                width: `${Math.max(seg.percent, 1.5)}%`,
                backgroundColor: seg.color,
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
              {seg.percent > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {formatPercent(seg.percent, 0)}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute -top-14 z-10 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none shadow-lg"
            style={{
              left: tooltip.x,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold">{tooltip.status}</div>
            <div>
              {formatINR(tooltip.amount)} ({formatPercent(tooltip.percent, 1)})
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        {segments.map((seg) => (
          <div key={seg.status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-slate-600">
              {seg.status}{' '}
              <span className="font-medium text-slate-800">{formatINR(seg.amount)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
