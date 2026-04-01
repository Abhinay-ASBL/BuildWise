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
      className={`group border-b border-slate-100 transition-colors hover:bg-blue-50/30
        ${isTBC ? 'border-l-2 border-l-gray-300 border-dashed bg-gray-50/50' : ''}`}
    >
      {/* Item Name */}
      <td className="py-1.5 pl-3 pr-2">
        <EditableCell
          value={item.name}
          itemId={item.id}
          field="name"
          type="text"
          formatDisplay={(v) => String(v)}
          className={isTBC ? 'text-gray-500' : ''}
        />
      </td>

      {/* Per Unit Cost */}
      <td className="px-2 py-1.5">
        <EditableCell
          value={item.unitCost}
          itemId={item.id}
          field="unitCost"
          type="currency"
          formatDisplay={(v) => formatINR(Number(v))}
        />
      </td>

      {/* Quantity */}
      <td className="px-2 py-1.5">
        <EditableCell
          value={item.quantity}
          itemId={item.id}
          field="quantity"
          type="number"
          formatDisplay={(v) => String(Number(v).toLocaleString('en-IN'))}
        />
      </td>

      {/* Unit */}
      <td className="px-2 py-1.5">
        <select
          value={item.unit}
          onChange={(e) => updateLineItem(item.id, { unit: e.target.value })}
          className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5
            text-xs text-gray-600 transition-colors hover:border-slate-200 hover:bg-white
            focus:border-blue-300 focus:ring-1 focus:ring-blue-200 focus:outline-none"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </td>

      {/* Total (read-only) */}
      <td className="px-2 py-1.5">
        <div className="rounded-md bg-gray-50 px-2 py-1 text-right text-sm font-medium font-[tabular-nums] text-gray-700">
          {formatINR(total)}
        </div>
      </td>

      {/* Status */}
      <td className="px-2 py-1.5">
        <StatusBadge itemId={item.id} status={item.status} />
      </td>

      {/* Team */}
      <td className="px-2 py-1.5">
        <select
          value={item.team ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            updateItemTeam(item.id, val === '' ? null : (val as 'PMO' | 'AAED'));
          }}
          className="w-full rounded-md border border-transparent bg-transparent px-1 py-0.5
            text-xs text-gray-600 transition-colors hover:border-slate-200 hover:bg-white
            focus:border-blue-300 focus:ring-1 focus:ring-blue-200 focus:outline-none"
        >
          {TEAMS.map((t) => (
            <option key={t.label} value={t.value ?? ''}>
              {t.label}
            </option>
          ))}
        </select>
      </td>

      {/* Remark */}
      <td className="max-w-[160px] px-2 py-1.5">
        <div
          className="truncate text-xs text-gray-500"
          title={item.remark || undefined}
        >
          {item.remark || '\u2014'}
        </div>
      </td>

      {/* Actions */}
      <td className="px-2 py-1.5">
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="rounded-md p-1 text-gray-400 opacity-0 transition-all
              hover:bg-slate-100 hover:text-gray-600 group-hover:opacity-100"
            aria-label="Row actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-slate-200
                bg-white py-1 shadow-lg"
            >
              <button
                onClick={() => {
                  duplicateLineItem(item.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs
                  text-gray-700 transition-colors hover:bg-slate-50"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  archiveLineItem(item.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs
                  text-red-600 transition-colors hover:bg-red-50"
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
