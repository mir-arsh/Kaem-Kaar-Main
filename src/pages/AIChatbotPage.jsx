import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { Sparkles, Send, Trash2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "kaemkaar_ai_chat_history";

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-primary/60 block"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const AIChatbotPage = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/super-responder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: updatedMessages }),
        },
      );
      const data = await response.json();
      const reply = data.reply || "Sorry, I couldn't respond. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AppShell
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Rozgar Bab</h2>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100svh-8rem)]">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 pb-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot size={32} className="text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-extrabold text-foreground text-lg">
                  Rozgar Bab
                </p>
                <p className="text-sm text-muted-foreground max-w-[240px]">
                  Ask me anything about jobs, hiring, or how to use the app.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  profile?.role === "hirer"
                    ? "How do I post a job?"
                    : "How do I apply for jobs?",
                  "How the payment works?",
                  "How does Kaem Kaar work?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                    className="text-xs font-semibold px-3 py-2 rounded-full border border-border bg-card text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Sparkles size={12} className="text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mr-2 mt-1">
                <Sparkles size={12} className="text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-border bg-background">
          <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-4 py-2 focus-within:border-primary/50 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            >
              <Send size={14} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AIChatbotPage;
