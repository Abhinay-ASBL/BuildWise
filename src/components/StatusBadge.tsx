import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useBudgetStore } from '../store';
import { STATUS_CONFIG, STATUS_ORDER } from '../types';
import type { BudgetItemStatus } from '../types';

// Gradient backgrounds for each status — subtle and premium
const STATUS_GRADIENT: Record<BudgetItemStatus, string> = {
  TBC: 'bg-gradient-to-r from-slate-100 to-slate-50',
  Estimated: 'bg-gradient-to-r from-blue-100/80 to-blue-50',
  Quoted: 'bg-gradient-to-r from-violet-100/80 to-violet-50',
  Committed: 'bg-gradient-to-r from-amber-100/80 to-amber-50',
  Invoiced: 'bg-gradient-to-r from-orange-100/80 to-orange-50',
  Paid: 'bg-gradient-to-r from-emerald-100/80 to-emerald-50',
};

// Hover tints for dropdown options
const STATUS_HOVER: Record<BudgetItemStatus, string> = {
  TBC: 'hover:bg-slate-50',
  Estimated: 'hover:bg-blue-50/60',
  Quoted: 'hover:bg-violet-50/60',
  Committed: 'hover:bg-amber-50/60',
  Invoiced: 'hover:bg-orange-50/60',
  Paid: 'hover:bg-emerald-50/60',
};

interface StatusBadgeProps {
  itemId: string;
  status: BudgetItemStatus;
}

export default function StatusBadge({ itemId, status }: StatusBadgeProps) {
  const updateItemStatus = useBudgetStore((s) => s.updateItemStatus);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const config = STATUS_CONFIG[status];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold
          shadow-sm transition-all duration-200 hover:shadow-md
          ${STATUS_GRADIENT[status]} ${config.text}`}
      >
        <span className={`h-2 w-2 rounded-full ${config.dot} shadow-sm`} />
        {status}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl
              border border-white/60 bg-white/90 py-1 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            {STATUS_ORDER.map((s) => {
              const c = STATUS_CONFIG[s];
              const isActive = s === status;
              return (
                <button
                  key={s}
                  onClick={() => {
                    updateItemStatus(itemId, s);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                    transition-all duration-150
                    ${STATUS_HOVER[s]}
                    ${isActive ? 'font-semibold' : 'font-medium'}`}
                >
                  <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${c.dot} shadow-sm`} />
                  <span className={`flex-1 ${c.text}`}>{s}</span>
                  {isActive && (
                    <Check className="h-3.5 w-3.5 text-teal-600" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
