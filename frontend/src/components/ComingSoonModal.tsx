import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Send, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface ComingSoonModalProps {
  planTier: string;
  onClose: () => void;
  onLaunchDemo: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ planTier, onClose, onLaunchDemo }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const getPlanName = () => {
    switch (planTier) {
      case 'starter':
        return 'Starter Tier (₹500/mo)';
      case 'enterprise':
        return 'Enterprise Custom Tier';
      case 'pro':
      default:
        return 'Professional Tier (₹2,000/mo)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg rounded-3xl border border-stone-300 bg-[#f0f0ed] backdrop-blur-2xl p-9 shadow-2xl space-y-6 text-center font-sans overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 transition-colors"
          aria-label="Close Modal"
        >
          <X size={16} />
        </button>

        {/* Top Icon Pill */}
        <div className="inline-flex p-4 rounded-3xl bg-slate-950 text-lime-400">
          <Sparkles size={28} />
        </div>

        <div className="space-y-2">
          <span className="px-4 py-1.5 rounded-full bg-stone-300 text-stone-950 text-[10px] font-mono font-bold uppercase tracking-widest border border-stone-400">
            LAUNCHING Q3 2026
          </span>
          <h2 className="text-3xl font-black font-display text-stone-950">
            {getPlanName()}
          </h2>
          <p className="text-xs text-stone-600 max-w-sm mx-auto font-light leading-relaxed">
            Public commercial self-serve signup is opening soon. Join our early refinery partner waitlist or launch the instant demo refinery console today!
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 space-y-2 font-mono text-xs">
            <CheckCircle2 size={24} className="mx-auto" />
            <p className="font-bold">You are on the VIP Partner Waitlist!</p>
            <p className="text-[10px] text-stone-500 font-sans">We will notify {email} prior to public launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter corporate email (e.g. name@refinery.com)..."
                className="flex-1 px-5 py-3.5 rounded-full border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-full bg-slate-950 text-lime-400 font-mono text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
              >
                Join <Send size={12} />
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-stone-300 space-y-3">
          <p className="text-[11px] text-stone-500 font-mono">Want to evaluate VigilOps immediately without waiting?</p>
          <button
            onClick={onLaunchDemo}
            className="w-full py-4 rounded-full border-2 border-stone-900 bg-transparent hover:bg-stone-900 hover:text-white text-stone-900 font-mono text-xs uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <Zap size={14} className="text-stone-900" /> Launch Instant Demo Refinery <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
