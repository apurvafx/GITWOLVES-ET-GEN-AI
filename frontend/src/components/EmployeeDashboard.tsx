import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ForceGraph } from './ForceGraph';
import type { Node, Edge } from './ForceGraph';
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
  Bookmark,
  Search,
  Filter,
  Layers
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { logout, theme, toggleTheme, companyId } = useAuth();
  
  // Graph State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  
  // Graph Filter Controls
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nodeLimit, setNodeLimit] = useState<'top' | 'all'>('top');
  
  // Documents list
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewingManual, setViewingManual] = useState<{ filename: string; content: string } | null>(null);
  const [fetchingManual, setFetchingManual] = useState(false);

  const handleManualClick = async (docId: string) => {
    setFetchingManual(true);
    try {
      const response = await api.get(`/api/docs/content/${docId}`);
      setViewingManual(response.data);
    } catch (err) {
      console.error("Failed to load manual content:", err);
    } finally {
      setFetchingManual(false);
    }
  };

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
      setFocusedNodeId(null);
    }, 4000);
  };

  // Filtered nodes and edges for optimal graph density
  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (selectedCategory !== 'all') {
      result = result.filter((n) => n.type === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
      );
    }
    if (nodeLimit === 'top' && !searchQuery.trim() && selectedCategory === 'all') {
      result = result.slice(0, 60);
    }
    return result;
  }, [nodes, selectedCategory, searchQuery, nodeLimit]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter((e) => nodeIds.has(e.source_id) && nodeIds.has(e.target_id));
  }, [edges, filteredNodes]);

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-day-bg dark:bg-night-bg text-day-text dark:text-night-text transition-colors duration-300 flex flex-col">
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar: Document Library (20% width) */}
        <aside className="w-64 border-r border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-day-border dark:border-night-border flex items-center gap-2">
            <FileText size={18} className="text-blue-500" />
            <h3 className="font-bold text-sm">Document Library</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            <p className="text-[10px] uppercase font-bold text-day-textMuted dark:text-night-textMuted mb-2">
              Ingested Manuals ({documents.length})
            </p>
            {documents.length === 0 ? (
              <p className="text-xs text-day-textMuted dark:text-night-textMuted italic">
                No technical manuals uploaded yet by Admin.
              </p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleManualClick(doc.id)}
                  disabled={fetchingManual}
                  className="w-full text-left p-3 rounded-lg border border-day-border dark:border-night-border hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-all flex items-center gap-3 disabled:opacity-50"
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
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Workspace Body: Split Screen */}
        <main className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">
          {/* Left Side: Node Graph Canvas (40% width) */}
          <div className="w-[42%] flex flex-col gap-3 flex-shrink-0 h-full min-h-0">
            {/* Header & Density Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-blue-500" />
                <h2 className="font-bold text-sm">Operations Matrix</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNodeLimit(nodeLimit === 'top' ? 'all' : 'top')}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-day-text dark:text-slate-300 transition-all flex items-center gap-1"
                >
                  <Layers size={10} />
                  {nodeLimit === 'top' ? 'Focus View (60)' : `Full View (${nodes.length})`}
                </button>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  {filteredNodes.length} Nodes • {filteredEdges.length} Edges
                </span>
              </div>
            </div>

            {/* Graph Category & Search Filter Toolbar */}
            <div className="flex flex-col gap-2">
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'asset', label: 'Assets' },
                  { id: 'procedure', label: 'Procedures' },
                  { id: 'regulation', label: 'Regulations' },
                  { id: 'incident', label: 'Incidents' },
                  { id: 'document', label: 'Documents' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 text-day-textMuted dark:text-night-textMuted hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Node Search Bar */}
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nodes (e.g. PUMP-101A, ATEX, Lubrication)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-day-border dark:border-night-border bg-slate-50 dark:bg-slate-900/30 text-day-text dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 min-h-0 relative">
              <ForceGraph
                nodes={filteredNodes}
                edges={filteredEdges}
                focusedNodeId={focusedNodeId}
                theme={theme}
                onNodeClick={(id) => handleNodeFocus(id)}
              />
            </div>
          </div>

          {/* Right Side: DocPilot Full Page Chat (58% width) */}
          <div className="flex-1 flex flex-col gap-3 h-full min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-teal-500" />
                <h2 className="font-bold text-sm">Troubleshooting Panel</h2>
              </div>
              <span className="text-[10px] text-day-textMuted dark:text-night-textMuted flex items-center gap-1">
                <Activity size={10} className="text-emerald-500 animate-ping" /> Pinned Input Bar
              </span>
            </div>
            <div className="flex-1 min-h-0 h-full overflow-hidden">
              <DocPilotChat onNodeFocus={handleNodeFocus} />
            </div>
          </div>
        </main>
      </div>

      {/* 3. Manual Viewer Modal */}
      {viewingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border rounded-2xl w-full max-w-2xl p-6 relative max-h-[85vh] flex flex-col shadow-xl animate-zoom-in">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              Refinery Manual: <span className="text-blue-600 font-mono">{viewingManual.filename}</span>
            </h3>
            <p className="text-xs text-day-textMuted dark:text-night-textMuted mb-4">
              Browsing raw document guidelines:
            </p>
            <div className="flex-1 overflow-y-auto p-5 rounded-lg bg-slate-50 dark:bg-slate-900/35 border border-day-border dark:border-night-border font-sans text-sm whitespace-pre-wrap text-day-text dark:text-slate-300 leading-relaxed">
              {viewingManual.content}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setViewingManual(null)}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
