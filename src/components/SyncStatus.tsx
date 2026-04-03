import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';
import { onSyncStatus, type SyncStatus } from '../lib/supabaseStorage';
import { isSupabaseConfigured } from '../lib/supabase';

export default function SyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    return onSyncStatus(setStatus);
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-amber-400/70">
        <CloudOff className="h-3 w-3" />
        <span>Local only</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-teal-300/70">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Saving…</span>
      </div>
    );
  }

  if (status === 'saved') {
    return (
      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-teal-400/80">
        <Check className="h-3 w-3" />
        <span>Saved</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
        <CloudOff className="h-3 w-3" />
        <span>Sync error</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium text-slate-400/60">
      <Cloud className="h-3 w-3" />
      <span>Cloud sync</span>
    </div>
  );
}
