import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, User, Eye, EyeOff, Play, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AuthCardProps {
  onSuccess: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess, initialTab = 'login' }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  // 1-Click Instant Demo Login
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', {
        username: 'admin_refinery',
        password: 'SafePassword123!',
      });
      const { access_token, user } = response.data;
      login(
        access_token,
        user.role,
        user.company_id,
        user.username,
        'Test Refinery Corp'
      );
      onSuccess();
    } catch (err: any) {
      setError('Demo login failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });
      const { access_token, user } = response.data;
      
      login(
        access_token,
        user.role,
        user.company_id,
        user.username,
        companyName || user.company_id
      );
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.post('/api/auth/register-company', {
        company_name: companyName,
        admin_username: username,
        admin_password: password,
      });
      setSuccessMsg(`Company '${companyName}' registered successfully! Please log in.`);
      setActiveTab('login');
      setPassword('');
    } catch (err: any) {
      const details = err.response?.data?.detail;
      if (Array.isArray(details)) {
        setError(details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', '));
      } else {
        setError(err.response?.data?.detail || 'Failed to register company.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto overflow-hidden rounded-3xl border border-stone-300 bg-[#f0f0ed] backdrop-blur-2xl shadow-2xl"
    >
      {/* 1-Click Instant Demo Banner */}
      <div className="p-4 bg-slate-950 text-lime-400 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2 text-xs font-bold font-mono">
          <Sparkles size={16} className="animate-pulse" />
          <span>INSTANT DEMO ACCESS</span>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={loading}
          className="px-4 py-2 rounded-full bg-lime-400/20 text-lime-300 text-xs font-black font-mono transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <Play size={12} /> Launch Refinery
        </button>
      </div>

      {/* Studio Style Pill Tabs Switcher */}
      <div className="p-2 m-5 bg-stone-200 rounded-full border border-stone-300 flex">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-3 rounded-full text-xs font-mono font-black uppercase tracking-wider transition-all ${
            activeTab === 'login'
              ? 'bg-slate-950 text-lime-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Client Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-3 rounded-full text-xs font-mono font-black uppercase tracking-wider transition-all ${
            activeTab === 'register'
              ? 'bg-slate-950 text-lime-400 shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Admin Register
        </button>
      </div>

      <div className="px-8 pb-8 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black font-display text-stone-950">
            {activeTab === 'login' ? 'Access Co-Pilot' : 'Register Refinery Workspace'}
          </h2>
          <p className="text-xs text-stone-600 font-light">
            {activeTab === 'login'
              ? 'Enter your isolated operations credentials'
              : 'Setup isolated company workspace & admin profile'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-2">
                Company Workspace Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Building2 size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Refinery"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                placeholder={activeTab === 'login' ? 'e.g. r.sharma.ops' : 'e.g. admin.ops'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                <Shield size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 sm:py-5 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-widest font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : activeTab === 'login' ? (
              'Access Operations Co-Pilot'
            ) : (
              'Create Refinery Workspace'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
