import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { Send, Bot, User, Bookmark, AlertTriangle, Sparkles, Activity, Mic, MicOff, Volume2, VolumeX, Download, FileText } from 'lucide-react';

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
  
  // Voice Controls
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Web Speech API Voice Dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setQuery('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-Speech Audio Readout
  const handleSpeakText = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio is not supported in this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Step 4: 1-Click Shift Handover Report Exporter
  const handleExportShiftReport = () => {
    if (messages.length <= 1) {
      alert("No operational troubleshooting logs to export for this shift yet. Ask DocPilot a query first!");
      return;
    }

    const timestamp = new Date().toLocaleString();
    let report = `=================================================================\n`;
    report += `       VIGILOPS REFINERY - SHIFT HANDOVER AUDIT REPORT           \n`;
    report += `=================================================================\n`;
    report += ` Generated Date: ${timestamp}\n`;
    report += ` Security Level: CONFIDENTIAL OPERATIONAL AUDIT LOG\n`;
    report += ` System Mode:    768-DIM RAG GROUNDED KNOWLEDGE GRAPH\n`;
    report += `=================================================================\n\n`;

    report += `1. SHIFT OPERATIONAL TROUBLESHOOTING LOG:\n`;
    report += `-----------------------------------------------------------------\n`;

    messages.forEach((msg, i) => {
      if (msg.sender === 'user') {
        report += `\n[OPERATOR QUERY #${Math.ceil(i / 2)}]\n${msg.text}\n`;
      } else if (i > 0) {
        report += `\n[DOCPILOT GUIDELINE RESPONSE]\n${msg.text.replace(/\*\*/g, '')}\n`;
        if (msg.activeNodes && msg.activeNodes.length > 0) {
          report += `Affected Equipment Nodes: ${msg.activeNodes.join(', ')}\n`;
        }
        if (msg.citations && msg.citations.length > 0) {
          report += `Grounded Manual Citations: ${msg.citations.join(', ')}\n`;
        }
      }
    });

    report += `\n\n=================================================================\n`;
    report += ` END OF REPORT - OFFICIAL VIGILOPS SHIFT HANDOVER DOCUMENT\n`;
    report += `=================================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VigilOps_Shift_Handover_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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

        {/* Step 4: Export Shift Handover Report Button */}
        <button
          type="button"
          onClick={handleExportShiftReport}
          className="px-3.5 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-slate-950 text-lime-400 hover:bg-slate-800 transition-all flex items-center gap-1.5 active:scale-95 shadow-md cursor-pointer"
          title="Export Shift Handover Audit Report"
        >
          <Download size={12} /> Export Shift Report
        </button>
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
              className={`p-4 rounded-3xl text-xs leading-relaxed border relative group ${
                msg.sender === 'user'
                  ? 'bg-stone-300 border-stone-400 text-stone-950'
                  : 'bg-white border-stone-300 text-stone-800'
              }`}
            >
              {/* Spoken Text-to-Speech Audio Readout Button */}
              {msg.sender === 'pilot' && (
                <button
                  type="button"
                  onClick={() => handleSpeakText(msg.text, index)}
                  className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                    speakingIndex === index 
                      ? 'bg-lime-400 text-slate-950 animate-pulse' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                  title={speakingIndex === index ? "Stop Spoken Audio" : "Listen to Spoken Instructions"}
                >
                  {speakingIndex === index ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
              )}

              <div className="whitespace-pre-wrap pr-6">{renderMessageText(msg.text)}</div>

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

      {/* 3. Input Form with Microphone Dictation */}
      <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-stone-300 bg-[#f0f0ed] flex gap-2">
        <button
          type="button"
          onClick={toggleVoiceDictation}
          className={`p-3 rounded-full transition-all flex items-center justify-center shadow-md ${
            isListening
              ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-400/50'
              : 'bg-stone-300 hover:bg-stone-400 text-stone-950 border border-stone-400'
          }`}
          title={isListening ? "Stop Voice Dictation" : "Hands-Free Voice Input (Microphone)"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Listening... Speak your query now..." : "Ask DocPilot or click microphone for voice command..."}
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
