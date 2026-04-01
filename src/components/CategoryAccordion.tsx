import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { BudgetCategory } from '../types';
import { useBudgetStore, useCategoryItems, useCategoryTotal, useGrandTotal } from '../store';
import { formatINR, formatCostPerSqft, formatPercent } from '../utils/formatters';
import BudgetRow from './BudgetRow';

interface CategoryAccordionProps {
  category: BudgetCategory;
}

export default function CategoryAccordion({ category }: CategoryAccordionProps) {
  const [expanded, setExpanded] = useState(true);

  const items = useCategoryItems(category.id);
  const subtotal = useCategoryTotal(category.id);
  const grandTotal = useGrandTotal();
  const totalBUA = useBudgetStore(
    (s) => s.scenarios[s.activeScenarioId]?.metadata.totalBUA ?? 1
  );
  const addLineItem = useBudgetStore((s) => s.addLineItem);

  const costPerSqft = totalBUA > 0 ? subtotal / totalBUA : 0;
  const pctOfTotal = grandTotal > 0 ? (subtotal / grandTotal) * 100 : 0;

  // Budget cap analysis
  const hasCap = category.budgetCap !== null && category.budgetCap > 0;
  const committed = items
    .filter((i) => ['Committed', 'Invoiced', 'Paid'].includes(i.status))
    .reduce((sum, i) => sum + i.unitCost * i.quantity, 0);
  const variance = hasCap ? category.budgetCap! - committed : 0;
  const overBudget = hasCap && committed > category.budgetCap!;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`flex w-full items-center gap-3 bg-slate-50 px-4 py-3 text-left
          transition-colors hover:bg-slate-100 ${overBudget ? 'bg-red-50/50' : ''}`}
      >
        {/* Collapse icon */}
        {expanded ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
        )}

        {/* Color dot */}
        <span
          className="h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />

        {/* Category name */}
        <span className="flex-1 text-sm font-semibold text-gray-800">
          {category.name}
        </span>

        {/* Budget cap info */}
        {hasCap && (
          <div className="hidden items-center gap-3 text-xs md:flex">
            <span className="text-gray-500">
              Budget: <span className="font-medium text-gray-700">{formatINR(category.budgetCap!)}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">
              Committed: <span className="font-medium text-gray-700">{formatINR(committed)}</span>
            </span>
            <span className="text-gray-400">|</span>
            <span className={variance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              Variance:{' '}
              <span className="font-medium">
                {variance >= 0 ? '+' : '-'}{formatINR(Math.abs(variance))}
              </span>
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="font-[tabular-nums]">{formatPercent(pctOfTotal)}</span>
          <span className="font-[tabular-nums]">{formatCostPerSqft(costPerSqft)}</span>
          <span className="min-w-[100px] text-right font-[tabular-nums] text-sm font-semibold text-gray-700">
            {formatINR(subtotal)}
          </span>
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200 bg-white text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="py-2 pl-3 pr-2 text-left font-medium">Item</th>
                <th className="px-2 py-2 text-right font-medium">Unit Cost</th>
                <th className="px-2 py-2 text-right font-medium">Qty</th>
                <th className="px-2 py-2 text-left font-medium">Unit</th>
                <th className="px-2 py-2 text-right font-medium">Total</th>
                <th className="px-2 py-2 text-left font-medium">Status</th>
                <th className="px-2 py-2 text-left font-medium">Team</th>
                <th className="px-2 py-2 text-left font-medium">Remark</th>
                <th className="px-2 py-2 text-center font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <BudgetRow key={item.id} item={item} />
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-sm text-gray-400">
                    No items yet. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              {/* Subtotal row */}
              <tr className="border-t border-slate-200 bg-gray-50">
                <td className="py-2 pl-3 pr-2 text-sm font-semibold text-gray-700">
                  Subtotal ({items.length} items)
                </td>
                <td colSpan={3} />
                <td className="px-2 py-2 text-right text-sm font-bold font-[tabular-nums] text-gray-800">
                  {formatINR(subtotal)}
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>

          {/* Add item button */}
          <div className="border-t border-slate-100 px-4 py-2">
            <button
              onClick={() => addLineItem(category.id)}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs
                font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
