import { useState, lazy, Suspense } from 'react';
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
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-200 border-t-primary" />
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
    <div className="flex h-screen overflow-hidden">
      {/* ─── Sidebar ────────────────────────────── */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Main Content ───────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── Minimal Top Bar ───────────────────── */}
        <header className="flex h-14 shrink-0 items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/60 px-8">
          <div>
            <h2
              className="text-base font-semibold text-text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {label}
            </h2>
            <nav className="text-[11px] text-text-muted">
              <span className="text-primary-light font-medium">BuildWise</span>
              <span className="mx-1.5 text-slate-300">/</span>
              <span className="text-text-secondary">{breadcrumb}</span>
            </nav>
          </div>
        </header>

        {/* ─── Tab Content ────────────────────────── */}
        <main className="relative flex-1 overflow-y-auto">
          {/* Dot pattern overlay */}
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-50" />

          {/* Content with padding */}
          <div className="relative p-8">
            <Suspense fallback={<LoadingFallback />}>
              <div className="animate-fade-in">
                {renderTabView()}
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
