import KPICards from './KPICards';
import StatusPipelineBar from './StatusPipelineBar';
import AllocationDonut from './AllocationDonut';
import BudgetVsActualChart from './BudgetVsActualChart';
import TBCAlertPanel from './TBCAlertPanel';
import { useActiveScenario } from '../store';

export default function DashboardView() {
  const scenario = useActiveScenario();

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-slate-400">No active scenario</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-[Inter,system-ui,sans-serif]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">{scenario.metadata.projectName}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{scenario.name}</p>
      </div>

      {/* KPI row */}
      <KPICards />

      {/* Status pipeline */}
      <StatusPipelineBar />

      {/* Charts: two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AllocationDonut />
        <BudgetVsActualChart />
      </div>

      {/* TBC Alert */}
      <TBCAlertPanel />
    </div>
  );
}
