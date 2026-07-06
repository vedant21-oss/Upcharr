'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, X, Loader2, User, Phone, Mail, Droplets } from 'lucide-react';

interface Patient {
  id: number; name: string; email: string; phone: string;
  date_of_birth: string; gender: string; blood_group: string;
  address: string; created_at: string;
}

export default function PatientsPage() {
  const { role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', date_of_birth: '', gender: 'Male', blood_group: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPatients(search ? { search } : undefined);
      setPatients(data.data || []);
    } catch { setPatients([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel('patients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createPatient(form);
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', date_of_birth: '', gender: 'Male', blood_group: '', address: '' });
    } catch (err: any) { alert(err.message); } finally { setSaving(false); }
  };

  const calcAge = (dob: string) => {
    if (!dob) return '—';
    return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients • Live sync enabled</p>
        </div>
        {['admin', 'receptionist', 'doctor'].includes(role || '') && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="form-input pl-11 w-full" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Patient</th><th>Contact</th><th>Age</th><th>Blood Group</th><th>Registered</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <Loader2 className="animate-spin text-teal-500 mx-auto" size={28} />
                </td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <User size={40} className="mx-auto mb-3 text-gray-200" />
                  No patients found. {['admin', 'receptionist'].includes(role || '') && 'Add the first patient!'}
                </td></tr>
              ) : patients.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600"><Phone size={12} />{p.phone || '—'}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400"><Mail size={12} />{p.email || '—'}</div>
                    </div>
                  </td>
                  <td className="text-gray-600">{calcAge(p.date_of_birth)}</td>
                  <td>
                    {p.blood_group && (
                      <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
                        <Droplets size={14} />{p.blood_group}
                      </span>
                    )}
                  </td>
                  <td className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <a href={`/dashboard/patients/${p.id}`}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium">View →</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Add New Patient</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" placeholder="Patient full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" placeholder="+91 9876543210" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" placeholder="patient@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="form-input">
                    {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})} className="form-input">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="form-input resize-none h-20" placeholder="Full address..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
