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
  iconBg: string;
  iconColor: string;
  gradient: string;
  accentColor: string;
  valueColor?: string;
}

function KPICard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  gradient,
  accentColor,
  valueColor,
}: KPICardProps) {
  return (
    <div
      className={`relative overflow-hidden ${gradient} backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-5 flex flex-col gap-2 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} rounded-l-2xl`}
      />
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          {label}
        </span>
        <span className={`${iconBg} ${iconColor} rounded-xl p-2 shadow-sm`}>
          {icon}
        </span>
      </div>
      <span
        className={`text-3xl font-bold font-mono tabular-nums tracking-tight ${valueColor ?? 'text-slate-900'}`}
      >
        {value}
      </span>
      {subtitle && (
        <span className="text-sm text-slate-500 leading-tight">{subtitle}</span>
      )}
    </div>
  );
}

function BudgetProgressBar({ allocated, cap }: { allocated: number; cap: number }) {
  const pct = cap > 0 ? Math.min((allocated / cap) * 100, 100) : 0;
  const overBudget = allocated > cap;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span className="font-medium">{formatINRCompact(allocated)} allocated</span>
        <span className="font-semibold text-slate-700">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            overBudget
              ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-red-400/40 shadow-sm'
              : 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-400/40 shadow-sm'
          }`}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {/* Total Budget */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-black/5 p-5 flex flex-col gap-2 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group">
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-2xl" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40 pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Total Budget
          </span>
          <span className="bg-blue-100 text-blue-600 rounded-xl p-2 shadow-sm">
            <IndianRupee size={16} />
          </span>
        </div>
        <span className="text-3xl font-bold font-mono tabular-nums tracking-tight text-slate-900">
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
        iconBg="bg-teal-100"
        iconColor="text-teal-600"
        gradient="bg-gradient-to-br from-teal-50/90 to-emerald-50/90"
        accentColor="bg-teal-500"
      />

      {/* OPEX Monthly */}
      <KPICard
        label="OPEX Monthly"
        value={formatINRCompact(opex)}
        subtitle={`${formatINRCompact(opex * 12)}/year (${opexMonths}mo proj.)`}
        icon={<TrendingUp size={16} />}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        gradient="bg-gradient-to-br from-amber-50/90 to-orange-50/90"
        accentColor="bg-amber-500"
      />

      {/* Budget Variance */}
      <KPICard
        label="Budget Variance"
        value={budgetCap > 0 ? formatINRCompact(Math.abs(variance)) : '\u2014'}
        subtitle={
          budgetCap > 0
            ? variancePositive
              ? 'Under budget'
              : 'Over budget'
            : 'Set budget cap to track'
        }
        icon={variancePositive ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
        iconBg={variancePositive ? 'bg-emerald-100' : 'bg-red-100'}
        iconColor={variancePositive ? 'text-emerald-600' : 'text-red-600'}
        gradient={
          variancePositive
            ? 'bg-gradient-to-br from-emerald-50/90 to-green-50/90'
            : 'bg-gradient-to-br from-red-50/90 to-rose-50/90'
        }
        accentColor={variancePositive ? 'bg-emerald-500' : 'bg-red-500'}
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
        iconBg={tbcItems.length > 0 ? 'bg-slate-200' : 'bg-emerald-100'}
        iconColor={tbcItems.length > 0 ? 'text-slate-600' : 'text-emerald-600'}
        gradient="bg-gradient-to-br from-slate-50/90 to-gray-50/90"
        accentColor="bg-slate-400"
        valueColor={tbcItems.length > 0 ? 'text-amber-700' : 'text-emerald-700'}
      />
    </div>
  );
}
