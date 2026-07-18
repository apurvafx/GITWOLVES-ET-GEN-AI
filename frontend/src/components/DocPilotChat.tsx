import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Send, Bot, User, Bookmark, AlertTriangle } from 'lucide-react';

interface Message {
  sender: 'user' | 'pilot';
  text: string;
  citations?: string[];
  activeNodes?: string[];
  retrievedChunks?: { filename: string; content: string }[];
}

interface DocPilotChatProps {
  onNodeFocus: (nodeId: string) => void;
}

export const DocPilotChat: React.FC<DocPilotChatProps> = ({ onNodeFocus }) => {
  const [query, setQuery] = useState('');
  const [viewingCitation, setViewingCitation] = useState<{ filename: string; content: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'pilot',
      text: "Hello! I am DocPilot, your technical operations assistant. Ask me questions about company manuals, safety compliance, or incident logs.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQuery = query;
    setQuery('');
    setError(null);
    setMessages((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const response = await api.post('/api/copilot/chat', { query: userQuery });
      const { answer, citations, active_nodes, retrieved_chunks } = response.data;
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'pilot',
          text: answer,
          citations: citations || [],
          activeNodes: active_nodes || [],
          retrievedChunks: retrieved_chunks || [],
        },
      ]);
    } catch (err: any) {
      setError('Failed to reach DocPilot. The API server might be sleeping.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse double asterisks for bold rendering in UI
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-day-text dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border rounded-2xl overflow-hidden shadow-sm">
      {/* 1. Panel Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-day-border dark:border-night-border bg-slate-50 dark:bg-slate-900/10">
        <Bot className="text-blue-600 animate-pulse" size={20} />
        <div>
          <h2 className="font-bold text-sm">DocPilot Assistant</h2>
          <p className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">System Online</p>
        </div>
      </div>

      {/* 2. Messages Box */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                msg.sender === 'user' ? 'bg-teal-600' : 'bg-blue-600'
              }`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-blue-50/50 dark:bg-blue-950/15 border-blue-100 dark:border-blue-950/20 text-day-text dark:text-slate-200'
                  : 'bg-slate-50/50 dark:bg-slate-900/20 border-day-border dark:border-night-border text-day-textMuted dark:text-night-textMuted'
              }`}
            >
              {/* Message text */}
              <div className="whitespace-pre-wrap">{renderMessageText(msg.text)}</div>

              {/* Active Graph Nodes tags */}
              {msg.activeNodes && msg.activeNodes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-day-border dark:border-night-border pt-2">
                  <span className="text-[10px] uppercase font-bold text-day-textMuted dark:text-night-textMuted flex items-center gap-1">
                    🔍 Mentioned:
                  </span>
                  {msg.activeNodes.map((node) => (
                    <button
                      key={node}
                      onClick={() => onNodeFocus(node)}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all"
                    >
                      {node}
                    </button>
                  ))}
                </div>
              )}

              {/* Citations list */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <Bookmark size={10} className="text-amber-500" />
                  <span className="text-[10px] text-amber-600 font-semibold">Citations:</span>
                  {msg.citations.map((cite, cIdx) => {
                    const chunk = msg.retrievedChunks?.find(c => c.filename === cite);
                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          if (chunk) {
                            setViewingCitation({ filename: cite, content: chunk.content });
                          } else {
                            setViewingCitation({ filename: cite, content: "No text snippet cached for this message." });
                          }
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-200 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 transition-all cursor-pointer animate-fade-in"
                      >
                        {cite}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-day-border dark:border-night-border text-xs italic text-day-textMuted dark:text-night-textMuted">
              DocPilot is retrieving context and generating answer...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900/30 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-day-border dark:border-night-border bg-slate-50 dark:bg-slate-900/10 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask DocPilot anything about manuals or safety..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg border border-day-border dark:border-night-border bg-transparent text-sm text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>

      {/* 4. Citation Reference Viewer Modal */}
      {viewingCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-day-surface dark:bg-night-surface border border-day-border dark:border-night-border rounded-2xl w-full max-w-lg p-6 relative max-h-[80vh] flex flex-col shadow-xl animate-zoom-in">
            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
              <Bookmark className="text-amber-500" size={18} />
              Retrieved Reference: <span className="text-blue-600 font-mono">{viewingCitation.filename}</span>
            </h3>
            <p className="text-xs text-day-textMuted dark:text-night-textMuted mb-4">
              Below is the exact raw context snippet retrieved from this manual that was analyzed to answer your query:
            </p>
            <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-slate-50 dark:bg-slate-900/35 border border-day-border dark:border-night-border font-mono text-xs whitespace-pre-wrap text-day-text dark:text-slate-300 leading-relaxed">
              {viewingCitation.content}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setViewingCitation(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
