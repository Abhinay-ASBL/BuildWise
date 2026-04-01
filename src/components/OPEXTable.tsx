import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Copy,
  Archive,
  MoreHorizontal,
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
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={`w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm outline-none ring-2 ring-blue-100 ${
          align === 'right' ? 'text-right' : 'text-left'
        } ${className}`}
      />
    );
  }

  const displayValue =
    type === 'number'
      ? formatIndianNumber(Number(value))
      : value || '\u2014';

  return (
    <span
      onClick={() => setEditingCell(cellId)}
      className={`block cursor-pointer rounded px-2 py-1 text-sm hover:bg-slate-50 ${
        align === 'right' ? 'text-right tabular-nums' : 'text-left'
      } ${className}`}
    >
      {displayValue}
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
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {status}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {STATUS_ORDER.map((s) => {
            const sc = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => {
                  updateItemStatus(itemId, s);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${
                  s === status ? 'font-semibold' : ''
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                <span className={sc.text}>{s}</span>
              </button>
            );
          })}
        </div>
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
        className="rounded px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
      >
        {team ?? '\u2014'}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-24 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {options.map((t) => (
            <button
              key={t ?? 'none'}
              onClick={() => {
                updateItemTeam(itemId, t);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${
                t === team ? 'font-semibold text-slate-800' : 'text-slate-600'
              }`}
            >
              {t ?? 'None'}
            </button>
          ))}
        </div>
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
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => {
              duplicateLineItem(itemId);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
          >
            <Copy size={12} /> Duplicate
          </button>
          <button
            onClick={() => {
              archiveLineItem(itemId);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
          >
            <Archive size={12} /> Archive
          </button>
        </div>
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
    <div className="mb-2">
      {/* Category Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-3 rounded-lg bg-slate-50 px-4 py-2.5 text-left transition-colors hover:bg-slate-100"
      >
        {collapsed ? (
          <ChevronRight size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="flex-1 text-sm font-semibold text-slate-800">
          {category.name}
        </span>
        <span className="text-sm font-medium tabular-nums text-slate-600">
          {formatINR(monthlySubtotal)}/mo
        </span>
      </button>

      {/* Items Table */}
      {!collapsed && (
        <div className="mt-1">
          <table className="w-full">
            <tbody>
              {items.map((item, idx) => {
                const rowTotal = item.unitCost * item.quantity;
                const isTBC = item.status === 'TBC';
                return (
                  <tr
                    key={item.id}
                    className={`group border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                      isTBC
                        ? 'border-l-2 border-l-dashed border-l-slate-300 opacity-70'
                        : ''
                    }`}
                  >
                    {/* Row number */}
                    <td className="w-8 py-1.5 pl-4 pr-1 text-right text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    {/* Item name */}
                    <td className="min-w-[180px] py-1.5">
                      <InlineEditCell
                        value={item.name}
                        itemId={item.id}
                        field="name"
                      />
                    </td>
                    {/* Monthly Cost */}
                    <td className="w-32 py-1.5">
                      <InlineEditCell
                        value={item.unitCost}
                        itemId={item.id}
                        field="unitCost"
                        type="number"
                        align="right"
                      />
                    </td>
                    {/* Qty */}
                    <td className="w-20 py-1.5">
                      <InlineEditCell
                        value={item.quantity}
                        itemId={item.id}
                        field="quantity"
                        type="number"
                        align="right"
                      />
                    </td>
                    {/* Total/Month */}
                    <td className="w-32 py-1.5 pr-2 text-right text-sm tabular-nums text-slate-700">
                      {formatINR(rowTotal)}
                    </td>
                    {/* Status */}
                    <td className="w-28 py-1.5">
                      <StatusPill status={item.status} itemId={item.id} />
                    </td>
                    {/* Team */}
                    <td className="w-20 py-1.5">
                      <TeamSelector team={item.team} itemId={item.id} />
                    </td>
                    {/* Remark */}
                    <td className="min-w-[120px] py-1.5">
                      <InlineEditCell
                        value={item.remark}
                        itemId={item.id}
                        field="remark"
                        className="text-slate-500"
                      />
                    </td>
                    {/* Actions */}
                    <td className="w-10 py-1.5 pr-2">
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
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
            className="ml-4 mt-1 mb-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Plus size={12} />
            Add Item
          </button>
        </div>
      )}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">
          Operations &amp; Maintenance (OPEX)
        </h2>
        <span className="text-sm text-slate-500">
          {opexCategories.length} categories
        </span>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Column Headers */}
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-2">
          <div className="grid grid-cols-[2rem_1fr_8rem_5rem_8rem_7rem_5rem_1fr_2.5rem] items-center gap-0 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>#</span>
            <span>Item</span>
            <span className="text-right">Monthly Cost</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Total/Month</span>
            <span>Status</span>
            <span>Team</span>
            <span>Remark</span>
            <span />
          </div>
        </div>

        {/* Category Sections */}
        <div className="divide-y divide-slate-100 p-2">
          {opexCategories.map((cat) => (
            <CategorySection key={cat.id} categoryId={cat.id} />
          ))}
        </div>

        {/* Empty State */}
        {opexCategories.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No OPEX categories yet. Add a category to get started.
          </div>
        )}

        {/* ─── Summary Section ──────────────────────────── */}
        <div className="border-t border-slate-200 bg-slate-50/80">
          {/* Monthly Total */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
            <span className="text-sm font-bold text-slate-800">
              Monthly Total
            </span>
            <span className="text-base font-bold tabular-nums text-slate-900">
              {formatINR(monthlyTotal)}
            </span>
          </div>

          {/* Annual Projection */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-2.5">
            <span className="text-sm font-medium text-slate-600">
              Annual Projection
              <span className="ml-1.5 text-xs text-slate-400">
                (Monthly x 12)
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-700">
              {formatINR(annualTotal)}
            </span>
          </div>

          {/* Project Duration Total */}
          {opexMonths > 0 && (
            <div className="flex items-center justify-between px-6 py-2.5">
              <span className="text-sm font-medium text-slate-600">
                Project Duration Total
                <span className="ml-1.5 text-xs text-slate-400">
                  (Monthly x {opexMonths} months)
                </span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-700">
                {formatINR(durationTotal)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
