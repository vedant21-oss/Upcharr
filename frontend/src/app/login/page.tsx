'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Stethoscope, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, role } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      // Redirect based on role (role comes from user_metadata after auth state change)
      setTimeout(() => {
        const userRole = role || 'patient';
        router.push(`/dashboard/${userRole}`);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { role: 'Admin', email: 'admin@upchaar.in', color: '#7C3AED' },
    { role: 'Doctor', email: 'doctor@upchaar.in', color: '#00B3A4' },
    { role: 'Receptionist', email: 'reception@upchaar.in', color: '#F59E0B' },
    { role: 'Patient', email: 'patient@upchaar.in', color: '#3B82F6' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white">Upchaar</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            The Future of<br />
            <span className="text-teal-100">Smart Healthcare</span>
          </h1>
          <p className="text-teal-100 text-lg mb-8">
            AI-powered clinic management with real-time synchronization, ABHA integration, and intelligent diagnostics.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Patients', value: '50,000+' },
              { label: 'Doctors', value: '1,200+' },
              { label: 'Appointments', value: '2.5M+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-teal-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-teal-200 text-sm">© 2024 Upchaar Healthcare. All rights reserved.</p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Upchaar</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to access your healthcare dashboard</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div className="mt-8">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center"><span className="bg-gray-50 px-4 text-sm text-gray-400">Demo Access</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {demoLogins.map(d => (
                <button key={d.role} onClick={() => { setEmail(d.email); setPassword('Upchaar@123'); }}
                  className="p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-teal-400 hover:bg-teal-50 transition-all flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">Password: <code className="bg-gray-100 px-1 rounded">Upchaar@123</code></p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-teal-600 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
