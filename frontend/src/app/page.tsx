'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Stethoscope, ArrowRight, Shield, Zap, Users, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-500" size={36} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
              <Stethoscope className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">Upchaar</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm py-2.5 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            AI-Powered Healthcare SaaS • Built for India
          </div>
          <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
            The Future of<br />
            <span className="gradient-text">Smart Clinic Management</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Real-time patient management, AI diagnostics, ABHA integration, voice prescriptions, and live queue management — all in one platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary flex items-center gap-2 text-base py-4 px-8">
              Start Free Today <ArrowRight size={20} />
            </Link>
            <Link href="/login" className="btn-secondary text-base py-4 px-8">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything you need to run a modern clinic</h2>
          <p className="text-gray-500 text-center mb-12">Built with Next.js, Supabase, and Gemini AI for the best healthcare experience</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'Gemini AI Assistant', desc: 'AI chatbot for appointments, symptom guidance, and health tips in 9 languages' },
              { icon: '🎤', title: 'Voice Prescriptions', desc: 'Doctors speak, AI writes structured prescriptions automatically' },
              { icon: '⚡', title: 'Real-Time Sync', desc: 'Supabase Realtime — every update appears on all devices instantly' },
              { icon: '🏥', title: 'Live Queue', desc: 'Token-based queue management with automatic waiting time estimates' },
              { icon: '📋', title: 'ABHA Integration', desc: 'Ayushman Bharat Health Account number storage and management' },
              { icon: '🔒', title: 'Role-Based Access', desc: 'Separate dashboards for Admin, Doctor, Receptionist, and Patient' },
              { icon: '📊', title: 'OCR Report Scanner', desc: 'Upload lab reports and AI extracts the key medical information' },
              { icon: '💊', title: 'Complete Records', desc: 'Medical history, X-rays, MRIs, blood reports, prescriptions — all stored forever' },
              { icon: '💰', title: 'Billing & Payments', desc: 'Generate bills, track payments, and view revenue analytics' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your clinic?</h2>
          <p className="text-teal-100 mb-8">Join thousands of doctors and patients on India's smartest healthcare platform.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl hover:bg-teal-50 transition-colors">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <p>© 2024 Upchaar Healthcare. Built with ❤️ for India.</p>
      </footer>
    </div>
  );
}
