import { useEffect, useState } from 'react';
import AppLayout from './components/AppLayout';
import { useBudgetStore } from './store';

function HydrationFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200/30 border-t-teal-400" />
        <span>Loading live data from Supabase…</span>
      </div>
    </div>
  );
}

function App() {
  const [isHydrated, setIsHydrated] = useState(useBudgetStore.persist.hasHydrated());

  useEffect(() => {
    const removeOnHydrate = useBudgetStore.persist.onHydrate(() => {
      setIsHydrated(false);
    });
    const removeOnFinishHydration = useBudgetStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    void useBudgetStore.persist.rehydrate();

    return () => {
      removeOnHydrate();
      removeOnFinishHydration();
    };
  }, []);

  if (!isHydrated) {
    return <HydrationFallback />;
  }

  return <AppLayout />;
}

export default App;
