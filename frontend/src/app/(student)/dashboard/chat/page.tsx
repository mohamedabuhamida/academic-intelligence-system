"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Brain,
  Send,
  Loader2,
} from "lucide-react";
import { fadeInScale, staggerContainer } from "@/components/animations";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =============================
  // 🔹 Load or Create Conversation
  // =============================

  useEffect(() => {
    const initConversation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get latest conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let convId = conv?.id;

      // If no conversation → create one
      if (!convId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, title: "New Chat" }])
          .select()
          .single();

        convId = newConv?.id;
      }

      setConversationId(convId);

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs) {
        setMessages(
          msgs.map((msg: any) => ({
            id: msg.id,
            type: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString("ar-SA"),
          }))
        );
      }
    };

    initConversation();
  }, []);

  // =============================
  // 🔹 Send Message
  // =============================

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1️⃣ Save user message
    const { data: userMsg } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          role: "user",
          content: question,
        },
      ])
      .select()
      .single();

    if (userMsg) {
      setMessages((prev) => [
        ...prev,
        {
          id: userMsg.id,
          type: "user",
          content: question,
          timestamp: new Date(userMsg.created_at).toLocaleTimeString("ar-SA"),
        },
      ]);
    }

    try {
      // 2️⃣ Call FastAPI
      const response = await fetch("http://127.0.0.1:8000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          user_id: user.id, // important for memory
        }),
      });

      const data = await response.json();

      const answer = data?.answer ?? "No response";

      // 3️⃣ Save AI message
      const { data: aiMsg } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "ai",
            content: answer,
          },
        ])
        .select()
        .single();

      if (aiMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsg.id,
            type: "ai",
            content: answer,
            timestamp: new Date(aiMsg.created_at).toLocaleTimeString("ar-SA"),
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // 🔹 UI
  // =============================

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col h-[calc(100vh-10rem)]"
      dir="rtl"
    >
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="flex justify-end">
            <div className="flex gap-3 max-w-3xl flex-row-reverse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#102C57] to-[#DAC0A3] flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>

              <div className="bg-white border border-[#DAC0A3]/20 rounded-2xl p-4">
                <div className="text-sm whitespace-pre-line">
                  {message.content}
                </div>
                <div className="text-xs mt-2 opacity-40">
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <Loader2 className="animate-spin" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="px-4 py-2 bg-[#102C57] text-white rounded-xl"
        >
          <Send className="w-4 h-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب سؤالك هنا..."
          className="flex-1 p-2 border rounded-xl"
        />
      </div>
    </motion.div>
  );
}