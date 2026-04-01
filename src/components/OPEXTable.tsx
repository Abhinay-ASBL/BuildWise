import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Plus,
  Copy,
  Archive,
  MoreHorizontal,
  Check,
  Pencil,
  Calendar,
  TrendingUp,
  IndianRupee,
} from 'lucide-react';
import {
  useBudgetStore,
  useCategories,
  useCategoryItems,
  useSectionTotal,
  useActiveScenario,
} from '../store';
import {
  STATUS_CONFIG,
  STATUS_ORDER,
  type BudgetItemStatus,
  type BudgetLineItem,
  type Team,
} from '../types';
import { formatINR, formatIndianNumber } from '../utils/formatters';

// ─── Status gradients (matching StatusBadge) ──────────────────────
const STATUS_GRADIENT: Record<BudgetItemStatus, string> = {
  TBC: 'bg-gradient-to-r from-slate-100 to-slate-50',
  Estimated: 'bg-gradient-to-r from-blue-100/80 to-blue-50',
  Quoted: 'bg-gradient-to-r from-violet-100/80 to-violet-50',
  Committed: 'bg-gradient-to-r from-amber-100/80 to-amber-50',
  Invoiced: 'bg-gradient-to-r from-orange-100/80 to-orange-50',
  Paid: 'bg-gradient-to-r from-emerald-100/80 to-emerald-50',
};

const STATUS_HOVER: Record<BudgetItemStatus, string> = {
  TBC: 'hover:bg-slate-50',
  Estimated: 'hover:bg-blue-50/60',
  Quoted: 'hover:bg-violet-50/60',
  Committed: 'hover:bg-amber-50/60',
  Invoiced: 'hover:bg-orange-50/60',
  Paid: 'hover:bg-emerald-50/60',
};

// ─── Inline Editable Cell ──────────────────────────────────────────
function InlineEditCell({
  value,
  itemId,
  field,
  type = 'text',
  align = 'left',
  className = '',
}: {
  value: string | number;
  itemId: string;
  field: keyof BudgetLineItem;
  type?: 'text' | 'number';
  align?: 'left' | 'right';
  className?: string;
}) {
  const editingCellId = useBudgetStore((s) => s.editingCellId);
  const setEditingCell = useBudgetStore((s) => s.setEditingCell);
  const updateLineItem = useBudgetStore((s) => s.updateLineItem);
  const cellId = `${itemId}-${field}`;
  const isEditing = editingCellId === cellId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = useCallback(() => {
    const parsed = type === 'number' ? parseFloat(draft) || 0 : draft;
    updateLineItem(itemId, { [field]: parsed });
    setEditingCell(null);
  }, [draft, type, field, itemId, updateLineItem, setEditingCell]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(String(value));
      setEditingCell(null);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        {type === 'number' && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-[tabular-nums]">
            ₹
          </span>
        )}
        <input
          ref={inputRef}
          type={type === 'number' ? 'number' : 'text'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg border border-teal-300 bg-white px-2.5 py-1.5 text-sm
            shadow-sm outline-none ring-2 ring-teal-500/20 transition-all duration-200
            ${type === 'number' ? 'pl-6' : ''}
            ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
        />
      </div>
    );
  }

  const displayValue =
    type === 'number'
      ? formatIndianNumber(Number(value))
      : value || '\u2014';

  return (
    <span
      onClick={() => setEditingCell(cellId)}
      className={`group/cell relative block cursor-pointer rounded-lg px-2.5 py-1.5 text-sm
        transition-all duration-200 hover:bg-teal-50/50
        ${align === 'right' ? 'text-right tabular-nums' : 'text-left'} ${className}`}
    >
      {type === 'number' && (
        <span className="mr-0.5 text-slate-300 font-[tabular-nums]">₹</span>
      )}
      {type === 'number' ? String(displayValue).replace(/^₹\s*/, '') : displayValue}
      <Pencil className="absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300
        opacity-0 transition-opacity duration-200 group-hover/cell:opacity-100" />
    </span>
  );
}

// ─── Status Pill ───────────────────────────────────────────────────
function StatusPill({
  status,
  itemId,
}: {
  status: BudgetItemStatus;
  itemId: string;
}) {
  const [open, setOpen] = useState(false);
  const updateItemStatus = useBudgetStore((s) => s.updateItemStatus);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const config = STATUS_CONFIG[status];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
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
              const sc = STATUS_CONFIG[s];
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
                  <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${sc.dot} shadow-sm`} />
                  <span className={`flex-1 ${sc.text}`}>{s}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-teal-600" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Team Selector ─────────────────────────────────────────────────
function TeamSelector({ team, itemId }: { team: Team; itemId: string }) {
  const [open, setOpen] = useState(false);
  const updateItemTeam = useBudgetStore((s) => s.updateItemTeam);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options: Team[] = ['PMO', 'AAED', null];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600
          transition-all duration-200 hover:bg-slate-100"
      >
        {team ?? '\u2014'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-1.5 w-28 overflow-hidden rounded-xl
              border border-white/60 bg-white/90 py-1 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            {options.map((t) => (
              <button
                key={t ?? 'none'}
                onClick={() => {
                  updateItemTeam(itemId, t);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs
                  transition-all duration-150 hover:bg-slate-50
                  ${t === team ? 'font-semibold text-slate-800' : 'text-slate-600'}`}
              >
                <span className="flex-1">{t ?? 'None'}</span>
                {t === team && <Check className="h-3 w-3 text-teal-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Row Actions Menu ──────────────────────────────────────────────
function RowActions({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const duplicateLineItem = useBudgetStore((s) => s.duplicateLineItem);
  const archiveLineItem = useBudgetStore((s) => s.archiveLineItem);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1.5 text-slate-400 transition-all duration-200
          hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-xl
              border border-white/60 bg-white/95 py-1 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            <button
              onClick={() => {
                duplicateLineItem(itemId);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50"
            >
              <Copy size={12} className="text-slate-400" /> Duplicate
            </button>
            <button
              onClick={() => {
                archiveLineItem(itemId);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs
                font-medium text-red-600 transition-colors duration-150 hover:bg-red-50"
            >
              <Archive size={12} /> Archive
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Category Section ──────────────────────────────────────────────
function CategorySection({ categoryId }: { categoryId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const category = useBudgetStore(
    (s) => s.scenarios[s.activeScenarioId]?.categories[categoryId]
  );
  const items = useCategoryItems(categoryId);
  const addLineItem = useBudgetStore((s) => s.addLineItem);

  if (!category) return null;

  const monthlySubtotal = items.reduce(
    (sum, li) => sum + li.unitCost * li.quantity,
    0
  );

  return (
    <div className="mb-1">
      {/* Category Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-3 rounded-xl px-5 py-3 text-left
          transition-colors duration-200 hover:bg-slate-50/60"
      >
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out
            ${collapsed ? '-rotate-90' : 'rotate-0'}`}
        />
        <span
          className="h-3.5 w-3.5 flex-shrink-0 rounded-full ring-2 ring-white shadow-sm"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 text-[15px] font-semibold text-slate-800">
          {category.name}
        </span>
        <span className="rounded-full bg-amber-50/80 px-3 py-1 text-sm font-semibold tabular-nums text-amber-700">
          {formatINR(monthlySubtotal)}/mo
        </span>
      </button>

      {/* Items Table */}
      <div
        className={`grid transition-all duration-300 ease-out
          ${collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}
      >
        <div className="overflow-hidden">
          <div className="mt-1">
            <table className="w-full">
              <tbody>
                {items.map((item, idx) => {
                  const rowTotal = item.unitCost * item.quantity;
                  const isTBC = item.status === 'TBC';
                  return (
                    <tr
                      key={item.id}
                      className={`group border-b border-slate-100/80 transition-all duration-150
                        hover:bg-teal-50/30
                        ${isTBC
                          ? 'border-l-2 border-dashed border-l-amber-300 bg-amber-50/30'
                          : ''
                        }`}
                    >
                      {/* Row number */}
                      <td className="w-8 py-2 pl-5 pr-1 text-right text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      {/* Item name */}
                      <td className="min-w-[180px] py-2">
                        <InlineEditCell
                          value={item.name}
                          itemId={item.id}
                          field="name"
                          className={isTBC ? 'italic text-slate-500' : ''}
                        />
                      </td>
                      {/* Monthly Cost */}
                      <td className="w-32 py-2">
                        <InlineEditCell
                          value={item.unitCost}
                          itemId={item.id}
                          field="unitCost"
                          type="number"
                          align="right"
                        />
                      </td>
                      {/* Qty */}
                      <td className="w-20 py-2">
                        <InlineEditCell
                          value={item.quantity}
                          itemId={item.id}
                          field="quantity"
                          type="number"
                          align="right"
                        />
                      </td>
                      {/* Total/Month */}
                      <td className="w-32 py-2 pr-2">
                        <div
                          className={`rounded-lg px-2.5 py-1 text-right text-sm font-semibold tabular-nums
                            ${isTBC
                              ? 'bg-amber-50/50 text-amber-700/70'
                              : 'bg-slate-50/80 text-teal-700'
                            }`}
                        >
                          {formatINR(rowTotal)}
                        </div>
                      </td>
                      {/* Status */}
                      <td className="w-28 py-2">
                        <StatusPill status={item.status} itemId={item.id} />
                      </td>
                      {/* Team */}
                      <td className="w-20 py-2">
                        <TeamSelector team={item.team} itemId={item.id} />
                      </td>
                      {/* Remark */}
                      <td className="min-w-[120px] py-2">
                        <InlineEditCell
                          value={item.remark}
                          itemId={item.id}
                          field="remark"
                          className="text-slate-400"
                        />
                      </td>
                      {/* Actions */}
                      <td className="w-10 py-2 pr-3">
                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <RowActions itemId={item.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Add Item Button */}
            <button
              onClick={() =>
                addLineItem(categoryId, { unit: 'months', name: 'New Item' })
              }
              className="ml-5 mt-1.5 mb-3 flex items-center gap-1.5 text-xs font-semibold
                text-teal-600 transition-all duration-200 hover:text-teal-700 hover:underline"
            >
              <Plus size={12} />
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OPEX Table Component ──────────────────────────────────────────
export default function OPEXTable() {
  const opexCategories = useCategories('opex');
  const monthlyTotal = useSectionTotal('opex');
  const scenario = useActiveScenario();

  const opexMonths = scenario?.metadata.opexMonths ?? 24;
  const annualTotal = monthlyTotal * 12;
  const durationTotal = monthlyTotal * opexMonths;

  return (
    <div className="space-y-4">
      {/* Table Card — glass container */}
      <div
        className="overflow-hidden rounded-2xl border border-white/60 bg-white/80
          shadow-lg shadow-black/5 backdrop-blur-xl"
      >
        {/* Column Headers */}
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
          <div className="grid grid-cols-[2rem_1fr_8rem_5rem_8rem_7rem_5rem_1fr_2.5rem] items-center gap-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Item</span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Cost</span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Qty</span>
            <span className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total/Month</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Team</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Remark</span>
            <span />
          </div>
        </div>

        {/* Category Sections */}
        <div className="divide-y divide-slate-100/60 p-2">
          {opexCategories.map((cat) => (
            <CategorySection key={cat.id} categoryId={cat.id} />
          ))}
        </div>

        {/* Empty State */}
        {opexCategories.length === 0 && (
          <div className="py-14 text-center text-sm text-slate-400">
            No OPEX categories yet. Add a category to get started.
          </div>
        )}

        {/* ─── Summary Footer — amber/orange gradient ──────── */}
        <div className="border-t border-slate-200/60">
          {/* Monthly Total — gradient card */}
          <div
            className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-500
              px-7 py-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <IndianRupee className="h-5 w-5 text-white/90" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-100/80">
                  Monthly Total
                </span>
                <span className="text-2xl font-bold tracking-tight text-white font-[tabular-nums]">
                  {formatINR(monthlyTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Projections */}
          <div className="bg-slate-50/60">
            {/* Annual Projection */}
            <div className="flex items-center justify-between border-b border-slate-100/80 px-7 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/60">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Annual Projection
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    Monthly x 12
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-bold tabular-nums text-amber-700 shadow-sm">
                {formatINR(annualTotal)}
              </span>
            </div>

            {/* Project Duration Total */}
            {opexMonths > 0 && (
              <div className="flex items-center justify-between px-7 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100/60">
                    <Calendar className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      Project Duration Total
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      Monthly x {opexMonths} months
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-bold tabular-nums text-orange-700 shadow-sm">
                  {formatINR(durationTotal)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
