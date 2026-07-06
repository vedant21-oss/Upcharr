'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Loader2, Calendar, Clock, User } from 'lucide-react';

interface Appointment {
  id: number; date_time: string; status: string; appointment_type: string; reason: string;
  patients: { name: string; phone: string };
  doctors: { name: string; specialty: string };
}

const STATUS_BADGES: Record<string, string> = {
  Scheduled: 'badge-confirmed', Confirmed: 'badge-confirmed',
  Pending: 'badge-pending', Completed: 'badge-completed', Cancelled: 'badge-cancelled',
};

export default function AppointmentsPage() {
  const { role, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', date_time: '', appointment_type: 'Online', reason: '' });
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFilter) params.date = dateFilter;
      const data = await api.getAppointments(Object.keys(params).length ? params : undefined);
      setAppointments(Array.isArray(data) ? data : []);
    } catch { setAppointments([]); } finally { setLoading(false); }
  }, [dateFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // Load doctors and patients for form
    const init = async () => {
      const { data: docs } = await supabase.from('doctors').select('id, name, specialty');
      setDoctors(docs || []);
      if (['admin', 'receptionist'].includes(role || '')) {
        const { data: pats } = await supabase.from('patients').select('id, name');
        setPatients(pats || []);
      }
    };
    init();
  }, [role]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel('appt-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAppointment(form);
      setShowForm(false);
      setForm({ patient_id: '', doctor_id: '', date_time: '', appointment_type: 'Online', reason: '' });
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    await api.updateAppointment(String(id), { status });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm">{appointments.length} total • Realtime sync on</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="form-input text-sm" />
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Book Appointment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="animate-spin text-teal-500 mx-auto" size={28} /></td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <Calendar size={40} className="mx-auto mb-3 text-gray-200" />
                  No appointments found.
                </td></tr>
              ) : appointments.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                        {a.patients?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{a.patients?.name}</p>
                        <p className="text-xs text-gray-400">{a.patients?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="font-medium text-gray-900">{a.doctors?.name}</p>
                    <p className="text-xs text-gray-400">{a.doctors?.specialty}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Calendar size={14} className="text-teal-500" />
                      {new Date(a.date_time).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {new Date(a.date_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td><span className="text-sm text-gray-600">{a.appointment_type}</span></td>
                  <td><span className={STATUS_BADGES[a.status] || 'badge-pending'}>{a.status}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      {['admin', 'receptionist'].includes(role || '') && a.status === 'Scheduled' && (
                        <>
                          <button onClick={() => updateStatus(a.id, 'Confirmed')}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium">Confirm</button>
                          <button onClick={() => updateStatus(a.id, 'Cancelled')}
                            className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
                        </>
                      )}
                      {role === 'doctor' && a.status === 'Confirmed' && (
                        <button onClick={() => updateStatus(a.id, 'Completed')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Book Appointment</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {['admin', 'receptionist'].includes(role || '') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <select value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})} className="form-input" required>
                    <option value="">Select patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                <select value={form.doctor_id} onChange={e => setForm({...form, doctor_id: e.target.value})} className="form-input" required>
                  <option value="">Select doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input type="datetime-local" value={form.date_time} onChange={e => setForm({...form, date_time: e.target.value})} className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.appointment_type} onChange={e => setForm({...form, appointment_type: e.target.value})} className="form-input">
                  {['Online', 'Walk-in', 'Emergency'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="form-input resize-none h-20" placeholder="Reason for visit..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Booking...</> : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
