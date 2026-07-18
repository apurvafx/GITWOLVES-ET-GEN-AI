import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  Sun, 
  Moon, 
  Key, 
  UploadCloud, 
  FileText, 
  Users, 
  Activity, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, theme, toggleTheme, companyId, username } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Employee ID generator fields
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState<{ u: string; p: string } | null>(null);

  // Ingestion fields
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Fetch document list
  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/docs/list');
      setDocuments(response.data);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle employee registration
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedCreds(null);
    try {
      await api.post('/api/auth/create-employee', {
        employee_username: empUsername,
        employee_password: empPassword,
      });
      setGeneratedCreds({ u: empUsername, p: empPassword });
      setEmpUsername('');
      setEmpPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create employee account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading document...');
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress('Ingesting file content & parsing Knowledge Graph via Gemini...');
      await api.post('/api/docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(`Manual '${file.name}' successfully uploaded, chunked, and parsed into nodes & relations.`);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-day-bg dark:bg-night-bg text-day-text dark:text-night-text transition-colors duration-300">
      {/* 1. Header */}
      <header className="border-b border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white font-black text-lg">
            V
          </div>
          <div>
            <h1 className="font-bold text-base">Administrative Console</h1>
            <p className="text-xs text-day-textMuted dark:text-night-textMuted flex items-center gap-1">
              <Building2 size={12} /> Company Workspace: <span className="font-semibold text-blue-600">{companyId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            ADMINISTRATOR
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-day-textMuted dark:text-night-textMuted"
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={logout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg flex items-center gap-1.5 text-sm font-semibold transition-all"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* 2. Main content */}
      <main className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/30 flex gap-2 items-center">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-900/30 flex gap-2 items-center">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel: Credential Generator */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Key className="text-blue-500" size={20} />
                <h2 className="text-lg font-bold">Credential Generator</h2>
              </div>
              <p className="text-sm text-day-textMuted dark:text-night-textMuted mb-6">
                Register new employee login profiles for this company. These accounts are isolated to your workspace.
              </p>

              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-day-textMuted dark:text-night-textMuted mb-2">
                    Employee Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. j.doe.ops"
                    value={empUsername}
                    onChange={(e) => setEmpUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-day-textMuted dark:text-night-textMuted mb-2">
                    Employee Access Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. complex-pass-123"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Registering...' : 'Generate Employee Credentials'}
                </button>
              </form>
            </div>

            {/* Generated creds display */}
            {generatedCreds && (
              <div className="mt-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/10 text-sm">
                <h4 className="font-bold text-blue-600 mb-2">Credentials Generated:</h4>
                <div className="space-y-1 font-mono text-xs">
                  <p><span className="font-semibold text-day-textMuted dark:text-night-textMuted">Username:</span> {generatedCreds.u}</p>
                  <p><span className="font-semibold text-day-textMuted dark:text-night-textMuted">Password:</span> {generatedCreds.p}</p>
                </div>
                <p className="text-[10px] text-day-textMuted dark:text-night-textMuted mt-3">
                  Give these details to your employee. They can sign in on the Client login screen.
                </p>
              </div>
            )}
          </div>

          {/* Right panel: Document center */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-teal-500" size={20} />
                <h2 className="text-lg font-bold">Refinery Modules & Manuals</h2>
              </div>
              <span className="text-xs text-day-textMuted dark:text-night-textMuted">
                {documents.length} Uploaded Modules
              </span>
            </div>

            {/* Drag & drop upload box */}
            <label className="relative border-2 border-dashed border-day-border dark:border-night-border hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <UploadCloud className={`text-day-textMuted dark:text-night-textMuted mb-3 ${uploading ? 'animate-bounce' : ''}`} size={32} />
              {uploading ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-600">{uploadProgress}</p>
                  <p className="text-xs text-day-textMuted dark:text-night-textMuted mt-1">This will take a few seconds...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-semibold">Drop manual text files here, or click to browse</p>
                  <p className="text-xs text-day-textMuted dark:text-night-textMuted mt-1">Supports standard text manuals (.txt)</p>
                </div>
              )}
            </label>

            {/* Ingested files table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-day-border dark:border-night-border text-xs text-day-textMuted dark:text-night-textMuted uppercase tracking-wider">
                    <th className="pb-3">Module Name</th>
                    <th className="pb-3">Uploaded At</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-day-border dark:divide-night-border text-sm">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-day-textMuted dark:text-night-textMuted">
                        No technical manuals ingested yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="py-3 font-semibold">{doc.filename}</td>
                        <td className="py-3 text-xs text-day-textMuted dark:text-night-textMuted">
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                            Indexed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Industrial Uptime Logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-day-textMuted dark:text-night-textMuted font-bold">System Uptime</span>
              <p className="text-2xl font-black mt-1">99.98%</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <Activity size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-day-textMuted dark:text-night-textMuted font-bold">Active Admin Logs</span>
              <p className="text-2xl font-black mt-1">1,204</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/20 text-teal-600">
              <Users size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-day-textMuted dark:text-night-textMuted font-bold">Security Level</span>
              <p className="text-2xl font-black mt-1 text-emerald-500">ELEVATED</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500">
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
