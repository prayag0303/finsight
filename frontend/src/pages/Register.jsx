import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Connect your accounts', icon: '🔗' },
  { label: 'Set budgets & goals', icon: '🎯' },
  { label: 'Watch your wealth grow', icon: '📈' },
];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">

      {/* Left — Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-900 to-indigo-800" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FinSight</span>
          </div>

          <div className="mt-auto mb-8">
            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Your financial story<br />starts here.
            </h2>
            <p className="mt-4 text-indigo-200 text-sm leading-relaxed max-w-sm">
              Join thousands of people who take control of their finances with FinSight's intelligent dashboard.
            </p>

            <div className="mt-10 space-y-6">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-indigo-400">FinSight v1.0 · Free to get started</p>
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
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Create your account</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {[
              { label: 'Full name',        key: 'name',     type: 'text',     placeholder: 'Jane Smith',        autoFocus: true },
              { label: 'Email address',    key: 'email',    type: 'email',    placeholder: 'you@example.com'               },
              { label: 'Password',         key: 'password', type: 'password', placeholder: 'At least 6 characters'         },
              { label: 'Confirm password', key: 'confirm',  type: 'password', placeholder: 'Repeat your password'          },
            ].map(({ label, key, type, placeholder, autoFocus }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type={type} value={form[key]} onChange={set(key)}
                  className="input" placeholder={placeholder}
                  autoFocus={autoFocus} required
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1 text-sm">
              {loading
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account…</>
                : 'Create account'}
            </button>
          </form>

          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-zinc-400 mt-4 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="text-zinc-500 cursor-default">Terms of Service</span>
            {' '}and{' '}
            <span className="text-zinc-500 cursor-default">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
