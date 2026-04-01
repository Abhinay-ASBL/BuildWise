import {
  useActiveScenario,
  useSectionTotal,
  useGrandTotal,
  useCostPerSqft,
  useTBCItems,
} from '../store';
import { formatINRCompact, formatINR, formatCostPerSqft } from '../utils/formatters';
import { IndianRupee, TrendingUp, TrendingDown, AlertTriangle, Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  borderColor: string;
  valueColor?: string;
}

function KPICard({ label, value, subtitle, icon, borderColor, valueColor }: KPICardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-1 ${borderColor}`}
      style={{ borderLeftWidth: '4px' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          {label}
        </span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <span className={`text-2xl font-bold tabular-nums ${valueColor ?? 'text-slate-900'}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-sm text-slate-500">{subtitle}</span>
      )}
    </div>
  );
}

function BudgetProgressBar({ allocated, cap }: { allocated: number; cap: number }) {
  const pct = cap > 0 ? Math.min((allocated / cap) * 100, 100) : 0;
  const overBudget = allocated > cap;

  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{formatINRCompact(allocated)} allocated</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${overBudget ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function KPICards() {
  const scenario = useActiveScenario();
  const capex = useSectionTotal('capex');
  const opex = useSectionTotal('opex');
  const grandTotal = useGrandTotal();
  const costPerSqft = useCostPerSqft();
  const tbcItems = useTBCItems();

  const budgetCap = scenario?.metadata.budgetCap ?? 0;
  const opexMonths = scenario?.metadata.opexMonths ?? 24;
  const variance = budgetCap - grandTotal;
  const tbcExposure = tbcItems.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);

  const variancePositive = variance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Budget */}
      <div
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-1 border-l-blue-500"
        style={{ borderLeftWidth: '4px' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            Total Budget
          </span>
          <IndianRupee size={16} className="text-slate-400" />
        </div>
        <span className="text-2xl font-bold tabular-nums text-slate-900">
          {budgetCap > 0 ? formatINRCompact(budgetCap) : 'Not Set'}
        </span>
        {budgetCap > 0 && <BudgetProgressBar allocated={grandTotal} cap={budgetCap} />}
      </div>

      {/* CAPEX Total */}
      <KPICard
        label="CAPEX Total"
        value={formatINRCompact(capex)}
        subtitle={formatCostPerSqft(costPerSqft)}
        icon={<Building2 size={16} />}
        borderColor="border-l-teal-500"
      />

      {/* OPEX Monthly */}
      <KPICard
        label="OPEX Monthly"
        value={formatINRCompact(opex)}
        subtitle={`${formatINRCompact(opex * 12)}/year (${opexMonths}mo proj.)`}
        icon={<TrendingUp size={16} />}
        borderColor="border-l-amber-500"
      />

      {/* Budget Variance */}
      <KPICard
        label="Budget Variance"
        value={budgetCap > 0 ? formatINRCompact(Math.abs(variance)) : '—'}
        subtitle={
          budgetCap > 0
            ? variancePositive
              ? 'Under budget'
              : 'Over budget'
            : 'Set budget cap to track'
        }
        icon={variancePositive ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
        borderColor={variancePositive ? 'border-l-emerald-500' : 'border-l-red-500'}
        valueColor={
          budgetCap > 0
            ? variancePositive
              ? 'text-emerald-700'
              : 'text-red-700'
            : 'text-slate-400'
        }
      />

      {/* TBC Items */}
      <KPICard
        label="TBC Items"
        value={`${tbcItems.length}`}
        subtitle={tbcItems.length > 0 ? `${formatINR(tbcExposure)} exposure` : 'All items confirmed'}
        icon={<AlertTriangle size={16} />}
        borderColor="border-l-slate-400"
        valueColor={tbcItems.length > 0 ? 'text-amber-700' : 'text-emerald-700'}
      />
    </div>
  );
}
