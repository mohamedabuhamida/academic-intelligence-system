"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: String(data?.answer ?? ""),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "⚠️ Error contacting AI service.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div>
          <h1 className="text-xl font-semibold">AI Academic Mentor</h1>
          <p className="text-sm text-gray-400">Powered by RAG Engine</p>
        </div>

        <motion.div
          animate={{
            boxShadow: [
              "0 0 8px #22c55e",
              "0 0 18px #22c55e",
              "0 0 8px #22c55e",
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-3 h-3 bg-green-500 rounded-full"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`max-w-xl p-4 rounded-2xl backdrop-blur-lg border ${
                msg.role === "user"
                  ? "ml-auto bg-blue-600/20 border-blue-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">
                {msg.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 p-4 rounded-2xl w-40"
          >
            <div className="flex space-x-2">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                className="w-2 h-2 bg-white rounded-full"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-2 h-2 bg-white rounded-full"
              />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 backdrop-blur-xl bg-white/5 flex gap-3">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about academic regulations..."
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          Send
        </motion.button>
      </div>
    </div>
  );
}
