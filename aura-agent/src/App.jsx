import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  { icon: "🔍", label: "Search the web", prompt: "Search for the latest news about AI tools in 2026" },
  { icon: "✍️", label: "Write something", prompt: "Write a short Instagram caption for a sunset photo" },
  { icon: "📋", label: "Plan my day", prompt: "Help me plan a productive workday from 9am to 5pm" },
  { icon: "💡", label: "Brainstorm ideas", prompt: "Give me 5 creative business name ideas for a design studio" },
  { icon: "📧", label: "Draft an email", prompt: "Draft a professional follow-up email after a job interview" },
  { icon: "🌍", label: "Translate text", prompt: "Translate 'Hello, how are you today?' into Norwegian, French, and Portuguese" },
];

const SYSTEM_PROMPT = `You are Aura — a friendly, sharp, and capable everyday AI assistant. You help regular people with anything: searching for information, writing, planning, creating content, answering questions, and automating small tasks.

Keep your tone warm, clear, and conversational. Avoid jargon. Format your responses nicely using markdown when helpful (bullet points, bold, headers). When you search the web, always summarize what you find in plain language.`;

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || "");
  const [showKeyPrompt, setShowKeyPrompt] = useState(!import.meta.env.VITE_ANTHROPIC_API_KEY);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    if (!apiKey) { setShowKeyPrompt(true); return; }

    setStarted(true);
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: newMessages,
        }),
      });

      const data = await response.json();
      const assistantText = data.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .filter(Boolean)
        .join("\n");

      setMessages([...newMessages, { role: "assistant", content: assistantText || "I couldn't get a response. Please try again." }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .split("\n").join("<br/>");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e4dc", display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,96,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(100,120,200,0.06) 0%, transparent 60%)",
      }} />

      {/* API Key Modal */}
      {showKeyPrompt && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "#111118", border: "1px solid rgba(212,175,96,0.25)",
            borderRadius: 20, padding: 32, maxWidth: 420, width: "100%",
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
            <h2 style={{ fontSize: 20, color: "#f0e8d0", marginBottom: 8, fontWeight: 400 }}>Enter your Anthropic API key</h2>
            <p style={{ fontSize: 13, color: "#6a6050", lineHeight: 1.6, marginBottom: 20 }}>
              Get a free key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#d4af60" }}>console.anthropic.com</a>. Your key stays in your browser only.
            </p>
            <input
              type="password"
              placeholder="sk-ant-..."
              onChange={e => setApiKey(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,96,0.2)",
                color: "#e8e4dc", fontSize: 14, outline: "none", marginBottom: 14,
                fontFamily: "monospace",
              }}
            />
            <button
              onClick={() => { if (apiKey) setShowKeyPrompt(false); }}
              style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: "linear-gradient(135deg, #d4af60, #a07830)",
                border: "none", color: "#0a0a0f", fontSize: 14, cursor: "pointer",
                fontFamily: "sans-serif", fontWeight: 600,
              }}
            >Start using Aura →</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{
        position: "relative", zIndex: 10,
        padding: "20px 28px 16px",
        borderBottom: "1px solid rgba(212,175,96,0.12)",
        display: "flex", alignItems: "center", gap: "12px",
        background: "rgba(10,10,15,0.8)", backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #d4af60, #a07830)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, boxShadow: "0 0 20px rgba(212,175,96,0.3)",
          color: "#0a0a0f",
        }}>✦</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.04em", color: "#f0e8d0" }}>Aura</div>
          <div style={{ fontSize: 11, color: "#8a7a60", letterSpacing: "0.08em", textTransform: "uppercase" }}>Your everyday AI assistant</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontSize: 11, color: "#5a6a5a", letterSpacing: "0.06em" }}>LIVE</span>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", zIndex: 5, overflow: "hidden" }}>
        {!started && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "40px 24px", gap: 32,
          }}>
            <div style={{ textAlign: "center", maxWidth: 480 }}>
              <div style={{ fontSize: 44, marginBottom: 12, lineHeight: 1 }}>✦</div>
              <h1 style={{ fontSize: 28, fontWeight: 400, color: "#f0e8d0", marginBottom: 10, lineHeight: 1.2 }}>
                What can I help you with today?
              </h1>
              <p style={{ fontSize: 14, color: "#6a6050", lineHeight: 1.6, margin: 0 }}>
                Chat, search the web, write anything, plan tasks — all in one place.
              </p>
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10, width: "100%", maxWidth: 600,
            }}>
              {SUGGESTIONS.map((s) => (
                <button key={s.label} onClick={() => sendMessage(s.prompt)} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,96,0.12)",
                  borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                  color: "#c8b890", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,96,0.07)"; e.currentTarget.style.borderColor = "rgba(212,175,96,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(212,175,96,0.12)"; }}
                >
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span style={{ fontSize: 13, fontFamily: "'Helvetica Neue', sans-serif" }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {started && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 12, maxWidth: 720, margin: "0 auto", width: "100%",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  background: msg.role === "user" ? "rgba(212,175,96,0.15)" : "linear-gradient(135deg, #d4af60, #a07830)",
                  border: msg.role === "user" ? "1px solid rgba(212,175,96,0.2)" : "none",
                  color: msg.role === "user" ? "#d4af60" : "#0a0a0f", alignSelf: "flex-start",
                }}>
                  {msg.role === "user" ? "U" : "✦"}
                </div>
                <div style={{
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                  background: msg.role === "user" ? "rgba(212,175,96,0.1)" : "rgba(255,255,255,0.04)",
                  border: msg.role === "user" ? "1px solid rgba(212,175,96,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  fontSize: 14, lineHeight: 1.7, color: "#ddd4c0",
                  fontFamily: msg.role === "user" ? "'Helvetica Neue', sans-serif" : "'Georgia', serif",
                  maxWidth: "calc(100% - 44px)",
                }}>
                  {msg.role === "assistant"
                    ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    : <span>{msg.content}</span>}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 12, maxWidth: 720, margin: "0 auto", width: "100%" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                  background: "linear-gradient(135deg, #d4af60, #a07830)", color: "#0a0a0f",
                }}>✦</div>
                <div style={{
                  padding: "16px 20px", borderRadius: "4px 18px 18px 18px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", gap: 6, alignItems: "center",
                }}>
                  {[0, 1, 2].map(n => (
                    <div key={n} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#d4af60",
                      animation: `pulse 1.4s ease-in-out ${n * 0.2}s infinite`, opacity: 0.6,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div style={{
        position: "relative", zIndex: 10, padding: "16px 20px 20px",
        background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(212,175,96,0.08)",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,96,0.18)",
          borderRadius: 16, padding: "10px 12px 10px 16px",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything — search, write, plan, create…"
            rows={1}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#e8e4dc", fontSize: 14, resize: "none", lineHeight: 1.6,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              maxHeight: 120, overflowY: "auto", caretColor: "#d4af60",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading ? "linear-gradient(135deg, #d4af60, #a07830)" : "rgba(255,255,255,0.06)",
              border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: input.trim() && !loading ? "#0a0a0f" : "#4a4038",
              transition: "all 0.2s",
            }}
          >↑</button>
        </div>
        <p style={{ textAlign: "center", fontSize: 10, color: "#3a3028", marginTop: 10, letterSpacing: "0.05em", fontFamily: "sans-serif" }}>
          AURA · AI ASSISTANT · CAN MAKE MISTAKES
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,96,0.2); border-radius: 2px; }
        textarea::placeholder { color: #4a4038; }
        ul { padding-left: 20px; margin: 6px 0; }
        li { margin: 3px 0; }
        h2, h3 { color: #d4af60; margin: 12px 0 6px; font-weight: 500; }
        strong { color: #e8dcc8; }
      `}</style>
    </div>
  );
}
