import KPICards from './KPICards';
import StatusPipelineBar from './StatusPipelineBar';
import AllocationDonut from './AllocationDonut';
import BudgetVsActualChart from './BudgetVsActualChart';
import TBCAlertPanel from './TBCAlertPanel';
import { useActiveScenario, useGrandTotal, useSectionTotal, useTBCItems } from '../store';
import { formatINRCompact } from '../utils/formatters';
import { Building2, Layers, CalendarDays } from 'lucide-react';

export default function DashboardView() {
  const scenario = useActiveScenario();
  const grandTotal = useGrandTotal();
  const capex = useSectionTotal('capex');
  const opex = useSectionTotal('opex');
  const tbcItems = useTBCItems();

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-slate-400">No active scenario</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-[Inter,system-ui,sans-serif] animate-fade-in-up">
      {/* ── Project Header ────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {scenario.metadata.projectName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-xs font-semibold text-teal-700">
                <Layers size={12} />
                {scenario.name}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-500">
                <CalendarDays size={12} />
                {scenario.metadata.opexMonths}mo projection
              </span>
            </div>
          </div>

          {/* Key metrics inline */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Grand Total
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatINRCompact(grandTotal)}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                CAPEX / OPEX
              </div>
              <div className="text-sm font-semibold font-mono text-slate-700">
                {formatINRCompact(capex)} / {formatINRCompact(opex)}
              </div>
            </div>
            {tbcItems.length > 0 && (
              <>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold">
                    TBC
                  </div>
                  <div className="text-sm font-semibold font-mono text-amber-700">
                    {tbcItems.length} items
                  </div>
                </div>
              </>
            )}
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-right">
              <Building2 size={14} className="text-slate-400" />
              <div className="text-sm font-medium text-slate-600">
                {scenario.metadata.totalBUA?.toLocaleString('en-IN')} sqft
              </div>
            </div>
          </div>
        </div>

        {/* Subtle divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <section className="mb-8">
        <KPICards />
      </section>

      {/* ── Status Pipeline ───────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Cost Status Pipeline
        </h2>
        <StatusPipelineBar />
      </section>

      {/* ── Charts: two-column ────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Budget Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <AllocationDonut />
          <BudgetVsActualChart />
        </div>
      </section>

      {/* ── TBC Alert ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Pending Confirmations
        </h2>
        <TBCAlertPanel />
      </section>
    </div>
  );
}
