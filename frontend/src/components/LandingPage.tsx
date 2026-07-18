import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Shield, GitFork, MessageSquare, IndianRupee, ArrowRight, Check } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onDemoClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onDemoClick }) => {
  const { theme, toggleTheme } = useAuth();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-day-bg dark:bg-night-bg text-day-text dark:text-night-text">
      {/* 1. Header/Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-day-border dark:border-night-border bg-day-bg/80 dark:bg-night-bg/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white font-black text-xl tracking-wider">
              V
            </div>
            <span className="font-bold text-lg tracking-tight">VigilOps</span>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-day-textMuted dark:text-night-textMuted">
              <a href="#problem" className="hover:text-day-text dark:hover:text-night-text">Problem</a>
              <a href="#solution" className="hover:text-day-text dark:hover:text-night-text">Solution</a>
              <a href="#pricing" className="hover:text-day-text dark:hover:text-night-text">Pricing</a>
            </nav>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-day-textMuted dark:text-night-textMuted"
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-medium border border-day-border dark:border-night-border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Client Login
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/20 mb-6">
          <Shield size={14} /> Industrial Operations AI
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-day-text dark:text-night-text">
          Mission Control for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
            Autonomous Industrial Ops
          </span>
        </h1>
        <p className="text-lg md:text-xl text-day-textMuted dark:text-night-textMuted max-w-2xl mx-auto leading-relaxed mb-10">
          Synthesize complex plant data into actionable intelligence. VigilOps provides a unified
          topological knowledge graph for heavy industry, ensuring safety, compliance, and uptime at scale.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={onDemoClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-cobalt-teal text-white font-medium hover:opacity-90 shadow-md transition-all flex items-center justify-center gap-2"
          >
            Try Demo Account <ArrowRight size={18} />
          </button>
          <a
            href="#problem"
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-day-border dark:border-night-border font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problem" className="py-20 px-6 max-w-6xl mx-auto border-t border-day-border dark:border-night-border">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-red-500 font-bold uppercase text-sm tracking-wider mb-2">The Industrial Cost</div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-day-text dark:text-night-text">
              Why Industrial Operations Fail
            </h2>
            <p className="text-day-textMuted dark:text-night-textMuted leading-relaxed mb-6">
              Industrial plants lose over **₹50 Lakhs per hour** during unplanned downtime. When a critical pump fails or a safety incident occurs, engineers and operators waste hours digging through 500-page PDF manuals and outdated paper checklists. 
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-red-100 dark:bg-red-950/20 text-red-600 mt-1">✗</span>
                <span className="text-sm font-medium text-day-text dark:text-night-text">Lost manuals delay emergency lockout-tagout (LOTO) protocols.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="p-1 rounded bg-red-100 dark:bg-red-950/20 text-red-600 mt-1">✗</span>
                <span className="text-sm font-medium text-day-text dark:text-night-text">Audit compliance checks take days instead of seconds.</span>
              </div>
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-day-border dark:border-night-border text-center">
            <h3 className="text-5xl font-black text-red-500 tracking-tight mb-2">₹50L+</h3>
            <p className="text-sm uppercase tracking-wider text-day-textMuted dark:text-night-textMuted font-bold">
              Avg. Downtime Cost Per Hour
            </p>
          </div>
        </div>
      </section>

      {/* 4. Solution Section */}
      <section id="solution" className="py-20 px-6 max-w-6xl mx-auto border-t border-day-border dark:border-night-border">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 p-8 rounded-2xl bg-blue-50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/20 flex flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/30 text-blue-600">
                <GitFork size={24} />
              </div>
              <div>
                <h4 className="font-bold text-day-text dark:text-night-text">Topological Graph Mapping</h4>
                <p className="text-xs text-day-textMuted dark:text-night-textMuted">Converts PDF guidelines into equipment relationships.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950/30 text-teal-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-bold text-day-text dark:text-night-text">Grounded DocPilot Chat</h4>
                <p className="text-xs text-day-textMuted dark:text-night-textMuted">Generates answers with precise line-level page citations.</p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="text-teal-600 dark:text-teal-400 font-bold uppercase text-sm tracking-wider mb-2">The Solution</div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-day-text dark:text-night-text">
              Topological AI Operations
            </h2>
            <p className="text-day-textMuted dark:text-night-textMuted leading-relaxed mb-6">
              VigilOps automatically ingests scattered manuals, checks isolation safety procedures, and extracts a live Knowledge Graph of your assets. Employees query **DocPilot** to find solutions, which highlights critical circuits on the graph map in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto border-t border-day-border dark:border-night-border text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-day-text dark:text-night-text">
          Sufficiently Reasonable Pricing
        </h2>
        <p className="text-day-textMuted dark:text-night-textMuted mb-12 max-w-md mx-auto">
          Scale your operation with direct, per-plant subscription rates. Simple billing, zero hidden fees.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">Starter Plan</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-black flex items-center"><IndianRupee size={24} />500</span>
                <span className="text-sm text-day-textMuted dark:text-night-textMuted">/ month</span>
              </div>
              <p className="text-sm text-day-textMuted dark:text-night-textMuted mb-6">Perfect for small workshops or team tests.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Max 5 manuals
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> 5 Employee accounts
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Standard topological search
                </li>
              </ul>
            </div>
            <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg border border-day-border dark:border-night-border font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-center text-sm">
              Get Started
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border-2 border-blue-600 bg-day-surface dark:bg-night-surface flex flex-col justify-between shadow-lg relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="text-lg font-bold">Professional Plan</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-black flex items-center"><IndianRupee size={24} />2,000</span>
                <span className="text-sm text-day-textMuted dark:text-night-textMuted">/ month</span>
              </div>
              <p className="text-sm text-day-textMuted dark:text-night-textMuted mb-6">Designed for manufacturing units & plants.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Unlimited manual uploads
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> 50 Employee accounts
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Custom relationship editor
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> SCADA telemetry integration
                </li>
              </ul>
            </div>
            <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg bg-cobalt-teal text-white font-medium hover:opacity-90 transition-all text-center text-sm">
              Upgrade Now
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">Enterprise</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-3xl font-black">Custom</span>
              </div>
              <p className="text-sm text-day-textMuted dark:text-night-textMuted mb-6">For multi-location conglomerates.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Private cloud / on-premise hosting
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> Unlimited user accounts
                </li>
                <li className="flex items-center gap-2 text-sm text-day-textMuted dark:text-night-textMuted">
                  <Check size={16} className="text-emerald-500" /> White-labeled console
                </li>
              </ul>
            </div>
            <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg border border-day-border dark:border-night-border font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-center text-sm">
              Contact Solutions
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 border-t border-day-border dark:border-night-border bg-slate-50 dark:bg-slate-950/20 text-center">
        <p className="text-sm text-day-textMuted dark:text-night-textMuted">
          © {new Date().getFullYear()} VigilOps AI. All rights reserved. Built for secure industrial operations.
        </p>
      </footer>
    </div>
  );
};
