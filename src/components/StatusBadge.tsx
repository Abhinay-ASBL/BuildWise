import { useState, useRef, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { STATUS_CONFIG, STATUS_ORDER } from '../types';
import type { BudgetItemStatus } from '../types';

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
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium
          transition-colors ${config.bg} ${config.text} hover:opacity-80`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {status}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-36 rounded-lg border border-slate-200
            bg-white py-1 shadow-lg"
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
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs
                  transition-colors hover:bg-slate-50
                  ${isActive ? 'font-semibold' : 'font-normal'}`}
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${c.dot}`} />
                <span className={c.text}>{s}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
