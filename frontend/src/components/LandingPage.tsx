import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { TrustMetricsSection } from './TrustMetricsSection';
import { ForceGraph } from './ForceGraph';
import type { Node, Edge } from './ForceGraph';
import { 
  ShieldCheck, 
  GitFork, 
  MessageSquare, 
  IndianRupee, 
  ArrowRight, 
  Check, 
  Play, 
  FileText, 
  Sparkles, 
  Layers, 
  Lock, 
  Activity, 
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Network,
  Zap,
  CheckCircle2,
  ArrowDownRight
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
  onSelectPricingPlan: (planTier: string) => void;
}

// Live Initial Hero D3 Graph Network Nodes & Edges
const heroNodes: Node[] = [
  { id: 'PUMP-101A', name: 'PUMP-101A (Centrifugal)', type: 'asset' },
  { id: 'VALVE-102', name: 'VALVE-102 (Isolation)', type: 'asset' },
  { id: 'MCC-P101', name: 'MCC-P101 (Power Breaker)', type: 'asset' },
  { id: 'SOP-OPS-12', name: 'SOP-OPS-12 (Pump Shutdown)', type: 'procedure' },
  { id: 'OISD-GDN-115', name: 'OISD-GDN-115 (Safety Standard)', type: 'regulation' },
  { id: 'INCIDENT-MAY', name: 'Incident #104 (Bearing Trip)', type: 'incident' },
  { id: 'OEM-MANUAL-P101', name: 'OEM Pump Manual', type: 'document' },
  { id: 'VALVE-103', name: 'VALVE-103 (Suction Drain)', type: 'asset' },
  { id: 'GAUGE-PT-201', name: 'Pressure Transmitter PT-201', type: 'asset' },
  { id: 'SOP-LOTO-04', name: 'SOP LOTO Lockout Procedure', type: 'procedure' },
];

const heroEdges: Edge[] = [
  { source_id: 'PUMP-101A', target_id: 'VALVE-102', relation: 'ISOLATED_BY' },
  { source_id: 'PUMP-101A', target_id: 'MCC-P101', relation: 'POWERED_BY' },
  { source_id: 'PUMP-101A', target_id: 'SOP-OPS-12', relation: 'GOVERNED_BY' },
  { source_id: 'SOP-OPS-12', target_id: 'OISD-GDN-115', relation: 'COMPLIES_WITH' },
  { source_id: 'PUMP-101A', target_id: 'INCIDENT-MAY', relation: 'HISTORICAL_EVENT' },
  { source_id: 'PUMP-101A', target_id: 'OEM-MANUAL-P101', relation: 'DOCUMENTED_IN' },
  { source_id: 'VALVE-102', target_id: 'VALVE-103', relation: 'CONNECTED_TO' },
  { source_id: 'PUMP-101A', target_id: 'GAUGE-PT-201', relation: 'MONITORED_BY' },
  { source_id: 'VALVE-102', target_id: 'SOP-LOTO-04', relation: 'REQUIRES_LOTO' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onDemoClick, onSelectPricingPlan }) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#e8e8e5] text-[#0f0f14] font-sans overflow-x-hidden relative">
      {/* Visual Identity Studio Background Noise Grid & Radial Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:36px_36px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-lime-400/10 rounded-full blur-[220px] pointer-events-none" />
      <div className="absolute top-[40%] right-0 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[240px] pointer-events-none" />

      {/* 1. Visual Identity Floating Island Navbar */}
      <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <header className="w-full max-w-6xl h-20 rounded-full border border-stone-300 bg-[#e8e8e5]/90 backdrop-blur-3xl shadow-2xl flex items-center justify-between px-8 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-lime-400 font-black text-xl flex items-center justify-center font-display shadow-md">
              V
            </div>
            <span className="font-black text-xl tracking-tight font-display text-stone-900">
              VigilOps <span className="text-xs font-mono text-lime-600 font-bold uppercase tracking-widest">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-xs font-mono uppercase tracking-[0.2em] text-stone-700 font-bold">
            <a href="#why" className="hover:text-lime-600 transition-colors">Telemetry</a>
            <a href="#problem" className="hover:text-lime-600 transition-colors">Problem</a>
            <a href="#services" className="hover:text-lime-600 transition-colors">Architecture</a>
            <a href="#trust" className="hover:text-lime-600 transition-colors">Live Audit</a>
            <a href="#pricing" className="hover:text-lime-600 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-5">
            <button
              onClick={() => onLoginClick()}
              className="px-8 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 text-xs font-mono uppercase tracking-widest font-black shadow-xl transition-all active:scale-95"
            >
              Client Login
            </button>
          </div>
        </header>
      </div>

      {/* 2. Hero Section */}
      <section className="pt-48 pb-28 px-6 relative text-center max-w-6xl mx-auto space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Micro Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-5 py-2 rounded-full bg-stone-900/10 border border-stone-900/20 text-stone-900 text-xs font-mono uppercase tracking-[0.2em] font-bold shadow-sm">
              <Sparkles size={13} className="inline mr-2 text-lime-600 animate-pulse" /> MULTI-TENANT CO-PILOT
            </span>
            <span className="px-5 py-2 rounded-full bg-stone-900/10 border border-stone-900/20 text-stone-900 text-xs font-mono uppercase tracking-[0.2em] font-bold shadow-sm">
              <Activity size={13} className="inline mr-2 text-lime-600" /> D3 TOPOLOGICAL MATRIX
            </span>
            <span className="px-5 py-2 rounded-full bg-stone-900/10 border border-stone-900/20 text-stone-900 text-xs font-mono uppercase tracking-[0.2em] font-bold shadow-sm">
              <ShieldCheck size={13} className="inline mr-2 text-lime-600" /> ZERO-HALLUCINATION RAG
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight font-display text-stone-950 leading-[1.04]">
            Transform Heavy SOPs Into An <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-950 via-slate-800 to-lime-600">
              Autonomous Matrix
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-xl text-stone-700 leading-relaxed font-light">
            Eliminate costly industrial plant downtime. Convert unstructured PDF operating manuals, isolation standards, and shift log archives into an interactive 2D topological graph powered by empirical RAG answering.
          </p>

          {/* Substantial, Large High-Impact CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => onSelectPricingPlan('starter')}
              className="w-full sm:w-auto px-12 py-5 sm:px-14 sm:py-6 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 font-mono"
            >
              Get Started Free <ArrowRight size={18} />
            </button>
            <button
              onClick={onDemoClick}
              className="w-full sm:w-auto px-12 py-5 sm:px-14 sm:py-6 rounded-full border-2 border-stone-900 bg-transparent hover:bg-stone-900/10 text-stone-900 font-mono text-sm sm:text-base uppercase tracking-widest font-black transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Play size={16} className="text-stone-900" /> Explore Demo Refinery
            </button>
          </div>
        </motion.div>

        {/* Hero Interactive Live D3 ForceGraph Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-stone-300 bg-[#f0f0ed] p-4 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-300 text-xs font-mono text-stone-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs ml-3 text-stone-800 font-bold">VigilOps Operations Matrix Dashboard v2.4</span>
            </div>
            <span className="text-xs text-lime-700 font-bold uppercase tracking-wider">250 NODES / 335 EDGES ACTIVE</span>
          </div>

          {/* Embedded Live Interactive D3 ForceGraph Canvas */}
          <div className="relative overflow-hidden rounded-2xl border border-stone-300 bg-stone-950 aspect-[16/9] shadow-inner">
            <ForceGraph
              nodes={heroNodes}
              edges={heroEdges}
              focusedNodeId="PUMP-101A"
              theme="dark"
            />
            <div className="absolute bottom-6 left-6 p-4 sm:p-5 rounded-2xl bg-stone-950/90 backdrop-blur-md border border-lime-400/40 text-left space-y-1 shadow-2xl pointer-events-none">
              <p className="text-xs font-mono text-lime-400 font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" /> PUMP-101A Topo Node Selected
              </p>
              <p className="text-xs text-stone-300 font-mono">Dependencies: VALVE-102, MCC-P101, OISD-GDN-115</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="pt-10 flex justify-center">
          <a href="#why" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-stone-900 font-extrabold hover:opacity-80 transition-opacity animate-bounce">
            Scroll down <ArrowDownRight size={14} />
          </a>
        </div>
      </section>

      {/* 3. Scrolling Compliance & Tech Marquee */}
      <section className="py-6 border-y border-stone-300 bg-stone-300/40 overflow-hidden">
        <div className="flex gap-14 whitespace-nowrap animate-marquee font-mono text-xs text-stone-900 font-extrabold tracking-[0.2em] uppercase">
          <span>OISD-GDN-115 SAFETY COMPLIANT</span>
          <span>•</span>
          <span>768-DIM GEMINI VECTOR GROUNDED</span>
          <span>•</span>
          <span>EXACT COMPONENT PART MATCHING</span>
          <span>•</span>
          <span>2D D3 FORCE GRAPH NETWORK</span>
          <span>•</span>
          <span>MULTI-TENANT COMPANY JWT ISOLATION</span>
          <span>•</span>
          <span>ISO 27001 REFINERY READY</span>
          <span>•</span>
          <span>OISD-GDN-115 SAFETY COMPLIANT</span>
          <span>•</span>
          <span>768-DIM GEMINI VECTOR GROUNDED</span>
          <span>•</span>
          <span>EXACT COMPONENT PART MATCHING</span>
        </div>
      </section>

      {/* 4. "Why VigilOps" Factual Telemetry Stats Section */}
      <section id="why" className="py-32 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-lime-600 font-bold">Empirical Performance Audit</span>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-stone-950 tracking-tight">
            Why Leading Refineries Trust VigilOps
          </h2>
          <p className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto font-light leading-relaxed">
            Evaluated live across 8 challenging industrial test cases. Zero hallucinated pressure thresholds or ungrounded part codes.
          </p>
        </div>

        {/* Visual Identity Studio 4-Card Big Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -6 }}
            className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-4 shadow-xl text-center"
          >
            <h3 className="text-5xl sm:text-6xl font-black font-display text-stone-950">87.5%</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-900 font-bold">Hit Rate @ Top 3</p>
            <p className="text-xs text-stone-700 font-light leading-relaxed">
              7 out of 8 complex industrial queries returned exact ground-truth manual citations within top 3 ranks.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-4 shadow-xl text-center"
          >
            <h3 className="text-5xl sm:text-6xl font-black font-display text-stone-950">0.842</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-900 font-bold">Mean Reciprocal Rank</p>
            <p className="text-xs text-stone-700 font-light leading-relaxed">
              High MRR score ensuring operators receive primary manual answers at Rank 1 or Rank 2 without scrolling.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-4 shadow-xl text-center"
          >
            <h3 className="text-5xl sm:text-6xl font-black font-display text-stone-950">89.1%</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-900 font-bold">Node Entity Recall</p>
            <p className="text-xs text-stone-700 font-light leading-relaxed">
              223 out of 250 equipment component nodes accurately extracted and mapped into the D3 topological matrix.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-4 shadow-xl text-center"
          >
            <h3 className="text-5xl sm:text-6xl font-black font-display text-stone-950">86.8%</h3>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-900 font-bold">Edge Precision</p>
            <p className="text-xs text-stone-700 font-light leading-relaxed">
              291 out of 335 inter-asset isolation and dependency edges verified against ground-truth refinery SOPs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5. Original Problem Statement Section */}
      <section id="problem" className="py-32 px-6 border-t border-stone-300 bg-[#dfdfdc]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-red-600 font-bold">The Heavy Industry Pain Point</span>
            <h2 className="text-4xl sm:text-6xl font-black font-display text-stone-950 tracking-tight">
              Why Industrial Operations Lose Billions
            </h2>
            <p className="text-sm sm:text-base text-stone-700 max-w-2xl mx-auto font-light leading-relaxed">
              When a critical pump trips or a gas leak warning occurs, operators cannot afford to waste 4 hours searching unindexed 500-page PDF documents.
            </p>
          </div>

          {/* Downtime Stat Banner */}
          <div className="p-10 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-2 max-w-3xl mx-auto shadow-xl">
            <p className="text-5xl sm:text-7xl font-black font-display text-red-600 tracking-tight">₹50,000,000+ / Hour</p>
            <p className="text-xs font-mono uppercase tracking-widest text-stone-900 font-bold">
              Average Cost of Unplanned Downtime in Continuous Refineries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-5 shadow-xl">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 w-fit">
                <FileText size={26} />
              </div>
              <h3 className="font-bold text-xl font-display text-stone-950">1. Unstructured PDF Silos</h3>
              <p className="text-xs text-stone-700 leading-relaxed font-light">
                OEM pump manuals, LOTO isolation SOPs, and OISD safety standards remain buried in static, un-indexed 300-page PDF files.
              </p>
            </div>

            <div className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-5 shadow-xl">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 w-fit">
                <GitFork size={26} />
              </div>
              <h3 className="font-bold text-xl font-display text-stone-950">2. Hidden Dependencies</h3>
              <p className="text-xs text-stone-700 leading-relaxed font-light">
                Engineers cannot visualize how isolating VALVE-102 impacts motor drivers, pressure gauges, and double block valves.
              </p>
            </div>

            <div className="p-9 rounded-3xl bg-[#f0f0ed] border border-stone-300 space-y-5 shadow-xl">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 w-fit">
                <MessageSquare size={26} />
              </div>
              <h3 className="font-bold text-xl font-display text-stone-950">3. LLM Hallucinations</h3>
              <p className="text-xs text-stone-700 leading-relaxed font-light">
                General chat LLMs make up torque limits and gas safety pressures. High-risk plants require 100% strict evidence citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Solution & Architecture Accordion */}
      <section id="services" className="py-32 px-6 max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-lime-600 font-bold">Architecture Overview</span>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-stone-950 tracking-tight">
            VigilOps Engine Components
          </h2>
          <p className="text-sm text-stone-700 max-w-2xl mx-auto font-light leading-relaxed">
            Click each component below to inspect architectural details, included capabilities, and performance guarantees.
          </p>
        </div>

        {/* Visual Identity Studio Style Nested Accordion */}
        <div className="space-y-5">
          {/* Accordion Item 1 */}
          <div className="rounded-3xl border border-stone-300 bg-[#f0f0ed] overflow-hidden shadow-xl">
            <button
              onClick={() => toggleAccordion(0)}
              className="w-full p-8 text-left flex items-center justify-between gap-4 focus:outline-none"
            >
              <div className="flex items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-lime-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-stone-950">
                    1. Grounded Citation Snippet Inspector
                  </h3>
                  <p className="text-xs text-stone-600 font-mono mt-1">Zero-Hallucination Evidence Matching</p>
                </div>
              </div>
              <div className="p-2.5 rounded-full bg-stone-300 text-stone-900">
                {openAccordion === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {openAccordion === 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 space-y-6 border-t border-stone-300 pt-6"
                >
                  <p className="text-sm text-stone-700 font-light leading-relaxed">
                    DocPilot never generates answers without proof. Every response includes clickable citation chips that immediately expand to show the exact raw text snippet retrieved from SQLite manual archives.
                  </p>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-950 font-bold mb-3">Capabilities Included:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        SQLite Raw Context Lookup
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        768-Dim Gemini Vector Embedding
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        1-Click Document Modal Inspector
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Strict Out-of-Domain Guardrail Fallback
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item 2 */}
          <div className="rounded-3xl border border-stone-300 bg-[#f0f0ed] overflow-hidden shadow-xl">
            <button
              onClick={() => toggleAccordion(1)}
              className="w-full p-8 text-left flex items-center justify-between gap-4 focus:outline-none"
            >
              <div className="flex items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-lime-400">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-stone-950">
                    2. D3 Topological Operations Matrix
                  </h3>
                  <p className="text-xs text-stone-600 font-mono mt-1">2D Force-Directed Inter-Equipment Network</p>
                </div>
              </div>
              <div className="p-2.5 rounded-full bg-stone-300 text-stone-900">
                {openAccordion === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {openAccordion === 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 space-y-6 border-t border-stone-300 pt-6"
                >
                  <p className="text-sm text-stone-700 font-light leading-relaxed">
                    Interactive D3 physics simulation displaying equipment nodes (Assets, Procedures, Regulations, Incidents, Manuals) connected by directional dependency edges. Selecting nodes in DocPilot chat automatically triggers glowing pulse highlights on the matrix!
                  </p>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-950 font-bold mb-3">Capabilities Included:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        250 Component Nodes
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        335 Verified Edges
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Category Filtering Toolbar
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Real-Time Node Search
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion Item 3 */}
          <div className="rounded-3xl border border-stone-300 bg-[#f0f0ed] overflow-hidden shadow-xl">
            <button
              onClick={() => toggleAccordion(2)}
              className="w-full p-8 text-left flex items-center justify-between gap-4 focus:outline-none"
            >
              <div className="flex items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-slate-900 text-lime-400">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-stone-950">
                    3. Multi-Tenant JWT Security & Revocation
                  </h3>
                  <p className="text-xs text-stone-600 font-mono mt-1">Enterprise Workspace Data Isolation</p>
                </div>
              </div>
              <div className="p-2.5 rounded-full bg-stone-300 text-stone-900">
                {openAccordion === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {openAccordion === 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8 space-y-6 border-t border-stone-300 pt-6"
                >
                  <p className="text-sm text-stone-700 font-light leading-relaxed">
                    Company data isolation enforced at the database query level via JWT bearer tokens. Plant admins can generate isolated employee credentials, upload new manuals, and instantly revoke credentials with 1-click access termination.
                  </p>

                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-950 font-bold mb-3">Capabilities Included:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Company Workspace Isolation
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Admin Credential Generator
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        1-Click Credential Revocation
                      </span>
                      <span className="px-4 py-2 rounded-full bg-stone-200 text-stone-900 text-xs font-mono font-bold border border-stone-300">
                        Drag-and-Drop Manual Ingestion
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 7. Trust Metrics & Live Audit Telemetry */}
      <div id="trust">
        <TrustMetricsSection />
      </div>

      {/* 8. Pricing Tier Cards */}
      <section id="pricing" className="py-32 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-lime-600 font-bold">Transparent Tiered Pricing</span>
          <h2 className="text-4xl sm:text-6xl font-black font-display text-stone-950 tracking-tight">Scale From Single Units To Enterprise</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-9 rounded-3xl border border-stone-300 bg-[#f0f0ed] flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-xl font-bold font-display text-stone-950">Starter Plan</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black font-display flex items-center text-stone-950"><IndianRupee size={26} />500</span>
                <span className="text-xs font-mono text-stone-500">/ month</span>
              </div>
              <p className="text-xs text-stone-700 mb-6 font-light">Ideal for small equipment units.</p>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> 10 Technical manual uploads
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> 5 Employee accounts
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> D3 Topological Graph
                </li>
              </ul>
            </div>
            <button onClick={() => onSelectPricingPlan('starter')} className="w-full py-4 rounded-full border-2 border-stone-900 font-mono text-xs uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all text-center text-stone-900 active:scale-95 font-black">
              Select Starter
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-9 rounded-3xl border-2 border-stone-950 bg-white flex flex-col justify-between shadow-2xl relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-950 text-lime-400 text-[10px] font-mono font-black uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg">
              Most Popular
            </span>
            <div>
              <h3 className="text-xl font-bold font-display text-stone-950">Professional Plan</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black font-display flex items-center text-stone-950"><IndianRupee size={26} />2,000</span>
                <span className="text-xs font-mono text-stone-500">/ month</span>
              </div>
              <p className="text-xs text-stone-700 mb-6 font-light">Designed for manufacturing units & plants.</p>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> Unlimited manual uploads
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> 50 Employee accounts
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> Custom relationship editor
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> Citation Snippet Inspector
                </li>
              </ul>
            </div>
            <button onClick={() => onSelectPricingPlan('pro')} className="w-full py-4 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 font-mono text-xs uppercase tracking-wider font-black transition-all text-center active:scale-95 shadow-xl">
              Select Professional
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-9 rounded-3xl border border-stone-300 bg-[#f0f0ed] flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-xl font-bold font-display text-stone-950">Enterprise</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-black font-display text-stone-950">Custom</span>
              </div>
              <p className="text-sm text-stone-700 mb-6 font-light">For multi-location conglomerates.</p>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> Private cloud / on-premise hosting
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> Unlimited user accounts
                </li>
                <li className="flex items-center gap-2.5 text-xs font-mono text-stone-800">
                  <Check size={16} className="text-lime-600" /> White-labeled console
                </li>
              </ul>
            </div>
            <button onClick={() => onSelectPricingPlan('enterprise')} className="w-full py-4 rounded-full border-2 border-stone-900 font-mono text-xs uppercase tracking-wider hover:bg-stone-900 hover:text-white transition-all text-center text-stone-900 active:scale-95 font-black">
              Contact Solutions
            </button>
          </div>
        </div>
      </section>

      {/* 9. Minimalist Footer */}
      <footer className="py-12 border-t border-stone-300 bg-stone-300/40 text-center">
        <p className="text-xs text-stone-600 font-mono">
          © {new Date().getFullYear()} VigilOps AI. Built for secure industrial operations. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
