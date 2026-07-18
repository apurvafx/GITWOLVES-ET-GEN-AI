import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Building2, User, Eye, EyeOff } from 'lucide-react';

interface AuthCardProps {
  onSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

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
      
      // Use company_id as company name for visual representation
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
      // Keep username, clear password for quick login
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register company.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface shadow-lg">
      {/* Tabs Header */}
      <div className="flex border-b border-day-border dark:border-night-border">
        <button
          type="button"
          onClick={() => {
            setActiveTab('login');
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-4 text-center font-medium transition-all ${
            activeTab === 'login'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-slate-50/50 dark:bg-slate-900/20'
              : 'text-day-textMuted dark:text-night-textMuted hover:text-day-text dark:hover:text-night-text'
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
          className={`flex-1 py-4 text-center font-medium transition-all ${
            activeTab === 'register'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-slate-50/50 dark:bg-slate-900/20'
              : 'text-day-textMuted dark:text-night-textMuted hover:text-day-text dark:hover:text-night-text'
          }`}
        >
          Admin Registration
        </button>
      </div>

      <div className="p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 mb-3">
            {activeTab === 'login' ? <Key size={24} /> : <Building2 size={24} />}
          </div>
          <h2 className="text-2xl font-bold text-day-text dark:text-night-text">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Company Workspace'}
          </h2>
          <p className="text-sm text-day-textMuted dark:text-night-textMuted mt-1">
            {activeTab === 'login'
              ? 'Access your isolated operations co-pilot'
              : 'Register your refinery profile and admin credentials'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-900/30">
            {successMsg}
          </div>
        )}

        <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-day-textMuted dark:text-night-textMuted mb-2">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-day-textMuted dark:text-night-textMuted">
                  <Building2 size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Refinery"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-day-textMuted dark:text-night-textMuted mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-day-textMuted dark:text-night-textMuted">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                placeholder={activeTab === 'login' ? 'e.g. r.sharma.ops' : 'e.g. admin.ops'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-day-textMuted dark:text-night-textMuted mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-day-textMuted dark:text-night-textMuted">
                <Shield size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-day-textMuted dark:text-night-textMuted hover:text-day-text dark:hover:text-night-text"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-cobalt-teal text-white font-medium hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : activeTab === 'login' ? (
              'Access Co-Pilot'
            ) : (
              'Create Workspace'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
