import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
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
  const overBudget = hasCap && committed > category.budgetCap!;
  const budgetUsedPct = hasCap ? Math.min((committed / category.budgetCap!) * 100, 100) : 0;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/60 bg-white/80
        shadow-lg shadow-black/5 backdrop-blur-xl transition-shadow duration-200 hover:shadow-xl hover:shadow-black/[0.07]"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-200
          hover:bg-slate-50/60 ${overBudget ? 'bg-red-50/30' : ''}`}
      >
        {/* Chevron with rotation animation */}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-300 ease-out
            ${expanded ? 'rotate-0' : '-rotate-90'}`}
        />

        {/* Color dot — larger */}
        <span
          className="h-3.5 w-3.5 flex-shrink-0 rounded-full ring-2 ring-white shadow-sm"
          style={{ backgroundColor: category.color }}
        />

        {/* Category name */}
        <span className="flex-1 text-[15px] font-semibold text-slate-800">
          {category.name}
        </span>

        {/* Budget progress bar (if cap exists) */}
        {hasCap && (
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">
                  {formatINR(committed)} / {formatINR(category.budgetCap!)}
                </span>
              </div>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out
                    ${overBudget
                      ? 'bg-gradient-to-r from-red-400 to-red-500'
                      : 'bg-gradient-to-r from-teal-400 to-teal-500'
                    }`}
                  style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100/80 px-2.5 py-1 font-medium text-slate-500 font-[tabular-nums]">
            {formatPercent(pctOfTotal)}
          </span>
          <span className="rounded-full bg-slate-100/80 px-2.5 py-1 font-medium text-slate-500 font-[tabular-nums]">
            {formatCostPerSqft(costPerSqft)}
          </span>
          <span
            className={`min-w-[100px] rounded-full px-3 py-1 text-right text-sm font-bold font-[tabular-nums]
              ${overBudget
                ? 'bg-red-50 text-red-600'
                : 'bg-teal-50/80 text-teal-700'
              }`}
          >
            {formatINR(subtotal)}
          </span>
        </div>
      </button>

      {/* Body */}
      <div
        className={`grid transition-all duration-300 ease-out
          ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="py-2.5 pl-5 pr-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Item
                  </th>
                  <th className="px-2 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Unit Cost
                  </th>
                  <th className="px-2 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Qty
                  </th>
                  <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Unit
                  </th>
                  <th className="px-2 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Total
                  </th>
                  <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Team
                  </th>
                  <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Remark
                  </th>
                  <th className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                    <td colSpan={9} className="py-8 text-center text-sm text-slate-400">
                      No items yet. Add one below.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                {/* Subtotal row — teal tinted */}
                <tr className="border-t border-slate-200/60 bg-teal-50/50">
                  <td className="py-3 pl-5 pr-2 text-sm font-semibold text-teal-800">
                    Subtotal
                    <span className="ml-1.5 text-xs font-normal text-teal-600/60">
                      ({items.length} items)
                    </span>
                  </td>
                  <td colSpan={3} />
                  <td className="px-2 py-3 text-right text-sm font-bold text-teal-700 font-[tabular-nums]">
                    {formatINR(subtotal)}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>

            {/* Add item button */}
            <div className="border-t border-slate-100/60 px-5 py-3">
              <button
                onClick={() => addLineItem(category.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold
                  text-teal-600 transition-all duration-200 hover:text-teal-700 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
