import { useState, useRef, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Send, Bot, User, Sparkles, TrendingUp, BookOpen, Wallet, Zap, Brain, Loader2,
  Mic, MicOff, Copy, Share2, Download, ThumbsUp, ThumbsDown, RefreshCw,
  CheckCircle, BarChart3, Globe, MessageSquare, Trash2, Settings
} from "lucide-react";

// ── Simple markdown renderer (no extra deps) ──────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-3 mb-1" style="color:var(--lime-primary)">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-4 mb-2" style="color:var(--lime-primary)">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-2 mb-3" style="color:var(--lime-primary)">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded text-xs font-mono" style="background:rgba(255,255,255,0.1);color:var(--lime-primary)">$1</code>')
    // Code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="p-3 rounded-lg my-2 text-xs font-mono overflow-x-auto" style="background:rgba(0,0,0,0.3);color:#a8ff78">$1</pre>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border-color:var(--navy-highlight);margin:12px 0"/>')
    // Checkmark / X bullets
    .replace(/^✅ (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span style="color:#4ade80">✅</span><span>$1</span></div>')
    .replace(/^❌ (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span style="color:#f87171">❌</span><span>$1</span></div>')
    .replace(/^⚠️ (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span>⚠️</span><span>$1</span></div>')
    .replace(/^💡 (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span>💡</span><span>$1</span></div>')
    .replace(/^📌 (.+)$/gm, '<div class="flex gap-2 items-start my-0.5"><span>📌</span><span>$1</span></div>')
    // Unordered list items
    .replace(/^[-•] (.+)$/gm, '<li class="ml-4 my-0.5 list-disc">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 my-0.5 list-decimal">$1</li>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic" style="color:var(--grey-dim)">$1</em>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div
      className="text-sm leading-relaxed"
      style={{ color: "white" }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}

// ── Suggestion checkboxes ─────────────────────────────────────────────────────
interface Suggestion {
  question: string;
  label: string;
  category: string;
}

function SuggestionList({ suggestions, onSelect }: { suggestions: Suggestion[]; onSelect: (q: string) => void }) {
  const [checked, setChecked] = useState<string | null>(null);

  const handleCheck = (question: string) => {
    setChecked(question);
    // auto-send after tiny delay so user sees the check
    setTimeout(() => onSelect(question), 300);
  };

  // Group by category
  const grouped: Record<string, Suggestion[]> = {};
  for (const s of suggestions) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }

  return (
    <div className="mt-3 space-y-3">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--lime-primary)" }}>
            {cat}
          </p>
          <div className="space-y-1.5">
            {items.map((s) => (
              <label
                key={s.question}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:opacity-90"
                style={{
                  background: checked === s.question ? "rgba(163,230,53,0.15)" : "var(--navy-base)",
                  border: `1px solid ${checked === s.question ? "var(--lime-primary)" : "var(--navy-highlight)"}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked === s.question}
                  onChange={() => handleCheck(s.question)}
                  className="w-3.5 h-3.5 rounded accent-lime-400 cursor-pointer"
                />
                <span className="text-xs text-white">{s.question}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Quick prompts / actions ───────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Analyze BTC", query: "Analyze Bitcoin price" },
  { icon: Brain, label: "Explain RSI", query: "What is RSI?" },
  { icon: Wallet, label: "Risk Tips", query: "How to manage trading risk?" },
  { icon: Zap, label: "What is Bitcoin?", query: "What is Bitcoin?" },
  { icon: BookOpen, label: "Learn MACD", query: "Explain MACD indicator" },
];

const QUICK_ACTIONS = [
  { icon: BarChart3, label: "View Chart", query: "Show me BTC price chart and technical analysis" },
  { icon: TrendingUp, label: "Live Analysis", query: "Give me live market analysis for BTC with current price and indicators" },
  { icon: Globe, label: "News", query: "What are the latest crypto market news and trends?" },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  metadata?: any;
  timestamp?: string;
  liked?: boolean;
  disliked?: boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Chat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const { data: aiResponseData } = trpc.chat.quickAnalyze.useQuery(
    { query: pendingQuery ?? "" },
    { enabled: !!pendingQuery }
  );

  useEffect(() => {
    if (aiResponseData && pendingQuery) {
      setChatHistory((prev) => [...prev, {
        role: "assistant",
        content: aiResponseData.content,
        metadata: aiResponseData.metadata,
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
      setPendingQuery(null);
    }
  }, [aiResponseData, pendingQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e: any) => { setMessage(e.results[0][0].transcript); setIsListening(false); };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const q = message.trim();
    setChatHistory(p => [...p, { role: "user", content: q, timestamp: new Date().toISOString() }]);
    setMessage("");
    setIsTyping(true);
    setPendingQuery(q);
  };

  const handlePrompt = (query: string) => {
    setChatHistory(p => [...p, { role: "user", content: query, timestamp: new Date().toISOString() }]);
    setIsTyping(true);
    setPendingQuery(query);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) { alert("Voice input not supported"); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportChat = () => {
    const text = chatHistory.map(m => `[${m.role.toUpperCase()}] ${m.content}\n`).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `trademind-chat-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  const clearChat = () => { if (confirm("Clear entire chat history?")) setChatHistory([]); };

  const reactToMessage = (idx: number, r: "like" | "dislike") => {
    setChatHistory(p => p.map((m, i) => i !== idx ? m : {
      ...m,
      liked: r === "like" ? !m.liked : false,
      disliked: r === "dislike" ? !m.disliked : false
    }));
  };

  const fmt = (ts?: string) => ts ? new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: "1px solid var(--navy-highlight)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--lime-primary)" }}>
              <Bot className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">TradeMind AI Assistant</h1>
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--lime-primary)" }}>
                <Sparkles className="w-3 h-3" /> Smart NLP · Markdown · Suggestions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {chatHistory.length > 0 && (
              <>
                <button onClick={exportChat} className="p-2 rounded-lg" style={{ color: "var(--grey-dim)" }} title="Export"><Download className="w-4 h-4" /></button>
                <button onClick={clearChat} className="p-2 rounded-lg" style={{ color: "var(--grey-dim)" }} title="Clear"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg" style={{ color: showSettings ? "var(--lime-primary)" : "var(--grey-dim)" }}><Settings className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Quick actions bar */}
        {chatHistory.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} onClick={() => handlePrompt(a.query)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "var(--grey-dim)" }}>
                <a.icon className="w-3 h-3" />{a.label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-2">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
                <Brain className="w-10 h-10" style={{ color: "var(--lime-primary)" }} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">TradeMind AI — Smart Trading Assistant</h3>
                <p className="text-sm max-w-md" style={{ color: "var(--grey-dim)" }}>
                  Ask anything about crypto trading. I understand natural language, fix typos, and suggest related topics when unsure.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_PROMPTS.map(p => (
                  <button key={p.label} onClick={() => handlePrompt(p.query)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
                    <p.icon className="w-5 h-5 flex-shrink-0" style={{ color: "var(--lime-primary)" }} />
                    <span className="text-sm text-white">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--lime-primary)" }}>
                    <Sparkles className="w-4 h-4" style={{ color: "var(--navy-base)" }} />
                  </div>
                )}

                <div className="max-w-[82%] rounded-2xl text-sm"
                  style={{ background: msg.role === "user" ? "var(--navy-highlight)" : "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "white" }}>

                  {/* Header row */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--grey-dim)" }}>
                      {msg.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--grey-dim)" }}>{fmt(msg.timestamp)}</span>
                  </div>

                  {/* Content — markdown for assistant, plain for user */}
                  <div className="px-4 pb-3">
                    {msg.role === "assistant"
                      ? <MarkdownMessage content={msg.content} />
                      : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    }
                  </div>

                  {/* Spell-correction chip */}
                  {msg.role === "assistant" && msg.metadata?.suggestion && (
                    <div className="px-4 pb-3 flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "var(--grey-dim)" }}>Interpreted as:</span>
                      <button onClick={() => handlePrompt(msg.metadata.suggestion)}
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all hover:opacity-80"
                        style={{ background: "var(--lime-primary)", color: "var(--navy-base)" }}>
                        ✏️ {msg.metadata.suggestion}
                      </button>
                    </div>
                  )}

                  {/* Suggestion checkboxes — shown when type === "suggestions" */}
                  {msg.role === "assistant" && msg.metadata?.type === "suggestions" && msg.metadata?.suggestions && (
                    <div className="px-4 pb-4">
                      <SuggestionList
                        suggestions={msg.metadata.suggestions}
                        onSelect={handlePrompt}
                      />
                    </div>
                  )}

                  {/* Action bar for assistant messages */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 px-4 pb-3 pt-1" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
                      <button onClick={() => copyToClipboard(msg.content, i)} className="p-1.5 rounded"
                        style={{ color: copiedIndex === i ? "var(--lime-primary)" : "var(--grey-dim)" }} title="Copy">
                        {copiedIndex === i ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => navigator.share ? navigator.share({ title: "TradeMind AI", text: msg.content }) : copyToClipboard(msg.content, i)}
                        className="p-1.5 rounded" style={{ color: "var(--grey-dim)" }} title="Share">
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handlePrompt("Explain this in more detail")}
                        className="p-1.5 rounded" style={{ color: "var(--grey-dim)" }} title="More detail">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => reactToMessage(i, "like")} className="p-1.5 rounded"
                        style={{ color: msg.liked ? "var(--lime-primary)" : "var(--grey-dim)" }}>
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => reactToMessage(i, "dislike")} className="p-1.5 rounded"
                        style={{ color: msg.disliked ? "#ff4444" : "var(--grey-dim)" }}>
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--navy-highlight)" }}>
                    <User className="w-4 h-4" style={{ color: "var(--lime-primary)" }} />
                  </div>
                )}
              </div>
            ))
          )}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--lime-primary)" }}>
                <Sparkles className="w-4 h-4 animate-spin" style={{ color: "var(--navy-base)" }} />
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--lime-primary)" }} />
                  <span className="text-sm" style={{ color: "var(--grey-dim)" }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--navy-highlight)" }}>
          {chatHistory.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => { const last = [...chatHistory].reverse().find(m => m.role === "user"); if (last) handlePrompt(last.content); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "var(--navy-surface)", border: "1px solid var(--navy-highlight)", color: "var(--grey-dim)" }}>
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isListening ? "Listening..." : "Ask about markets, strategies, indicators... (typos OK!)"}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl text-sm resize-none outline-none focus:ring-1 max-h-32"
              style={{ background: "var(--navy-surface)", border: `1px solid ${isListening ? "var(--lime-primary)" : "var(--navy-highlight)"}`, color: "white" }}
            />
            <button onClick={toggleVoice} className={`p-3 rounded-xl transition-all ${isListening ? "animate-pulse" : ""}`}
              style={{ background: isListening ? "var(--lime-primary)" : "var(--navy-surface)", border: "1px solid var(--navy-highlight)" }}>
              {isListening ? <MicOff className="w-5 h-5" style={{ color: "var(--navy-base)" }} /> : <Mic className="w-5 h-5" style={{ color: "var(--grey-dim)" }} />}
            </button>
            <button onClick={handleSend} disabled={!message.trim() || isTyping}
              className="p-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--lime-primary)" }}>
              <Send className="w-5 h-5" style={{ color: "var(--navy-base)" }} />
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center flex items-center justify-center gap-2" style={{ color: "var(--grey-dim)" }}>
            <Sparkles className="w-3 h-3" /> Smart NLP · Auto spell-fix · Checkbox suggestions · Markdown
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
