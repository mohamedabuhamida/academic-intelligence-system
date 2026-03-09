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
  Share2,
  Trash2,
  Edit3,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Settings,
  User,
  LogOut,
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
  last_message?: string;
  message_count?: number;
}

export default function ChatPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
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
- 🔍 البحث في المصادر الدراسية

**معدلك التراكمي الحالي:** 3.56
**المقررات المكتملة:** 18 مقرر
**الخطة الدراسية:** بكالوريوس علوم الحاسب

اطرح سؤالك وسأبذل قصارى جهدي لمساعدتك!`,
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

      // Get latest conversation
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
        // Create new conversation
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
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setConversationId(convId);
    await loadMessages(convId);
    setShowConversations(false);
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

      // Add user message immediately
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

      // Save user message to database
      const { data: savedUserMsg } = await supabase
        .from("messages")
        .insert([{
          conversation_id: conversationId,
          role: "user",
          content: question,
        }])
        .select("id, created_at")
        .single();

      // Update message with real ID
      if (savedUserMsg) {
        setMessages(prev => prev.map(msg => 
          msg.id === userMessageId 
            ? { ...msg, id: String(savedUserMsg.id) }
            : msg
        ));
      }

      // Add streaming AI message placeholder
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

      // Call API with streaming support
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

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullContent += chunk;

          // Update message progressively
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullContent, isStreaming: true }
              : msg
          ));
        }

        // Save final message to database
        const { data: savedAiMsg } = await supabase
          .from("messages")
          .insert([{
            conversation_id: conversationId,
            role: "ai",
            content: fullContent,
          }])
          .select("id, created_at")
          .single();

        // Update with real ID and remove streaming flag
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

        // Update conversation title if it's the first message
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
      
      // Remove streaming message
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      
      // Add error message
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

    // Save feedback to database
    await supabase
      .from("messages")
      .update({ feedback: type })
      .eq("id", messageId);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add a toast notification here
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
    <div className="flex h-[calc(100vh-8rem)] gap-4 relative" dir="rtl">
      {/* Sidebar Toggle for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-[#102C57] text-white rounded-full shadow-lg"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Conversations Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed lg:relative lg:translate-x-0 z-40 w-80 bg-white rounded-2xl border border-[#DAC0A3]/20 shadow-lg flex flex-col h-full ${!isSidebarOpen ? 'hidden lg:block' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#DAC0A3]/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#102C57]">المحادثات</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="p-2 bg-[#102C57]/5 rounded-lg text-[#102C57] hover:bg-[#102C57]/10"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Search Conversations */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#102C57]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات..."
              className="w-full pr-10 pl-3 py-2 bg-[#F8F0E5] rounded-xl text-sm text-[#102C57] placeholder-[#102C57]/40 border border-[#DAC0A3]/20 focus:outline-none focus:ring-2 focus:ring-[#102C57]/20"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence>
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => handleSelectConversation(conv.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
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
                      {conv.message_count && (
                        <>
                          <span>•</span>
                          <span>{conv.message_count} رسائل</span>
                        </>
                      )}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

       
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={`flex-1 flex flex-col min-h-0 transition-all ${isSidebarOpen ? 'lg:mr-0' : ''}`}
      >
        {/* Chat Header */}
        <motion.div
          variants={fadeInScale}
          className="flex items-center justify-between mb-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#102C57] mb-2">
              المساعد الدراسي الذكي
            </h1>
            <p className="text-sm text-[#102C57]/60">
              اسأل عن أي شيء يتعلق بدراستك، المقررات، أو الخطط الدراسية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportConversation}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#102C57]/5 rounded-xl text-[#102C57] text-sm font-medium border border-[#DAC0A3]/20"
              title="تصدير المحادثة"
            >
              <Download className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-[#102C57]/5 rounded-xl text-[#102C57] text-sm font-medium border border-[#DAC0A3]/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden lg:inline">محادثة جديدة</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <motion.div
          variants={fadeInScale}
          className="flex-1 min-h-0 overflow-y-auto space-y-4 lg:space-y-6 pl-2 lg:pl-4 mb-4 scrollbar-thin"
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
                className={`flex gap-2 lg:gap-3 max-w-full lg:max-w-3xl ${message.type === "user" ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    message.type === "ai"
                      ? "bg-gradient-to-br from-[#102C57] to-[#DAC0A3]"
                      : "bg-[#102C57]/10"
                  }`}
                >
                  {message.type === "ai" ? (
                    <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-[#F8F0E5]" />
                  ) : (
                    <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-[#102C57]" />
                  )}
                </div>

                {/* Message Content */}
                <div className="space-y-1 lg:space-y-2 min-w-0 flex-1">
                  <div
                    className={`rounded-2xl p-3 lg:p-4 ${
                      message.type === "ai"
                        ? message.isStreaming
                          ? "bg-white border border-[#DAC0A3]/20 text-[#102C57] animate-pulse"
                          : "bg-white border border-[#DAC0A3]/20 text-[#102C57]"
                        : "bg-[#102C57] text-[#F8F0E5]"
                    }`}
                  >
                    {message.type === "ai" ? (
                      <div className="prose prose-sm max-w-none text-right" dir="rtl">
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isBlock = Boolean(match) || String(children).includes('\n');
                              return isBlock && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
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

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-[#DAC0A3]/20">
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
                    <span className="text-[10px] lg:text-xs text-[#102C57]/40">
                      {message.timestamp}
                    </span>

                    {message.type === "ai" && !message.isStreaming && (
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopyMessage(message.content)}
                          className="p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors"
                        >
                          <Copy className="w-2 h-2 lg:w-3 lg:h-3 text-[#102C57]/40" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFeedback(message.id, 'like')}
                          className={`p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors ${
                            message.feedback === 'like' ? 'text-green-600' : ''
                          }`}
                        >
                          <ThumbsUp className={`w-2 h-2 lg:w-3 lg:h-3 ${
                            message.feedback === 'like' ? 'text-green-600' : 'text-[#102C57]/40'
                          }`} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFeedback(message.id, 'dislike')}
                          className={`p-1 hover:bg-[#F8F0E5] rounded-lg transition-colors ${
                            message.feedback === 'dislike' ? 'text-red-600' : ''
                          }`}
                        >
                          <ThumbsDown className={`w-2 h-2 lg:w-3 lg:h-3 ${
                            message.feedback === 'dislike' ? 'text-red-600' : 'text-[#102C57]/40'
                          }`} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <div className="flex gap-2 lg:gap-3 max-w-3xl flex-row-reverse">
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-xl bg-gradient-to-br from-[#102C57] to-[#DAC0A3] flex items-center justify-center">
                  <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-[#F8F0E5]" />
                </div>
                <div className="bg-white border border-[#DAC0A3]/20 rounded-2xl p-3 lg:p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 lg:w-4 lg:h-4 animate-spin text-[#102C57]" />
                    <span className="text-xs lg:text-sm text-[#102C57]/60">
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
            <div className="px-3 lg:px-4 py-2 border-b border-[#DAC0A3]/10 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-medium text-[#102C57]/60 whitespace-nowrap">
                إجراءات سريعة:
              </span>
              {["متطلبات التخرج", "المقررات", "الخطة الدراسية", "المعدل", "المشاريع"].map(
                (action) => (
                  <motion.button
                    key={action}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(action)}
                    className="px-2 lg:px-3 py-1 bg-[#F8F0E5] rounded-lg text-[10px] lg:text-xs text-[#102C57] hover:bg-[#102C57]/10 transition-colors whitespace-nowrap"
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
                disabled={isLoading || !input.trim() || !conversationId}
                className="px-3 lg:px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-xs lg:text-sm font-medium flex items-center gap-1 lg:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden lg:inline">إرسال</span>
              </motion.button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 px-3 lg:px-4 py-2 bg-transparent border-none outline-none text-xs lg:text-sm text-[#102C57] placeholder-[#102C57]/40 text-right"
                dir="rtl"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Context Info */}
          <div className="mt-2 flex items-center justify-end gap-2 text-[10px] lg:text-xs text-[#102C57]/40">
            <BookOpen className="w-2 h-2 lg:w-3 lg:h-3" />
            <span>السياق: برنامج بكالوريوس علوم الحاسب</span>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #dac0a3;
          border-radius: 20px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #102c57;
        }
        .prose {
          max-width: 100%;
        }
        .prose p {
          margin-bottom: 0.5rem;
        }
        .prose code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .prose pre {
          background: #1e1e1e;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          direction: ltr;
        }
      `}</style>
    </div>
  );
}
