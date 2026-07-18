import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ForceGraph, Node, Edge } from './ForceGraph';
import { DocPilotChat } from './DocPilotChat';
import { 
  Building2, 
  LogOut, 
  Sun, 
  Moon, 
  FileText, 
  Network, 
  Bot,
  Activity,
  Bookmark
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { logout, theme, toggleTheme, companyId } = useAuth();
  
  // Graph State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  
  // Documents list
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'graph' | 'manuals'>('graph');

  // Fetch graph network and documents
  const fetchData = async () => {
    try {
      // 1. Fetch graph data
      const graphResponse = await api.get('/api/graph/network');
      const network = graphResponse.data;
      setNodes(network.nodes || []);
      setEdges(network.edges || []);

      // 2. Fetch document list
      const docsResponse = await api.get('/api/docs/list');
      setDocuments(docsResponse.data);
    } catch (err: any) {
      console.error('Failed to retrieve employee dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNodeFocus = (nodeId: string) => {
    setFocusedNodeId(nodeId);
    // Remove focus highlighting after 4 seconds
    setTimeout(() => {
      setFocusedNodeId((current) => (current === nodeId ? null : current));
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-day-bg dark:bg-night-bg text-day-text dark:text-night-text transition-colors duration-300 flex flex-col">
      {/* 1. Header */}
      <header className="border-b border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface px-8 h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white font-black text-lg">
            V
          </div>
          <div>
            <h1 className="font-bold text-base">VigilOps Operations</h1>
            <p className="text-xs text-day-textMuted dark:text-night-textMuted flex items-center gap-1">
              <Building2 size={12} /> Refinery: <span className="font-semibold text-blue-600">{companyId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
            EMPLOYEE ACCESS
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

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Document Library (20% width) */}
        <aside className="w-64 border-r border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-day-border dark:border-night-border flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h3 className="font-bold text-sm">Document Library</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-[10px] uppercase font-bold text-day-textMuted dark:text-night-textMuted mb-2">
              Ingested Manuals ({documents.length})
            </p>
            {documents.length === 0 ? (
              <p className="text-xs text-day-textMuted dark:text-night-textMuted italic">
                No technical manuals uploaded yet by Admin.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-day-border dark:border-night-border hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-default transition-all flex items-center gap-3"
                >
                  <Bookmark size={16} className="text-amber-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate text-day-text dark:text-slate-200">
                      {doc.filename}
                    </p>
                    <p className="text-[9px] text-day-textMuted dark:text-night-textMuted mt-0.5">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Workspace Body: Split Screen */}
        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Side: Node Graph Canvas (40% width) */}
          <div className="w-[40%] flex flex-col gap-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-blue-500" />
                <h2 className="font-bold text-sm">Operations Matrix</h2>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                {nodes.length} Nodes • {edges.length} Edges
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <ForceGraph
                nodes={nodes}
                edges={edges}
                focusedNodeId={focusedNodeId}
                onNodeClick={(id) => handleNodeFocus(id)}
              />
            </div>
          </div>

          {/* Right Side: DocPilot Full Page Chat (60% width) */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-teal-500" />
                <h2 className="font-bold text-sm">Troubleshooting Panel</h2>
              </div>
              <span className="text-[10px] text-day-textMuted dark:text-night-textMuted flex items-center gap-1">
                <Activity size={10} className="text-emerald-500 animate-ping" /> Real-time active mapping
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <DocPilotChat onNodeFocus={handleNodeFocus} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
