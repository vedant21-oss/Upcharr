'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, Bell, Loader2, Hash } from 'lucide-react';

interface QueueEntry {
  id: number; token_number: string; status: string; position: number;
  appointments: { date_time: string; patients: { name: string; phone: string } };
  doctors: { name: string };
}

const STATUS_COLOR: Record<string, string> = {
  Waiting: 'badge-pending',
  Calling: 'badge-calling',
  Completed: 'badge-completed',
  Skipped: 'badge-cancelled',
};

export default function QueuePage() {
  const { role } = useAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [waitingTime, setWaitingTime] = useState<number>(12);

  const load = useCallback(async () => {
    try {
      const data = await api.getQueue();
      setQueue(Array.isArray(data) ? data : []);
    } catch { setQueue([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime - queue updates instantly for everyone
  useEffect(() => {
    const channel = supabase.channel('queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, payload => {
        console.log('Queue update:', payload);
        load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const callPatient = async (id: number) => {
    await api.callNextPatient(String(id));
  };

  const completeEntry = async (id: number) => {
    await api.completeQueueEntry(String(id));
  };

  const avgWait = Math.max(5, (queue.filter(q => q.status === 'Waiting').length) * waitingTime);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Queue</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse inline-block" />
            Realtime — all devices update instantly
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-teal-600 mb-1">{queue.filter(q => q.status === 'Waiting').length}</div>
          <div className="text-sm text-gray-500">Waiting</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-amber-500 mb-1">~{avgWait}m</div>
          <div className="text-sm text-gray-500">Avg Wait</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{queue.filter(q => q.status === 'Completed').length}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">Live Queue Board</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-teal-500" size={28} />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock size={40} className="mx-auto mb-3 text-gray-200" />
            <p>Queue is empty. All patients have been attended.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {queue.map((entry, idx) => (
              <div key={entry.id} className={`flex items-center gap-4 p-4 transition-colors ${entry.status === 'Calling' ? 'bg-amber-50' : idx === 0 ? 'bg-teal-50/50' : ''}`}>
                {/* Token */}
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${
                  entry.status === 'Calling' ? 'bg-amber-500 text-white' : idx === 0 ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Hash size={12} className="mb-0.5" />
                  <span className="text-xs">{entry.token_number}</span>
                </div>

                {/* Patient info */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{entry.appointments?.patients?.name || 'Patient'}</p>
                  <p className="text-xs text-gray-400">{entry.appointments?.patients?.phone}</p>
                </div>

                {/* Position */}
                <div className="text-center hidden sm:block">
                  <p className="text-lg font-bold text-gray-700">#{entry.position}</p>
                  <p className="text-xs text-gray-400">Position</p>
                </div>

                {/* Status badge */}
                <span className={STATUS_COLOR[entry.status] || 'badge-pending'}>{entry.status}</span>

                {/* Actions */}
                {['admin', 'receptionist', 'doctor'].includes(role || '') && (
                  <div className="flex gap-2">
                    {entry.status === 'Waiting' && (
                      <button onClick={() => callPatient(entry.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                        <Bell size={12} /> Call
                      </button>
                    )}
                    {entry.status === 'Calling' && (
                      <button onClick={() => completeEntry(entry.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors">
                        <CheckCircle size={12} /> Done
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
