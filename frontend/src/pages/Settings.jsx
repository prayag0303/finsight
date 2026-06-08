import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Section = ({ title, children }) => (
  <div className="card">
    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
      <p className="section-title">{title}</p>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'INR' });
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [savingP, setSavingP] = useState(false);
  const [savingPW, setSavingPW] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingP(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile saved');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSavingP(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (password.new !== password.confirm) return toast.error('Passwords do not match');
    if (password.new.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPW(true);
    try {
      await api.put('/auth/password', { currentPassword: password.current, newPassword: password.new });
      toast.success('Password changed');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSavingPW(false); }
  };

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={user?.email || ''} className="input opacity-50 cursor-not-allowed" disabled />
            <p className="text-xs text-zinc-400 mt-1">Email address cannot be changed</p>
          </div>
          <div>
            <label className="label">Default Currency</label>
            <select value={profile.currency} onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))} className="input">
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={savingP}>{savingP ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </Section>

      <Section title="Change Password">
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current' },
            { label: 'New Password', key: 'new' },
            { label: 'Confirm New Password', key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type="password" value={password[key]} onChange={(e) => setPassword((p) => ({ ...p, [key]: e.target.value }))} className="input" required />
            </div>
          ))}
          <button type="submit" className="btn-primary" disabled={savingPW}>{savingPW ? 'Updating…' : 'Update Password'}</button>
        </form>
      </Section>

      <Section title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Dark Mode</p>
            <p className="text-xs text-zinc-500 mt-0.5">Toggle between light and dark themes</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-zinc-200'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>

      <Section title="About">
        <div className="space-y-1 text-xs text-zinc-500">
          <p>FinSight v1.0.0</p>
          <p>Personal Finance Intelligence Dashboard</p>
          <p>Built with React · Node.js · MongoDB · OpenAI</p>
        </div>
      </Section>
    </div>
  );
}
