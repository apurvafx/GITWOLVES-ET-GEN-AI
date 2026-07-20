import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  Key, 
  UploadCloud, 
  FileText, 
  Users, 
  Activity, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Zap,
  Sparkles,
  ShieldCheck,
  Layers,
  Settings
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, companyId, username } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Employee ID generator fields
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState<{ u: string; p: string } | null>(null);

  // Employee Management list
  const [employees, setEmployees] = useState<any[]>([]);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // Ingestion fields
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/docs/list');
      setDocuments(response.data);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/admin/employees');
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Failed to fetch employee accounts:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

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
      fetchEmployees();
    } catch (err: any) {
      const details = err.response?.data?.detail;
      if (Array.isArray(details)) {
        setError(details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join(', '));
      } else {
        setError(err.response?.data?.detail || 'Failed to create employee account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId: string, empUser: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for employee '${empUser}'?`)) return;
    setDeletingEmpId(empId);
    try {
      await api.delete(`/api/admin/employees/${empId}`);
      setSuccess(`Revoked credentials for '${empUser}'.`);
      fetchEmployees();
    } catch (err: any) {
      setError('Failed to delete employee account.');
    } finally {
      setDeletingEmpId(null);
    }
  };

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

  const handleDeleteDocument = async (docId: string, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete manual '${filename}'? This will remove all associated chunk embeddings.`)) return;
    try {
      await api.delete(`/api/docs/${docId}`);
      setSuccess(`Document '${filename}' deleted successfully.`);
      fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document.');
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e8e5] text-stone-900 transition-colors duration-300 font-sans pb-16">
      {/* Header Navbar Pill */}
      <div className="sticky top-6 inset-x-0 z-50 flex justify-center px-4 mb-8">
        <header className="w-full max-w-7xl h-20 rounded-full border border-stone-300 bg-[#e8e8e5]/90 backdrop-blur-3xl shadow-2xl flex items-center justify-between px-8">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-lime-400 font-black text-xl flex items-center justify-center font-display shadow-md">
              V
            </div>
            <div>
              <h1 className="font-extrabold text-base font-display text-stone-950 leading-none">
                VigilOps <span className="text-lime-600 font-mono text-xs font-bold uppercase">ADMIN CONSOLE</span>
              </h1>
              <p className="text-xs font-mono text-stone-600 mt-1 flex items-center gap-1.5">
                <Building2 size={12} /> Workspace: <span className="font-bold text-stone-900">{companyId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-stone-300 text-stone-900 border border-stone-400">
              WORKSPACE ADMINISTRATOR
            </span>
            <button
              onClick={logout}
              className="px-6 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-mono font-extrabold flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wider"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-3xl bg-red-500/10 text-red-600 text-xs border border-red-500/30 flex gap-2 items-center shadow-lg font-mono font-bold">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-600 text-xs border border-emerald-500/30 flex gap-2 items-center shadow-lg font-mono font-bold">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-9 rounded-3xl border border-stone-300 bg-[#f0f0ed] shadow-xl space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-lime-400">
                  <Key size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-stone-950">Credential Generator</h2>
                  <p className="text-xs text-stone-600 font-light">Create employee accounts for {companyId}</p>
                </div>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Employee Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. j.doe.ops"
                    value={empUsername}
                    onChange={(e) => setEmpUsername(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Employee Access Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. Pass123!"
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 bg-white text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Registering...' : 'Generate Employee Credentials'}
                </button>
              </form>

              {generatedCreds && (
                <div className="p-4 rounded-2xl border border-stone-400 bg-stone-300/50 text-xs font-mono space-y-1">
                  <p className="font-bold text-stone-950">Credentials Generated:</p>
                  <p><span className="text-stone-500">Username:</span> {generatedCreds.u}</p>
                  <p><span className="text-stone-500">Password:</span> {generatedCreds.p}</p>
                </div>
              )}
            </div>

            <div className="p-9 rounded-3xl border border-stone-300 bg-[#f0f0ed] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="text-stone-950" size={20} />
                  <h3 className="font-bold font-display text-base text-stone-950">Active Company Employees</h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-stone-300 text-stone-950 border border-stone-400">
                  {employees.length} Active
                </span>
              </div>

              {employees.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No employee accounts registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-4 rounded-2xl border border-stone-300 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-stone-950 font-mono">{emp.username}</p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">{emp.role}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.username)}
                        disabled={deletingEmpId === emp.id}
                        className="px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 transition-all font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-95 disabled:opacity-50"
                      >
                        <Trash2 size={12} /> {deletingEmpId === emp.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-7 p-9 rounded-3xl border border-stone-300 bg-[#f0f0ed] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-lime-400">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-stone-950">Refinery Modules & Manuals</h2>
                  <p className="text-xs text-stone-600 font-light">Knowledge Graph File Ingestion Center</p>
                </div>
              </div>
              <span className="text-xs font-mono text-stone-600 font-extrabold">
                {documents.length} Modules Loaded
              </span>
            </div>

            <label className="relative border-2 border-dashed border-stone-400 hover:border-stone-950 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-stone-200/50 group">
              <input
                type="file"
                accept=".txt,.pdf,.md"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <UploadCloud className={`text-stone-950 mb-3 group-hover:scale-110 transition-transform ${uploading ? 'animate-bounce' : ''}`} size={44} />
              {uploading ? (
                <div className="text-center space-y-1">
                  <p className="text-xs font-mono font-bold text-stone-950">{uploadProgress}</p>
                  <p className="text-xs text-stone-500 font-light">Extracting text & parsing Gemini entity-relations...</p>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-stone-950">Drop technical PDF or text manuals here, or click to browse</p>
                  <p className="text-xs text-stone-500 font-mono">Supports PDF manuals (.pdf), plain text (.txt), and Markdown (.md)</p>
                </div>
              )}
            </label>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-300 text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                    <th className="pb-3">Module Name</th>
                    <th className="pb-3">Uploaded At</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300 text-xs">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-stone-500 italic">
                        No technical manuals ingested yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-stone-200/60 transition-colors">
                        <td className="py-4 font-bold font-mono text-stone-950">{doc.filename}</td>
                        <td className="py-4 text-xs text-stone-500 font-mono">
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </td>
                        <td className="py-4 text-right flex items-center justify-end gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-300 text-stone-950 border border-stone-400">
                            Indexed
                          </span>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                            className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 transition-all"
                            title="Delete Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl border border-stone-300 bg-[#f0f0ed] flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold">System Uptime</span>
              <p className="text-3xl font-black font-display text-stone-950 mt-1">99.98%</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-lime-400">
              <Activity size={24} />
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-stone-300 bg-[#f0f0ed] flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold">Active Admin Logs</span>
              <p className="text-3xl font-black font-display text-stone-950 mt-1">1,204</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-lime-400">
              <Users size={24} />
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-stone-300 bg-[#f0f0ed] flex items-center justify-between shadow-xl">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold">Security Status</span>
              <p className="text-3xl font-black font-display text-emerald-600 mt-1">ELEVATED</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 text-lime-400">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
