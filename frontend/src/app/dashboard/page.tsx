'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Users, Calendar, TrendingUp, Clock, Activity, Loader2 } from 'lucide-react';

interface Analytics {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        if (role === 'admin') {
          const data = await api.getAnalytics();
          setAnalytics(data);
        } else {
          setAnalytics({ totalPatients: 0, totalAppointments: 0, todayAppointments: 0, totalRevenue: 0 });
        }
      } catch { /* fallback */ } finally { setLoading(false); }
    };
    loadData();
  }, [user, role]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-teal-500" size={36} />
      </div>
    );
  }

  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  const statCards = [
    { icon: <Users size={22} />, label: 'Total Patients', value: analytics?.totalPatients?.toLocaleString() || '—', color: 'teal', trend: '+12%' },
    { icon: <Calendar size={22} />, label: 'Total Appointments', value: analytics?.totalAppointments?.toLocaleString() || '—', color: 'blue', trend: '+8%' },
    { icon: <Clock size={22} />, label: "Today's Appointments", value: analytics?.todayAppointments?.toLocaleString() || '—', color: 'amber', trend: 'Live' },
    { icon: <TrendingUp size={22} />, label: 'Total Revenue', value: analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString()}` : '—', color: 'green', trend: '+23%' },
  ];

  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', badge: 'bg-teal-100 text-teal-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    green: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl">
          <div className="w-2 h-2 bg-teal-500 rounded-full pulse-teal" />
          <span className="text-sm font-medium text-teal-700">Live System Active</span>
        </div>
      </div>

      {/* Stats Grid */}
      {role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(card => {
            const c = colorMap[card.color];
            return (
              <div key={card.label} className="stat-card">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 ${c.bg} ${c.text} rounded-xl flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.badge}`}>{card.trend}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Activity size={20} className="text-teal-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Book Appointment', href: '/dashboard/appointments', emoji: '📅', color: 'from-teal-500 to-cyan-500' },
            { label: 'View Patients', href: '/dashboard/patients', emoji: '👥', color: 'from-blue-500 to-indigo-500' },
            { label: 'Live Queue', href: '/dashboard/queue', emoji: '🏥', color: 'from-amber-500 to-orange-500' },
            { label: 'AI Assistant', href: '/dashboard/ai', emoji: '🤖', color: 'from-purple-500 to-pink-500' },
          ].filter(a => {
            if (role === 'patient') return ['📅', '🤖'].includes(a.emoji);
            return true;
          }).map(action => (
            <a key={action.label} href={action.href}
              className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-5 text-center hover:scale-105 transition-transform duration-200 shadow-lg`}>
              <div className="text-3xl mb-2">{action.emoji}</div>
              <div className="text-sm font-semibold">{action.label}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Role-specific info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🏥 Upchaar Platform</h3>
          <p className="text-teal-100 text-sm mb-4">
            Real-time healthcare management with AI-powered diagnostics, ABHA integration, and multi-role access.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Supabase Realtime Active</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Role</h3>
          <div className="space-y-3">
            {role === 'admin' && ['Manage all users', 'View analytics', 'System settings', 'Full access'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-teal-500">✓</span>{p}</div>
            ))}
            {role === 'doctor' && ['View patient records', 'Write prescriptions', 'Voice notes', 'Manage schedule'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-teal-500">✓</span>{p}</div>
            ))}
            {role === 'receptionist' && ['Register patients', 'Book appointments', 'Manage queue', 'Process billing'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-teal-500">✓</span>{p}</div>
            ))}
            {role === 'patient' && ['Book appointments', 'View prescriptions', 'Download reports', 'AI health assistant'].map(p => (
              <div key={p} className="flex items-center gap-2 text-sm text-gray-600"><span className="text-teal-500">✓</span>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
