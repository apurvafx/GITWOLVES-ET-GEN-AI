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
  Activity,
  Bookmark,
  Search,
  Layers,
  Plus,
  GitFork,
  X,
  CheckCircle2,
  AlertTriangle,
  Languages,
  RefreshCw,
  Play,
  Pause,
  TrendingUp,
  Gauge,
  Workflow,
  Shield,
  MessageSquare
} from 'lucide-react';

const INCIDENT_TIMELINES = [
  {
    id: "inc_01",
    title: "PUMP-101A Bearing Overheating Failure",
    steps: [
      { time: "0s", nodeId: "PUMP-101A", description: "PUMP-101A vibration spikes, causing high friction and bearing overheat." },
      { time: "15s", nodeId: "VALVE-102", description: "Isolation safety VALVE-102 fails to respond to automatic shut-off signal." },
      { time: "35s", nodeId: "MCC-P101", description: "Downstream motor control MCC-P101 trips breaker to prevent electrical fire." },
      { time: "55s", nodeId: "SOP-OPS-12", description: "Emergency shutdown procedure SOP-OPS-12 is manually initiated by operator." }
    ]
  },
  {
    id: "inc_02",
    title: "VALVE-102 Gas Seal Leakage",
    steps: [
      { time: "0s", nodeId: "VALVE-102", description: "VALVE-102 seal pressure drops, leaking high-pressure natural gas." },
      { time: "20s", nodeId: "OISD-GDN-115", description: "Gas level violates OISD-GDN-115 safety threshold in ATEX Zone 1." },
      { time: "45s", nodeId: "PUMP-101A", description: "Refinery board isolates PUMP-101A feed stream to clear gas pockets safely." }
    ]
  }
];

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
  
  // Documents list & Multilingual Translation (Step 5)
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewingManual, setViewingManual] = useState<{ filename: string; content: string } | null>(null);
  const [translatedManualText, setTranslatedManualText] = useState<string | null>(null);
  const [translatingManual, setTranslatingManual] = useState(false);
  const [showManualHindi, setShowManualHindi] = useState(false);
  const [fetchingManual, setFetchingManual] = useState(false);

  // Incident propagation visualizer (Step 6)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);

  // LOTO Permits & Lock-Out states (Step 7)
  const [lotoPermits, setLotoPermits] = useState<any[]>([]);
  const [lotoLockedNodes, setLotoLockedNodes] = useState<string[]>([]);
  const [showLotoModal, setShowLotoModal] = useState<boolean>(false);
  const [newLotoAssetId, setNewLotoAssetId] = useState<string>('');
  const [newLotoIsolations, setNewLotoIsolations] = useState<string[]>([]);
  const [lotoSubmitting, setLotoSubmitting] = useState<boolean>(false);
  const [lotoError, setLotoError] = useState<string | null>(null);
  const [lotoSuccess, setLotoSuccess] = useState<string | null>(null);

  // Left panel view toggle ('matrix' = standard network graph, 'spatial' = visual identity flowchart and McKinsey impact)
  const [leftPanelTab, setLeftPanelTab] = useState<'matrix' | 'spatial'>('matrix');

  // Mobile viewport active tab switcher ('sidebar' | 'matrix' | 'chat')
  const [mobileTab, setMobileTab] = useState<'sidebar' | 'matrix' | 'chat'>('matrix');

  // Graph Editor Modal State (Step 2)
  const [showGraphEditor, setShowGraphEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<'node' | 'edge'>('node');
  const [newNodeId, setNewNodeId] = useState('');
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState('asset');
  
  const [newEdgeSource, setNewEdgeSource] = useState('');
  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeRel, setNewEdgeRel] = useState('CONNECTED_TO');
  
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  const handleManualClick = async (docId: string) => {
    setFetchingManual(true);
    setTranslatedManualText(null);
    setShowManualHindi(false);
    try {
      const response = await api.get(`/api/docs/content/${docId}`);
      setViewingManual(response.data);
    } catch (err) {
      console.error("Failed to load manual content:", err);
    } finally {
      setFetchingManual(false);
    }
  };

  const handleTranslateManualText = async () => {
    if (!viewingManual) return;
    if (showManualHindi) {
      setShowManualHindi(false);
      return;
    }
    if (translatedManualText) {
      setShowManualHindi(true);
      return;
    }

    setTranslatingManual(true);
    try {
      const response = await api.post('/api/copilot/translate', {
        text: viewingManual.content,
        target_lang: 'Hindi'
      });
      setTranslatedManualText(response.data.translated_text);
      setShowManualHindi(true);
    } catch (err) {
      console.error("Manual translation error:", err);
    } finally {
      setTranslatingManual(false);
    }
  };

  // Playback timer for incident timeline visualizer (Step 6)
  useEffect(() => {
    let timer: any = null;
    if (isTimelinePlaying && selectedIncidentId) {
      const activeTimeline = INCIDENT_TIMELINES.find(t => t.id === selectedIncidentId);
      if (activeTimeline) {
        timer = setInterval(() => {
          setTimelineIndex(prev => {
            if (prev >= activeTimeline.steps.length - 1) {
              setIsTimelinePlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 3200);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimelinePlaying, selectedIncidentId]);

  const activePropagationNodes = useMemo(() => {
    if (!selectedIncidentId) return [];
    const activeTimeline = INCIDENT_TIMELINES.find(t => t.id === selectedIncidentId);
    if (!activeTimeline) return [];
    return activeTimeline.steps.slice(0, timelineIndex + 1).map(s => s.nodeId);
  }, [selectedIncidentId, timelineIndex]);

  const fetchData = async () => {
    try {
      const graphResponse = await api.get('/api/graph/network');
      const network = graphResponse.data;
      setNodes(network.nodes || []);
      setEdges(network.edges || []);
      setLotoLockedNodes(network.loto_locked_nodes || []);

      const docsResponse = await api.get('/api/docs/list');
      setDocuments(docsResponse.data);

      const lotoResponse = await api.get('/api/loto/list');
      setLotoPermits(lotoResponse.data || []);
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

  // Add custom node handler
  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId || !newNodeName) return;
    setEditorLoading(true);
    setEditorError(null);
    setEditorSuccess(null);
    try {
      const res = await api.post('/api/graph/add-node', {
        id: newNodeId.toUpperCase(),
        name: newNodeName,
        type: newNodeType
      });
      setEditorSuccess(res.data.message || `Node '${newNodeName}' submitted for Admin PR review.`);
      setNewNodeId('');
      setNewNodeName('');
      fetchData();
    } catch (err: any) {
      setEditorError(err.response?.data?.detail || 'Failed to add node.');
    } finally {
      setEditorLoading(false);
    }
  };

  // Add custom edge handler
  const handleAddEdge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSource || !newEdgeTarget) return;
    setEditorLoading(true);
    setEditorError(null);
    setEditorSuccess(null);
    try {
      const res = await api.post('/api/graph/add-edge', {
        source_id: newEdgeSource,
        target_id: newEdgeTarget,
        rel_type: newEdgeRel
      });
      setEditorSuccess(res.data.message || `Edge connection submitted for Admin PR review.`);
      setNewEdgeSource('');
      setNewEdgeTarget('');
      fetchData();
    } catch (err: any) {
      setEditorError(err.response?.data?.detail || 'Failed to add edge.');
    } finally {
      setEditorLoading(false);
    }
  };

  const handleCreateLoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLotoAssetId) return;
    setLotoSubmitting(true);
    setLotoError(null);
    setLotoSuccess(null);
    try {
      await api.post('/api/loto/request', {
        asset_id: newLotoAssetId,
        isolation_steps: newLotoIsolations
      });
      setLotoSuccess("LOTO safety permit requested successfully. Awaiting Admin sign-off.");
      setNewLotoAssetId('');
      setNewLotoIsolations([]);
      setTimeout(() => {
        setShowLotoModal(false);
        setLotoSuccess(null);
      }, 2000);
      fetchData();
    } catch (err: any) {
      setLotoError(err.response?.data?.detail || "Failed to submit LOTO request.");
    } finally {
      setLotoSubmitting(false);
    }
  };

  const assetNodes = useMemo(() => {
    return nodes.filter(n => n.type === 'asset');
  }, [nodes]);

  const nonAssetNodes = useMemo(() => {
    return nodes.filter(n => n.type !== 'document' && n.type !== 'regulation');
  }, [nodes]);


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
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm font-display text-stone-950">VigilOps</span>
                <span className="bg-lime-400 text-slate-950 font-mono text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  OPERATIONS MATRIX
                </span>
              </div>
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
        <aside className={`rounded-3xl border border-stone-300/40 liquid-glass flex-col flex-shrink-0 shadow-2xl overflow-hidden ${mobileTab === 'sidebar' ? 'flex w-full h-full' : 'hidden xl:flex w-64 h-full'}`}>
          {/* Document Library (Top half) */}
          <div className="h-[50%] flex flex-col min-h-0 border-b border-stone-300">
            <div className="p-4 border-b border-stone-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-stone-950" />
                <h3 className="font-bold text-xs font-display text-stone-950">Document Library</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-500">{documents.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
          </div>

          {/* LOTO Safety Lock-Out (Bottom half) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-stone-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-stone-950" />
                <h3 className="font-bold text-xs font-display text-stone-950">LOTO Lock-Out</h3>
              </div>
              <button
                onClick={() => {
                  setShowLotoModal(true);
                  setLotoError(null);
                  setLotoSuccess(null);
                }}
                className="px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-slate-950 text-lime-400 hover:bg-slate-800 transition-all active:scale-95 shadow"
              >
                + LOTO
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {lotoPermits.length === 0 ? (
                <p className="text-xs text-stone-500 italic p-2 text-center text-stone-400">
                  No active or pending LOTO permits.
                </p>
              ) : (
                lotoPermits.map((permit) => (
                  <div
                    key={permit.id}
                    className="p-3 rounded-2xl border border-stone-350 bg-white space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-stone-950 uppercase">
                        {permit.asset_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-black uppercase tracking-wider ${
                          permit.status === 'approved'
                            ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                            : permit.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {permit.status === 'approved' ? 'LOCKED' : permit.status}
                      </span>
                    </div>
                    <div className="text-[9px] text-stone-600 font-mono space-y-0.5 leading-tight">
                      <p>Worker: <span className="font-bold text-stone-900">{permit.requested_by}</span></p>
                      {permit.isolation_steps.length > 0 && (
                        <p className="truncate">
                          Isolate: <span className="font-bold text-stone-900">{permit.isolation_steps.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Split Screen Main */}
        <main className="flex-1 flex overflow-hidden gap-4 min-h-0">
          <div className={`flex-col gap-2.5 h-full min-h-0 rounded-3xl border border-stone-300/40 liquid-glass p-4 shadow-2xl ${mobileTab === 'matrix' ? 'flex w-full' : 'hidden lg:flex lg:flex-1'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-stone-300/60 p-1 rounded-full border border-stone-350">
                <button
                  type="button"
                  onClick={() => setLeftPanelTab('matrix')}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                    leftPanelTab === 'matrix' ? 'bg-slate-950 text-lime-400 shadow-sm' : 'text-stone-600'
                  }`}
                >
                  Operations Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setLeftPanelTab('spatial')}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                    leftPanelTab === 'spatial' ? 'bg-slate-950 text-lime-400 shadow-sm' : 'text-stone-600'
                  }`}
                >
                  Spatial Flowchart
                </button>
              </div>
              
              {leftPanelTab === 'matrix' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowGraphEditor(true);
                      setEditorError(null);
                      setEditorSuccess(null);
                    }}
                    className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-slate-950 text-lime-400 hover:bg-slate-800 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    <Plus size={10} /> Edit Network
                  </button>
                  <button
                    onClick={() => setNodeLimit(nodeLimit === 'top' ? 'all' : 'top')}
                    className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-300 hover:bg-stone-400 text-stone-950 transition-all flex items-center gap-1 border border-stone-400"
                  >
                    <Layers size={10} />
                    {nodeLimit === 'top' ? 'Focus (60)' : `All (${nodes.length})`}
                  </button>
                </div>
              )}
            </div>

            {leftPanelTab === 'spatial' ? (
              <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
                {/* Liquid Glass Header */}
                <div className="relative overflow-hidden p-6 rounded-3xl bg-slate-950 border border-stone-800 text-stone-100 shadow-2xl flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-1.5 z-10">
                    <span className="bg-lime-400 text-slate-950 font-mono text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Knowledge Engineering Command Center
                    </span>
                    <h3 className="text-base font-bold font-display text-white">
                      Plant Knowledge Fragmentation Impact
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed font-light">
                      Industrial intelligence consolidation dashboard mapping NASSCOM-EY & McKinsey data loss vectors.
                    </p>
                  </div>
                </div>

                {/* SVG Liquid Flow Pipeline */}
                <div className="p-4 rounded-3xl border border-stone-300 bg-stone-900 shadow-inner flex flex-col gap-2 relative">
                  <span className="text-[9px] font-mono font-bold text-lime-400 uppercase tracking-widest absolute top-3 left-4">
                    Data Pipeline Liquid Flow
                  </span>
                  
                  <div className="h-28 w-full flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 400 100">
                      <defs>
                        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      <path d="M 50 25 L 200 50" stroke="#444" strokeWidth="2.5" fill="none" />
                      <path d="M 50 75 L 200 50" stroke="#444" strokeWidth="2.5" fill="none" />
                      <path d="M 200 50 L 350 50" stroke="#444" strokeWidth="3" fill="none" />

                      <circle r="4.5" fill="#c4f124" filter="url(#neon-glow)">
                        <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 25 L 200 50" />
                      </circle>
                      <circle r="4.5" fill="#38bdf8" filter="url(#neon-glow)">
                        <animateMotion dur="3.2s" repeatCount="indefinite" path="M 50 75 L 200 50" />
                      </circle>
                      <circle r="6" fill="#ef4444" filter="url(#neon-glow)">
                        <animateMotion dur="2s" repeatCount="indefinite" path="M 200 50 L 350 50" />
                      </circle>

                      <circle cx="50" cy="25" r="9" fill="#0f0f14" stroke="#c4f124" strokeWidth="2" />
                      <circle cx="50" cy="75" r="9" fill="#0f0f14" stroke="#38bdf8" strokeWidth="2" />
                      
                      <rect x="180" y="35" width="40" height="30" rx="6" fill="#0f0f14" stroke="#ef4444" strokeWidth="2" filter="url(#neon-glow)" />
                      
                      <circle cx="350" cy="50" r="10" fill="#0f0f14" stroke="#10b981" strokeWidth="2.5" />

                      <text x="50" y="29" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">S</text>
                      <text x="50" y="79" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">K</text>
                      <text x="200" y="53" fill="#fff" fontSize="7" fontWeight="black" textAnchor="middle">AI</text>
                      <text x="350" y="54" fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle">✔</text>

                      <text x="45" y="12" fill="#c4f124" fontSize="8" fontWeight="bold">Silos</text>
                      <text x="45" y="93" fill="#38bdf8" fontSize="8" fontWeight="bold">Knowledge</text>
                      <text x="200" y="27" fill="#ef4444" fontSize="8" fontWeight="bold">VigilOps</text>
                      <text x="350" y="37" fill="#10b981" fontSize="8" fontWeight="bold">Operations</text>
                    </svg>
                  </div>
                </div>

                {/* McKinsey & NASSCOM Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5 flex-1 overflow-y-auto">
                  <div className="p-4 rounded-3xl border border-stone-300 bg-white shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">McKinsey Global</span>
                      <Workflow size={14} className="text-stone-900" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black font-mono text-slate-900">35%</h4>
                      <p className="text-[10px] font-bold text-stone-950 mt-1">Search Latency Loss</p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                        Working hours spent searching manuals or resolving hidden asset dependencies.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl border border-stone-300 bg-white shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">NASSCOM-EY</span>
                      <Layers size={14} className="text-stone-900" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black font-mono text-slate-900">7-12</h4>
                      <p className="text-[10px] font-bold text-stone-950 mt-1">Disconnected Silos</p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                        Separate document hubs for engineering drawing P&IDs, manuals, and work orders.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl border border-stone-300 bg-white shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">Knowledge Cliff</span>
                      <Shield size={14} className="text-stone-900" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black font-mono text-slate-900">25%</h4>
                      <p className="text-[10px] font-bold text-stone-950 mt-1">Engineer Retirements</p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                        Plant experience lost in the next decade. VigilOps preserves knowledge graphs.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl border border-stone-300 bg-white shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">BIS Research</span>
                      <Activity size={14} className="text-stone-900" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-black font-mono text-slate-900">-22%</h4>
                      <p className="text-[10px] font-bold text-stone-950 mt-1">Unplanned Downtime</p>
                      <p className="text-[9px] text-stone-500 mt-0.5 leading-tight">
                        Downtime events resolved by unifying equipment history and dependency mapping.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                        type="button"
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

                <div className="h-[52%] min-h-0 relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-950">
                  <ForceGraph
                    nodes={filteredNodes}
                    edges={filteredEdges}
                    focusedNodeId={focusedNodeId}
                    theme="dark"
                    onNodeClick={(id) => handleNodeFocus(id)}
                    activePropagationNodes={activePropagationNodes}
                    lotoLockedNodes={lotoLockedNodes}
                  />
                </div>
              </>
            )}

            {/* Step 6: Incident Root-Cause Fault Propagation Timeline Visualizer */}
            <div className="flex-1 min-h-0 border border-stone-300 rounded-2xl bg-white p-4 shadow-inner flex flex-col justify-between font-sans">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-red-500" size={16} />
                    <h3 className="font-extrabold text-[11px] font-display uppercase tracking-wider text-stone-950">
                      Incident Fault Propagation
                    </h3>
                  </div>
                  <select
                    value={selectedIncidentId}
                    onChange={(e) => {
                      setSelectedIncidentId(e.target.value);
                      setTimelineIndex(0);
                      setIsTimelinePlaying(false);
                    }}
                    className="px-2 py-1 rounded-full border border-stone-300 bg-[#f0f0ed] text-[10px] font-mono font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">-- Select Incident --</option>
                    {INCIDENT_TIMELINES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedIncidentId ? (
                  <p className="text-[10px] text-stone-500 italic py-3 text-center">
                    Select a refinery incident failure above to track fault propagation.
                  </p>
                ) : (
                  (() => {
                    const activeTimeline = INCIDENT_TIMELINES.find(t => t.id === selectedIncidentId);
                    if (!activeTimeline) return null;
                    const step = activeTimeline.steps[timelineIndex];

                    return (
                      <div className="space-y-2.5">
                        {/* Playback Controls & Slider */}
                        <div className="flex items-center gap-3 bg-stone-100 p-2.5 rounded-2xl border border-stone-200">
                          <button
                            type="button"
                            onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                            className="p-2 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 flex items-center justify-center transition-all active:scale-95 shadow"
                          >
                            {isTimelinePlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>

                          <div className="flex-1 flex flex-col gap-1.5">
                            <input
                              type="range"
                              min="0"
                              max={activeTimeline.steps.length - 1}
                              value={timelineIndex}
                              onChange={(e) => {
                                setTimelineIndex(parseInt(e.target.value));
                                setIsTimelinePlaying(false);
                              }}
                              className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                            <div className="flex justify-between text-[9px] font-mono font-bold text-stone-600">
                              <span>Start</span>
                              <span>Step {timelineIndex + 1} of {activeTimeline.steps.length}</span>
                              <span>End</span>
                            </div>
                          </div>
                        </div>

                        {/* Step Description Card */}
                        <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/60 text-stone-900 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black bg-red-100 text-red-700 border border-red-300">
                              T = {step.time}
                            </span>
                            <button
                              onClick={() => handleNodeFocus(step.nodeId)}
                              className="text-[9px] font-mono font-black text-sky-600 hover:text-sky-800 uppercase"
                            >
                              Focus {step.nodeId} &rarr;
                            </button>
                          </div>
                          <p className="text-[11px] leading-relaxed text-stone-800 font-medium">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>

          <div className={`flex-col gap-2 h-full min-h-0 ${mobileTab === 'chat' ? 'flex w-full' : 'hidden lg:flex lg:w-[32%] lg:min-w-[360px] flex-shrink-0'}`}>
            <DocPilotChat onNodeFocus={handleNodeFocus} />
          </div>
        </main>

        {/* Mobile/Tablet Bottom Navigation Bar */}
        <div className="lg:hidden flex-shrink-0 p-3 bg-white border-t border-stone-300 flex items-center justify-around z-40">
          <button
            type="button"
            onClick={() => setMobileTab('sidebar')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold tracking-wider transition-all uppercase ${
              mobileTab === 'sidebar' ? 'text-lime-600' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileText size={16} />
            <span>Library</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('matrix')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold tracking-wider transition-all uppercase ${
              mobileTab === 'matrix' ? 'text-lime-600' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Activity size={16} />
            <span>Matrix</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('chat')}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold tracking-wider transition-all uppercase ${
              mobileTab === 'chat' ? 'text-lime-600' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <MessageSquare size={16} className={mobileTab === 'chat' ? 'text-lime-600' : 'text-stone-500'} />
            <span>DocPilot</span>
          </button>
        </div>
      </div>

      {/* Step 2: Interactive Graph Node & Edge Relationship Editor Modal */}
      {showGraphEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f0f0ed] border border-stone-300 rounded-3xl w-full max-w-md p-7 relative shadow-2xl space-y-5">
            <button
              onClick={() => setShowGraphEditor(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-xl font-black font-display text-stone-950 flex items-center gap-2">
                <GitFork size={20} className="text-stone-950" /> Network Relationship Editor
              </h3>
              <p className="text-xs text-stone-600 mt-1">Add custom equipment nodes & dependency links.</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-stone-200 rounded-full border border-stone-300 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => { setEditorTab('node'); setEditorError(null); setEditorSuccess(null); }}
                className={`flex-1 py-2 rounded-full uppercase tracking-wider transition-all ${
                  editorTab === 'node' ? 'bg-slate-950 text-lime-400 shadow-md' : 'text-stone-600'
                }`}
              >
                Add Node
              </button>
              <button
                type="button"
                onClick={() => { setEditorTab('edge'); setEditorError(null); setEditorSuccess(null); }}
                className={`flex-1 py-2 rounded-full uppercase tracking-wider transition-all ${
                  editorTab === 'edge' ? 'bg-slate-950 text-lime-400 shadow-md' : 'text-stone-600'
                }`}
              >
                Connect Edge
              </button>
            </div>

            {editorError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle size={14} /> <span>{editorError}</span>
              </div>
            )}
            {editorSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 size={14} /> <span>{editorSuccess}</span>
              </div>
            )}

            {editorTab === 'node' ? (
              <form onSubmit={handleAddNode} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Node ID Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PUMP-201B"
                    value={newNodeId}
                    onChange={(e) => setNewNodeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Node Display Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Secondary Feed Pump"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Category Type
                  </label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono"
                  >
                    <option value="asset">Asset / Equipment</option>
                    <option value="procedure">SOP Procedure</option>
                    <option value="regulation">Safety Regulation</option>
                    <option value="incident">Incident Event</option>
                    <option value="document">Technical Document</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={editorLoading}
                  className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {editorLoading ? 'Adding Node...' : 'Add Equipment Node'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddEdge} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Source Node
                  </label>
                  <select
                    required
                    value={newEdgeSource}
                    onChange={(e) => setNewEdgeSource(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono"
                  >
                    <option value="">-- Select Source Node --</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.id} ({n.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Target Node
                  </label>
                  <select
                    required
                    value={newEdgeTarget}
                    onChange={(e) => setNewEdgeTarget(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono"
                  >
                    <option value="">-- Select Target Node --</option>
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.id} ({n.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                    Relationship Label
                  </label>
                  <select
                    value={newEdgeRel}
                    onChange={(e) => setNewEdgeRel(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono"
                  >
                    <option value="CONNECTED_TO">CONNECTED_TO</option>
                    <option value="ISOLATED_BY">ISOLATED_BY</option>
                    <option value="POWERED_BY">POWERED_BY</option>
                    <option value="GOVERNED_BY">GOVERNED_BY</option>
                    <option value="MONITORED_BY">MONITORED_BY</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={editorLoading}
                  className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {editorLoading ? 'Connecting Edge...' : 'Connect Dependency Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manual Viewer Modal */}
      {viewingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f0f0ed] border border-stone-300 rounded-3xl w-full max-w-2xl p-7 relative max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold font-display flex items-center gap-2 text-stone-950">
                <FileText className="text-stone-950" size={18} />
                Refinery Manual: <span className="text-stone-950 font-mono">{viewingManual.filename}</span>
              </h3>
              <button
                type="button"
                onClick={handleTranslateManualText}
                disabled={translatingManual}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  showManualHindi
                    ? 'bg-slate-950 text-lime-400 shadow-md'
                    : 'bg-stone-300 hover:bg-stone-400 text-stone-950 border border-stone-400'
                }`}
              >
                {translatingManual ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Languages size={13} />
                )}
                <span>{showManualHindi ? 'Show English' : 'Translate to Hindi (हिंदी)'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-500 font-light mb-4">
              Browsing raw document guidelines ({showManualHindi ? 'Hindi Translation' : 'Original English'}):
            </p>
            <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-white border border-stone-300 font-sans text-xs whitespace-pre-wrap text-stone-800 leading-relaxed">
              {showManualHindi && translatedManualText ? translatedManualText : viewingManual.content}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => {
                  setViewingManual(null);
                  setShowManualHindi(false);
                }}
                className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-full bg-slate-950 text-lime-400 shadow-lg active:scale-95 transition-all"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOTO Safety isolation permit request Modal */}
      {showLotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f0f0ed] border border-stone-300 rounded-3xl w-full max-w-md p-7 relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowLotoModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-center gap-2">
              <Gauge className="text-stone-950" size={18} />
              <h3 className="text-base font-bold font-display text-stone-950">
                Request LOTO Safety Isolation
              </h3>
            </div>

            {lotoError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-mono">
                {lotoError}
              </div>
            )}
            {lotoSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-mono">
                {lotoSuccess}
              </div>
            )}

            <form onSubmit={handleCreateLoto} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1.5">
                  Target Asset to Maintain
                </label>
                <select
                  required
                  value={newLotoAssetId}
                  onChange={(e) => {
                    setNewLotoAssetId(e.target.value);
                    setNewLotoIsolations([]);
                  }}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-white text-xs text-stone-900 font-mono focus:ring-1 focus:ring-lime-400"
                >
                  <option value="">-- Choose Asset --</option>
                  {assetNodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.id} - {node.name}
                    </option>
                  ))}
                </select>
              </div>

              {newLotoAssetId && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-stone-600 uppercase mb-1">
                    Select Isolation Points
                  </label>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    Which connected valves or electrical breakers must be isolated?
                  </p>
                  <div className="max-h-36 overflow-y-auto border border-stone-300 bg-white rounded-2xl p-3 space-y-2">
                    {nonAssetNodes.length === 0 ? (
                      <p className="text-[10px] text-stone-400 italic">No nodes available.</p>
                    ) : (
                      nonAssetNodes.map((node) => {
                        const isChecked = newLotoIsolations.includes(node.id);
                        return (
                          <label
                            key={node.id}
                            className="flex items-center gap-2 text-xs font-mono text-stone-800 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setNewLotoIsolations(prev => prev.filter(id => id !== node.id));
                                } else {
                                  setNewLotoIsolations(prev => [...prev, node.id]);
                                }
                              }}
                              className="rounded border-stone-300 text-red-500 focus:ring-red-500"
                            />
                            <span>{node.id} ({node.name})</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={lotoSubmitting || !newLotoAssetId}
                className="w-full py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-black shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {lotoSubmitting ? 'Submitting...' : 'Submit LOTO Safety Permit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
