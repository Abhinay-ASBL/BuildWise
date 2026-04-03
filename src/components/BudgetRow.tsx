import { useState, useRef, useEffect } from 'react';
import { Copy, Archive, MoreVertical } from 'lucide-react';
import { useBudgetStore } from '../store';
import type { BudgetLineItem, Team } from '../types';
import { formatINR } from '../utils/formatters';
import EditableCell from './EditableCell';
import StatusBadge from './StatusBadge';

const UNITS = ['sqft', 'nos', 'lumpsum', 'months'] as const;
const TEAMS: { value: Team; label: string }[] = [
  { value: 'PMO', label: 'PMO' },
  { value: 'AAED', label: 'AAED' },
  { value: null, label: '\u2014' },
];

interface BudgetRowProps {
  item: BudgetLineItem;
}

export default function BudgetRow({ item }: BudgetRowProps) {
  const updateLineItem = useBudgetStore((s) => s.updateLineItem);
  const updateItemTeam = useBudgetStore((s) => s.updateItemTeam);
  const duplicateLineItem = useBudgetStore((s) => s.duplicateLineItem);
  const archiveLineItem = useBudgetStore((s) => s.archiveLineItem);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const total = item.unitCost * item.quantity;
  const isTBC = item.status === 'TBC';


  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <tr
      className={`group border-b border-slate-100/80 transition-all duration-150
        hover:bg-teal-50/30
        ${isTBC ? 'border-l-2 border-dashed border-l-amber-300 bg-amber-50/30' : ''}
      `}
    >
      {/* Item Name */}
      <td className="py-2 pl-5 pr-2">
        <EditableCell
          value={item.name}
          itemId={item.id}
          field="name"
          type="text"
          formatDisplay={(v) => String(v)}
          className={isTBC ? 'text-slate-500 italic' : ''}
        />
      </td>

      {/* Per Unit Cost */}
      <td className="px-2 py-2">
        <EditableCell
          value={item.unitCost}
          itemId={item.id}
          field="unitCost"
          type="currency"
          formatDisplay={(v) => formatINR(Number(v))}
        />
      </td>

      {/* Quantity */}
      <td className="px-2 py-2">
        <EditableCell
          value={item.quantity}
          itemId={item.id}
          field="quantity"
          type="number"
          formatDisplay={(v) => String(Number(v).toLocaleString('en-IN'))}
        />
      </td>

      {/* Unit */}
      <td className="px-2 py-2">
        <select
          value={item.unit}
          onChange={(e) => updateLineItem(item.id, { unit: e.target.value })}
          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1
            text-xs text-slate-600 transition-all duration-200
            hover:border-slate-200 hover:bg-white
            focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </td>

      {/* Total (read-only) */}
      <td className="px-2 py-2">
        <div
          className={`rounded-lg px-2.5 py-1.5 text-right text-sm font-semibold font-[tabular-nums]
            ${isTBC
              ? 'bg-amber-50/50 text-amber-700/70'
              : 'bg-slate-50/80 text-teal-700'
            }`}
        >
          {formatINR(total)}
        </div>
      </td>

      {/* Status */}
      <td className="px-2 py-2">
        <StatusBadge itemId={item.id} status={item.status} />
      </td>

      {/* Team */}
      <td className="px-2 py-2">
        <select
          value={item.team ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            updateItemTeam(item.id, val === '' ? null : (val as 'PMO' | 'AAED'));
          }}
          className="w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1
            text-xs text-slate-600 transition-all duration-200
            hover:border-slate-200 hover:bg-white
            focus:border-teal-300 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
        >
          {TEAMS.map((t) => (
            <option key={t.label} value={t.value ?? ''}>
              {t.label}
            </option>
          ))}
        </select>
      </td>

      {/* Remark */}
      <td className="max-w-[160px] px-2 py-2">
        <EditableCell
          value={item.remark}
          itemId={item.id}
          field="remark"
          type="text"
          formatDisplay={(v) => String(v) || '\u2014'}
          className="text-xs text-slate-400"
        />
      </td>

      {/* Actions */}
      <td className="px-2 py-2">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all duration-200
              hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
            aria-label="Row actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl
                border border-white/60 bg-white/95 py-1 shadow-xl shadow-black/10 backdrop-blur-xl
                animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <button
                onClick={() => {
                  duplicateLineItem(item.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                  font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  archiveLineItem(item.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                  font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
