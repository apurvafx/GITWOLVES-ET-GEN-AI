import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Send, Bot, User, Bookmark, AlertTriangle, Sparkles, Activity } from 'lucide-react';

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

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-stone-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-[#f0f0ed] border border-stone-300 rounded-3xl shadow-xl">
      {/* 1. Panel Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-stone-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 text-lime-400">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-bold text-xs font-display text-stone-950">DocPilot Assistant</h2>
            <p className="text-[9px] font-mono text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> System Online
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-stone-500">768-Dim RAG Grounded</span>
      </div>

      {/* 2. Messages Box */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[88%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-stone-900 text-lime-400 font-mono' 
                  : 'bg-slate-950 text-lime-400'
              }`}
            >
              {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Message Bubble */}
            <div
              className={`p-4 rounded-3xl text-xs leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-stone-300 border-stone-400 text-stone-950'
                  : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{renderMessageText(msg.text)}</div>

              {/* Active Graph Nodes tags */}
              {msg.activeNodes && msg.activeNodes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stone-200 pt-2.5">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    Mentioned:
                  </span>
                  {msg.activeNodes.map((node) => (
                    <button
                      key={node}
                      onClick={() => onNodeFocus(node)}
                      className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-300 text-stone-950 border border-stone-400 hover:opacity-80 transition-all cursor-pointer"
                    >
                      {node}
                    </button>
                  ))}
                </div>
              )}

              {/* Citations list */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                  <Bookmark size={12} className="text-stone-950" />
                  <span className="text-[10px] font-mono text-stone-900 font-bold uppercase tracking-wider">Citations:</span>
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
                        className="px-3 py-1 rounded-full text-[10px] font-mono bg-stone-300 text-stone-950 font-bold border border-stone-400 hover:opacity-80 transition-all cursor-pointer"
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
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-lime-400 flex-shrink-0">
              <Bot size={14} className="animate-spin" />
            </div>
            <div className="p-4 rounded-3xl bg-white border border-stone-300 text-xs italic text-stone-500">
              DocPilot is retrieving context & generating grounded answer...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 text-xs border border-red-500/30 flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Input Form */}
      <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-stone-300 bg-[#f0f0ed] flex gap-2.5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask DocPilot anything about manuals, safety limits, or SOPs..."
          disabled={loading}
          className="flex-1 px-5 py-3 rounded-full border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-lime-400/50 font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-lime-400 text-xs font-mono font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
        >
          <Send size={14} />
        </button>
      </form>

      {/* 4. Citation Reference Viewer Modal */}
      {viewingCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#f0f0ed] border border-stone-300 rounded-3xl w-full max-w-lg p-7 relative max-h-[80vh] flex flex-col shadow-2xl">
            <h3 className="text-base font-bold font-display mb-2 flex items-center gap-2 text-stone-950">
              <Bookmark className="text-stone-950" size={18} />
              Retrieved Reference: <span className="text-stone-950 font-mono">{viewingCitation.filename}</span>
            </h3>
            <p className="text-xs text-stone-500 font-light mb-4">
              Raw context snippet retrieved from manual archives:
            </p>
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white border border-stone-300 font-mono text-xs whitespace-pre-wrap text-stone-800 leading-relaxed">
              {viewingCitation.content}
            </div>
            <div className="mt-4 text-right">
              <button
                type="button"
                onClick={() => setViewingCitation(null)}
                className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider rounded-full bg-slate-950 text-lime-400 shadow-lg active:scale-95 transition-all"
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
