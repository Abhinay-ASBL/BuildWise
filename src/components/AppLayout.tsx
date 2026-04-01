import { useState, lazy, Suspense } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import Sidebar, { type TabId } from './Sidebar';

// Lazy-load tab views for better code splitting
const DashboardView = lazy(() => import('./DashboardView'));
const CAPEXTable = lazy(() => import('./CAPEXTable'));
const OPEXTable = lazy(() => import('./OPEXTable'));
const AreaAnalysis = lazy(() => import('./AreaAnalysis'));
const ScenariosView = lazy(() => import('./ScenariosView'));

const TAB_META: Record<TabId, { label: string; breadcrumb: string }> = {
  dashboard: { label: 'Dashboard', breadcrumb: 'Overview' },
  capex: { label: 'CAPEX Breakdown', breadcrumb: 'Capital Expenditure' },
  opex: { label: 'OPEX Breakdown', breadcrumb: 'Operational Expenditure' },
  area: { label: 'Area Analysis', breadcrumb: 'Area Statement' },
  scenarios: { label: 'Scenarios', breadcrumb: 'Scenario Management' },
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
    </div>
  );
}

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { label, breadcrumb } = TAB_META[activeTab];

  function renderTabView() {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'capex':
        return <CAPEXTable />;
      case 'opex':
        return <OPEXTable />;
      case 'area':
        return <AreaAnalysis />;
      case 'scenarios':
        return <ScenariosView />;
      default:
        return <DashboardView />;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ─── Sidebar ────────────────────────────── */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Main Content ───────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── Top Bar ────────────────────────────── */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{label}</h2>
            <nav className="text-xs text-slate-400">
              <span>BuildWise</span>
              <span className="mx-1.5">/</span>
              <span className="text-slate-600">{breadcrumb}</span>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Undo"
              disabled
            >
              <Undo2 size={16} />
            </button>
            <button
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Redo"
              disabled
            >
              <Redo2 size={16} />
            </button>
          </div>
        </header>

        {/* ─── Tab Content ────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<LoadingFallback />}>
            {renderTabView()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
