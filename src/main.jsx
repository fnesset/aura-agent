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
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,96,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(100,120,200,0.06) 0%, transparent 60%)",
      }} />

      {showKeyPrompt && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center", padding:
