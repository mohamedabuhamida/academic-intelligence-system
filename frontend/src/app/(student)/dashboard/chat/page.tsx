// app/dashboard/chat/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  fadeInScale,
  staggerContainer,
} from "@/components/animations";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
  sources?: string[];
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

  const welcomeMessage = (): Message => ({
    id: `welcome-${Date.now()}`,
    type: "ai",
    content:
      "مرحباً! أنا مساعدك الدراسي الذكي. كيف يمكنني مساعدتك في دراستك اليوم؟",
    timestamp: new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  useEffect(() => {
    const initConversation = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessages([welcomeMessage()]);
        return;
      }

      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let convId = conv?.id as string | undefined;

      if (!convId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, title: "New Chat" }])
          .select("id")
          .single();

        convId = newConv?.id as string | undefined;
      }

      if (!convId) {
        setMessages([welcomeMessage()]);
        return;
      }

      setConversationId(convId);

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs && msgs.length > 0) {
        setMessages(
          msgs.map((msg: any) => ({
            id: String(msg.id),
            type: msg.role === "user" ? "user" : "ai",
            content: String(msg.content ?? ""),
            timestamp: new Date(msg.created_at).toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
      } else {
        setMessages([welcomeMessage()]);
      }
    };

    initConversation();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;
    const question = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: userMsg } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "user",
            content: question,
          },
        ])
        .select("id, created_at")
        .single();

      if (userMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(userMsg.id),
            type: "user",
            content: question,
            timestamp: new Date(userMsg.created_at).toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }

      const response = await fetch("http://127.0.0.1:8000/api/ask", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          user_id: user.id,
        }),
      });

      const data = await response.json().catch(() => ({}));
      const answer =
        data?.answer ??
        data?.message ??
        (response.ok
          ? "Received a response in an unexpected format."
          : "Unable to get a response from the server.");

      const { data: aiMsg } = await supabase
        .from("messages")
        .insert([
          {
            conversation_id: conversationId,
            role: "ai",
            content: String(answer),
          },
        ])
        .select("id, created_at")
        .single();

      if (aiMsg) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(aiMsg.id),
            type: "ai",
            content: String(answer),
            timestamp: new Date(aiMsg.created_at).toLocaleTimeString("ar-SA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sources: Array.isArray(data?.sources) ? data.sources : [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatArabicText = (text: string) => {
    // Split by numbers and format lists
    const parts = text.split(/(\d+\.\s+[^\n]+)/g);
    return parts.map((part, index) => {
      if (part.match(/^\d+\./)) {
        return (
          <div key={index} className="flex items-start gap-2 mr-4 mt-2">
            <span className="w-5 h-5 rounded-full bg-[#102C57]/10 text-[#102C57] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {part.match(/^\d+/)?.[0]}
            </span>
            <span className="text-[#102C57]/80">
              {part.replace(/^\d+\.\s+/, "")}
            </span>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col h-[calc(100vh-10rem)] min-h-[620px]"
      dir="rtl"
    >
      {/* Chat Header */}
      <motion.div
        variants={fadeInScale}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#102C57] mb-2">
            المساعد الدراسي الذكي
          </h1>
          <p className="text-[#102C57]/60">
            اسأل عن أي شيء يتعلق بدراستك، المقررات، أو الخطط الدراسية
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMessages([
              {
                id: 1,
                type: "ai",
                content:
                  "مرحباً! أنا مساعدك الدراسي الذكي. كيف يمكنني مساعدتك في دراستك اليوم؟",
                timestamp: new Date().toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#102C57]/5 rounded-xl text-[#102C57] text-sm font-medium border border-[#DAC0A3]/20"
        >
          <Sparkles className="w-4 h-4" />
          محادثة جديدة
        </motion.button>
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        variants={fadeInScale}
        className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-4 mb-4 z-10 overflow-x-hidden"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.type === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`flex gap-3 max-w-3xl ${message.type === "user" ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  message.type === "ai"
                    ? "bg-gradient-to-br from-[#102C57] to-[#DAC0A3]"
                    : "bg-[#102C57]/10"
                }`}
              >
                {message.type === "ai" ? (
                  <Brain className="w-4 h-4 text-[#F8F0E5]" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#102C57]" />
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div
                  className={`rounded-2xl p-4 ${
                    message.type === "ai"
                      ? "bg-white border border-[#DAC0A3]/20 text-[#102C57]"
                      : "bg-[#102C57] text-[#F8F0E5]"
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ direction: "rtl" }}
                  >
                    {message.type === "ai"
                      ? formatArabicText(message.content)
                      : message.content}
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#DAC0A3]/20">
                      <p className="text-xs font-medium text-[#102C57]/60 mb-2">
                        المصادر:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {message.sources.map((source, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-[#F8F0E5] rounded-lg text-xs text-[#102C57]"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Footer */}
                <div
                  className={`flex items-center gap-2 px-2 ${message.type === "user" ? "justify-start" : "justify-end"}`}
                >
                  <span className="text-xs text-[#102C57]/40">
                    {message.timestamp}
                  </span>

                  {message.type === "ai" && (
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          navigator.clipboard.writeText(message.content)
                        }
                        className="p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors"
                      >
                        <Copy className="w-3 h-3 text-[#102C57]/40" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-[#102C57]/40" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3 text-[#102C57]/40" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="flex gap-3 max-w-3xl flex-row-reverse">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#102C57] to-[#DAC0A3] flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#F8F0E5]" />
              </div>
              <div className="bg-white border border-[#DAC0A3]/20 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#102C57]" />
                  <span className="text-sm text-[#102C57]/60">
                    جاري التفكير...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input Area */}
      <motion.div variants={fadeInScale} className="relative">
        <div className="bg-white rounded-2xl border border-[#DAC0A3]/20 shadow-lg">
          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-[#DAC0A3]/10 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-medium text-[#102C57]/60">
              إجراءات سريعة:
            </span>
            {["متطلبات التخرج", "المقررات", "الخطة الدراسية", "المعدل"].map(
              (action) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(action)}
                  className="px-3 py-1 bg-[#F8F0E5] rounded-lg text-xs text-[#102C57] hover:bg-[#102C57]/10 transition-colors whitespace-nowrap"
                >
                  {action}
                </motion.button>
              ),
            )}
          </div>

          {/* Input Field */}
          <div className="flex items-center gap-2 p-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              إرسال
            </motion.button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 px-4 py-2 bg-transparent border-none outline-none text-sm text-[#102C57] placeholder-[#102C57]/40 text-right"
              dir="rtl"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Context Info */}
        <div className="mt-2 flex items-center justify-end gap-2 text-xs text-[#102C57]/40">
          <BookOpen className="w-3 h-3" />
          <span>السياق: برنامج بكالوريوس علوم الحاسب</span>
        </div>
      </motion.div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #dac0a3;
          border-radius: 20px;
          opacity: 0.2;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #102c57;
        }
      `}</style>
    </motion.div>
  );
}
