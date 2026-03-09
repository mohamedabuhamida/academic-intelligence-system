// app/dashboard/chat/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Loader2,
  Clock,
  ChevronDown,
  Download,
  Trash2,
  Plus,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import {
  fadeInScale,
  staggerContainer,
} from "@/components/animations";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
  sources?: string[];
  isStreaming?: boolean;
  feedback?: 'like' | 'dislike' | null;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  message_count?: number;
}

export default function ChatPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: convs } = await supabase
      .from("conversations")
      .select(`
        id, 
        title, 
        created_at,
        messages(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (convs) {
      setConversations(convs as Conversation[]);
    }
  };

  const welcomeMessage = (): Message => ({
    id: `welcome-${Date.now()}`,
    type: "ai",
    content: `# مرحباً! 👋

أنا مساعدك الدراسي الذكي. كيف يمكنني مساعدتك اليوم؟

**يمكنني مساعدتك في:**
- 📚 شرح المفاهيم الدراسية
- 📊 تحليل أدائك الأكاديمي
- 🎯 التخطيط للفصول الدراسية
- 📝 الإجابة عن أسئلة المقررات

**معدلك التراكمي الحالي:** 3.56
**المقررات المكتملة:** 18 مقرر
**الخطة الدراسية:** بكالوريوس علوم الحاسب

اطرح سؤالك وسأساعدك!`,
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

      if (conv) {
        setConversationId(conv.id);
        await loadMessages(conv.id);
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ 
            user_id: user.id, 
            title: "محادثة جديدة",
            created_at: new Date().toISOString()
          }])
          .select("id")
          .single();

        if (newConv) {
          setConversationId(newConv.id);
          setMessages([welcomeMessage()]);
        }
      }
    };

    initConversation();
  }, []);

  const loadMessages = async (convId: string) => {
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

  const handleNewChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newConv } = await supabase
      .from("conversations")
      .insert([{ 
        user_id: user.id, 
        title: "محادثة جديدة",
        created_at: new Date().toISOString()
      }])
      .select("id")
      .single();

    if (newConv) {
      setConversationId(newConv.id);
      setMessages([welcomeMessage()]);
      await loadConversations();
      setIsSidebarOpen(false);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setConversationId(convId);
    await loadMessages(convId);
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("هل أنت متأكد من حذف هذه المحادثة؟")) return;

    await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", convId);

    await supabase
      .from("conversations")
      .delete()
      .eq("id", convId);

    await loadConversations();
    
    if (convId === conversationId) {
      handleNewChat();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;
    
    const question = input.trim();
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      const userMessageId = `temp-${Date.now()}`;
      const userMessage: Message = {
        id: userMessageId,
        type: "user",
        content: question,
        timestamp: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prev => [...prev, userMessage]);

      const { data: savedUserMsg } = await supabase
        .from("messages")
        .insert([{
          conversation_id: conversationId,
          role: "user",
          content: question,
        }])
        .select("id, created_at")
        .single();

      if (savedUserMsg) {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessageId 
            ? { ...msg, id: String(savedUserMsg.id) }
            : msg
        ));
      }

      const aiMessageId = `stream-${Date.now()}`;
      const aiMessage: Message = {
        id: aiMessageId,
        type: "ai",
        content: "",
        timestamp: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isStreaming: true,
      };
      setMessages(prev => [...prev, aiMessage]);

      const response = await fetch("http://127.0.0.1:8000/api/ask", {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          user_id: user.id,
          conversation_id: conversationId,
        }),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullContent += chunk;

          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent, isStreaming: true }
              : msg
          ));
        }

        const { data: savedAiMsg } = await supabase
          .from("messages")
          .insert([{
            conversation_id: conversationId,
            role: "ai",
            content: fullContent,
          }])
          .select("id, created_at")
          .single();

        if (savedAiMsg) {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { 
                  ...msg, 
                  id: String(savedAiMsg.id),
                  content: fullContent,
                  isStreaming: false 
                }
              : msg
          ));
        }

        if (messages.length <= 1) {
          await supabase
            .from("conversations")
            .update({ title: question.slice(0, 30) + (question.length > 30 ? "..." : "") })
            .eq("id", conversationId);
          
          await loadConversations();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "ai",
        content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        timestamp: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (messageId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === type ? null : type }
        : msg
    ));

    await supabase
      .from("messages")
      .update({ feedback: type })
      .eq("id", messageId);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleExportConversation = () => {
    const content = messages
      .map(m => `${m.type === 'user' ? '👤' : '🤖'} [${m.timestamp}]\n${m.content}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 hover:bg-[#F8F0E5] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[#102C57]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#102C57]">المساعد الدراسي</h1>
            <p className="text-sm text-[#102C57]/60">اسأل عن أي شيء يتعلق بدراستك</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportConversation}
            className="p-2 hover:bg-[#F8F0E5] rounded-lg transition-colors"
            title="تصدير المحادثة"
          >
            <Download className="w-5 h-5 text-[#102C57]/60" />
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-[#102C57] text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>محادثة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-[#DAC0A3]/20 shadow-lg overflow-hidden">
        <div className="h-full flex">
          {/* Sidebar - Hidden on mobile, toggleable */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                {/* Backdrop for mobile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden fixed inset-0 bg-black/20 z-40"
                />
                
                {/* Sidebar */}
                <motion.div
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "tween" }}
                  className="fixed lg:relative lg:translate-x-0 top-0 right-0 w-80 h-full bg-white border-l border-[#DAC0A3]/20 z-50 lg:z-0 overflow-hidden flex flex-col"
                >
                  {/* Sidebar Header */}
                  <div className="p-4 border-b border-[#DAC0A3]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-[#102C57]">المحادثات</h2>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-[#F8F0E5] rounded-lg"
                      >
                        <X className="w-4 h-4 text-[#102C57]" />
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في المحادثات..."
                        className="w-full px-4 py-2 bg-[#F8F0E5] rounded-xl text-sm text-[#102C57] placeholder-[#102C57]/40 border border-[#DAC0A3]/20 focus:outline-none focus:ring-2 focus:ring-[#102C57]/20"
                      />
                    </div>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-colors ${
                          conv.id === conversationId
                            ? 'bg-[#102C57] text-white'
                            : 'hover:bg-[#F8F0E5]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              conv.id === conversationId ? 'text-white' : 'text-[#102C57]'
                            }`}>
                              {conv.title}
                            </p>
                            <div className={`flex items-center gap-2 mt-1 text-xs ${
                              conv.id === conversationId ? 'text-white/60' : 'text-[#102C57]/40'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{new Date(conv.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className={`p-1 rounded-lg transition-colors ${
                              conv.id === conversationId
                                ? 'hover:bg-white/20 text-white/60'
                                : 'hover:bg-[#102C57]/10 text-[#102C57]/40'
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`flex gap-3 max-w-2xl ${
                      message.type === "user" ? "flex-row" : "flex-row-reverse"
                    }`}
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
                        <Brain className="w-4 h-4 text-white" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-[#102C57]" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div
                        className={`rounded-2xl p-4 ${
                          message.type === "ai"
                            ? message.isStreaming
                              ? "bg-[#F8F0E5] border border-[#DAC0A3]/20 animate-pulse"
                              : "bg-[#F8F0E5] border border-[#DAC0A3]/20"
                            : "bg-[#102C57] text-white"
                        }`}
                      >
                        {message.type === "ai" ? (
                          <div className="prose prose-sm max-w-none text-right text-[#102C57]">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-[#102C57]/10 px-1 py-0.5 rounded" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>

                      {/* Message Footer */}
                      <div
                        className={`flex items-center gap-2 px-2 ${
                          message.type === "user" ? "justify-start" : "justify-end"
                        }`}
                      >
                        <span className="text-xs text-[#102C57]/40">
                          {message.timestamp}
                        </span>

                        {message.type === "ai" && !message.isStreaming && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyMessage(message.content)}
                              className="p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors"
                            >
                              <Copy className="w-3 h-3 text-[#102C57]/40" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'like')}
                              className={`p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors ${
                                message.feedback === 'like' ? 'text-green-600' : ''
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${
                                message.feedback === 'like' ? 'text-green-600' : 'text-[#102C57]/40'
                              }`} />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, 'dislike')}
                              className={`p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors ${
                                message.feedback === 'dislike' ? 'text-red-600' : ''
                              }`}
                            >
                              <ThumbsDown className={`w-3 h-3 ${
                                message.feedback === 'dislike' ? 'text-red-600' : 'text-[#102C57]/40'
                              }`} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-end">
                  <div className="flex gap-3 max-w-2xl flex-row-reverse">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#102C57] to-[#DAC0A3] flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#F8F0E5] border border-[#DAC0A3]/20 rounded-2xl p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#102C57]" />
                        <span className="text-sm text-[#102C57]/60">جاري التفكير...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#DAC0A3]/20">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 px-4 py-3 bg-[#F8F0E5] rounded-xl text-sm text-[#102C57] placeholder-[#102C57]/40 border border-[#DAC0A3]/20 focus:outline-none focus:ring-2 focus:ring-[#102C57]/20"
                  dir="rtl"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim() || !conversationId}
                  className="p-3 bg-[#102C57] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#102C57]/90 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-medium text-[#102C57]/60 whitespace-nowrap">
                  اقتراحات:
                </span>
                {["متطلبات التخرج", "المقررات", "الخطة الدراسية", "المعدل"].map(
                  (action) => (
                    <button
                      key={action}
                      onClick={() => setInput(action)}
                      className="px-3 py-1 bg-[#F8F0E5] rounded-lg text-xs text-[#102C57] hover:bg-[#102C57]/10 transition-colors whitespace-nowrap"
                    >
                      {action}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}