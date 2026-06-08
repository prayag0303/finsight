import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FEATURES = [
  { label: 'Smart auto-categorization', desc: 'Transactions categorized instantly as you type' },
  { label: 'AI-powered insights', desc: 'Monthly reports with actionable recommendations' },
  { label: 'Anomaly & spike detection', desc: 'Catch unusual charges before they add up' },
  { label: 'Cash flow forecasting', desc: 'Know where your money is heading, months ahead' },
];

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">

      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden flex-col">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FinSight</span>
          </div>

          {/* Headline */}
          <div className="mt-auto mb-8">
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Financial clarity,<br />for people who care<br />about their money.
            </h2>
            <p className="mt-4 text-indigo-200 text-sm leading-relaxed max-w-sm">
              Track spending, forecast your cash flow, and get AI-powered insights — all in one clean dashboard.
            </p>

            <div className="mt-8 space-y-4">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-indigo-200" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-indigo-300 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-indigo-400">
            FinSight v1.0 · Personal Finance Intelligence
          </p>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:bg-white lg:dark:bg-zinc-900 lg:border-l lg:border-zinc-200 lg:dark:border-zinc-800">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">FinSight</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Welcome back</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5">Sign in to your FinSight account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email" value={form.email} autoFocus required
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input" placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" value={form.password} required
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input" placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1 text-sm">
              {loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in…</>
                : 'Sign in'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-zinc-50 dark:bg-zinc-900 lg:bg-white text-zinc-400">or</span>
              </div>
            </div>
            <button
              onClick={() => setForm({ email: 'demo@example.com', password: 'demo123' })}
              className="btn-secondary w-full mt-3 text-xs py-2"
            >
              Continue with demo account
            </button>
          </div>

          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
