import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ForceGraph } from './ForceGraph';
import type { Node, Edge } from './ForceGraph';
import { DocPilotChat } from './DocPilotChat';
import { 
  Building2, 
  LogOut, 
  FileText, 
  Network, 
  Bot,
  Activity,
  Bookmark,
  Search,
  Layers,
  Sparkles
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { logout, companyId } = useAuth();
  
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

  const fetchData = async () => {
    try {
      const graphResponse = await api.get('/api/graph/network');
      const network = graphResponse.data;
      setNodes(network.nodes || []);
      setEdges(network.edges || []);

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
    setTimeout(() => {
      setFocusedNodeId(null);
    }, 4000);
  };

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
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#e8e8e5] text-stone-900 transition-colors duration-300 flex flex-col font-sans">
      {/* Header Navbar */}
      <div className="pt-3 px-4 flex-shrink-0 z-40">
        <header className="w-full h-16 rounded-full border border-stone-300 bg-[#e8e8e5]/90 backdrop-blur-3xl shadow-xl flex items-center justify-between px-8">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-lime-400 font-black text-lg flex items-center justify-center font-display shadow-md">
              V
            </div>
            <div>
              <h1 className="font-extrabold text-xs font-display text-stone-950 leading-none">
                VigilOps <span className="text-lime-600 font-mono text-[9px] font-bold">OPERATIONS MATRIX</span>
              </h1>
              <p className="text-[9px] font-mono text-stone-600 flex items-center gap-1 mt-0.5">
                <Building2 size={10} /> Refinery: <span className="font-bold text-stone-900">{companyId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-stone-300 text-stone-900 border border-stone-400">
              EMPLOYEE ACCESS
            </span>
            <button
              onClick={logout}
              className="px-4 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-mono font-extrabold flex items-center gap-1 transition-all active:scale-95 uppercase tracking-wider"
            >
              <LogOut size={12} /> Log Out
            </button>
          </div>
        </header>
      </div>

      {/* Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 p-4 gap-4">
        {/* Left Sidebar */}
        <aside className="w-64 rounded-3xl border border-stone-300 bg-[#f0f0ed] backdrop-blur-2xl flex flex-col flex-shrink-0 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-stone-950" />
              <h3 className="font-bold text-xs font-display text-stone-950">Document Library</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-stone-500">{documents.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {documents.length === 0 ? (
              <p className="text-xs text-stone-500 italic p-2">
                No technical manuals uploaded yet by Admin.
              </p>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleManualClick(doc.id)}
                  disabled={fetchingManual}
                  className="w-full text-left p-3.5 rounded-2xl border border-stone-300 hover:border-stone-950 bg-white cursor-pointer transition-all flex items-center gap-3 disabled:opacity-50 group"
                >
                  <Bookmark size={14} className="text-stone-900 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold truncate text-stone-950">
                      {doc.filename}
                    </p>
                    <p className="text-[9px] font-mono text-stone-500 mt-0.5">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Split Screen Main */}
        <main className="flex-1 flex overflow-hidden gap-4 min-h-0">
          <div className="w-[42%] flex flex-col gap-2.5 flex-shrink-0 h-full min-h-0 rounded-3xl border border-stone-300 bg-[#f0f0ed] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network size={16} className="text-stone-950" />
                <h2 className="font-bold text-xs font-display text-stone-950">Operations Matrix</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNodeLimit(nodeLimit === 'top' ? 'all' : 'top')}
                  className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-300 hover:bg-stone-400 text-stone-950 transition-all flex items-center gap-1 border border-stone-400"
                >
                  <Layers size={10} />
                  {nodeLimit === 'top' ? 'Focus View (60)' : `Full View (${nodes.length})`}
                </button>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-300 text-stone-950 border border-stone-400">
                  {filteredNodes.length} Nodes
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
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
                    className={`px-3.5 py-1.5 rounded-full font-mono font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap text-[10px] ${
                      selectedCategory === cat.id
                        ? 'bg-slate-950 text-lime-400 shadow-md'
                        : 'bg-stone-200 text-stone-700 hover:bg-stone-300 border border-stone-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={12} className="absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nodes (e.g. PUMP-101A, ATEX)..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-full border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-950">
              <ForceGraph
                nodes={filteredNodes}
                edges={filteredEdges}
                focusedNodeId={focusedNodeId}
                theme="dark"
                onNodeClick={(id) => handleNodeFocus(id)}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 h-full min-h-0">
            <DocPilotChat onNodeFocus={handleNodeFocus} />
          </div>
        </main>
      </div>

      {viewingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f0f0ed] border border-stone-300 rounded-3xl w-full max-w-2xl p-7 relative max-h-[85vh] flex flex-col shadow-2xl">
            <h3 className="text-base font-bold font-display mb-2 flex items-center gap-2 text-stone-950">
              <FileText className="text-stone-950" size={18} />
              Refinery Manual: <span className="text-stone-950 font-mono">{viewingManual.filename}</span>
            </h3>
            <p className="text-xs text-stone-500 font-light mb-4">
              Browsing raw document guidelines:
            </p>
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white border border-stone-300 font-sans text-xs whitespace-pre-wrap text-stone-800 leading-relaxed">
              {viewingManual.content}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setViewingManual(null)}
                className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-full bg-slate-950 text-lime-400 shadow-lg active:scale-95 transition-all"
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
