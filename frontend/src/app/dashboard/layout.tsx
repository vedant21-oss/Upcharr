'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Users, Calendar, FileText, ClipboardList,
  Bell, Settings, LogOut, Menu, X, Stethoscope, Activity,
  CreditCard, FlaskConical, Mic, MessageSquare, ChevronRight
} from 'lucide-react';

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '/dashboard', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { icon: <Users size={18} />, label: 'Patients', href: '/dashboard/patients', roles: ['admin', 'doctor', 'receptionist'] },
  { icon: <Calendar size={18} />, label: 'Appointments', href: '/dashboard/appointments', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { icon: <ClipboardList size={18} />, label: 'Queue', href: '/dashboard/queue', roles: ['admin', 'doctor', 'receptionist'] },
  { icon: <FileText size={18} />, label: 'Prescriptions', href: '/dashboard/prescriptions', roles: ['admin', 'doctor', 'patient'] },
  { icon: <Mic size={18} />, label: 'Voice Notes', href: '/dashboard/voice', roles: ['doctor'] },
  { icon: <FlaskConical size={18} />, label: 'Lab Reports', href: '/dashboard/reports', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { icon: <CreditCard size={18} />, label: 'Billing', href: '/dashboard/billing', roles: ['admin', 'receptionist', 'patient'] },
  { icon: <Activity size={18} />, label: 'Analytics', href: '/dashboard/analytics', roles: ['admin'] },
  { icon: <MessageSquare size={18} />, label: 'AI Assistant', href: '/dashboard/ai', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { icon: <Bell size={18} />, label: 'Notifications', href: '/dashboard/notifications', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
  { icon: <Settings size={18} />, label: 'Settings', href: '/dashboard/settings', roles: ['admin', 'doctor', 'receptionist', 'patient'] },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  doctor: 'bg-teal-100 text-teal-700',
  receptionist: 'bg-amber-100 text-amber-700',
  patient: 'bg-blue-100 text-blue-700',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(item => !role || item.roles.includes(role));
  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">Upchaar</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[role || 'patient']}`}>
                {role?.charAt(0).toUpperCase()}{role?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNav.map(item => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href}
                className={`sidebar-item ${isActive ? 'active' : 'text-gray-600'}`}
                onClick={() => setSidebarOpen(false)}>
                {item.icon}
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={signOut}
            className="sidebar-item text-red-500 hover:bg-red-50 hover:text-red-600 w-full">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-900">
              {visibleNav.find(n => pathname === n.href || pathname?.startsWith(n.href + '/'))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/dashboard/notifications" className="relative text-gray-500 hover:text-teal-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
            </Link>
            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
