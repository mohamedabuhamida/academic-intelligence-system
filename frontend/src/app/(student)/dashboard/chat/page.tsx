// app/dashboard/chat/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { fadeInScale, staggerContainer, listItemVariants } from '@/components/animations';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'ai', 
      content: "Hello! I'm your AI study assistant. How can I help you with your academics today?",
      timestamp: '10:30 AM'
    },
    { 
      id: 2, 
      type: 'user', 
      content: "Can you help me understand quantum computing basics?",
      timestamp: '10:31 AM'
    },
    { 
      id: 3, 
      type: 'ai', 
      content: "Of course! Quantum computing leverages quantum mechanics principles. Think of classical bits (0 or 1) versus quantum bits (qubits) that can exist in multiple states simultaneously. This enables parallel processing for specific problems. Would you like me to explain superposition and entanglement?",
      timestamp: '10:32 AM',
      sources: ['Quantum Computing 101', 'MIT OpenCourseWare']
    },
  ]);
  const [input, setInput] = useState('');

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="h-[calc(100vh-180px)] flex flex-col"
    >
      {/* Chat Header */}
      <motion.div 
        variants={fadeInScale}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#102C57] mb-2">AI Study Assistant</h1>
          <p className="text-[#102C57]/60">Ask anything about your courses, homework, or study plans</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#102C57]/5 rounded-xl text-[#102C57] text-sm font-medium border border-[#DAC0A3]/20"
        >
          <Sparkles className="w-4 h-4" />
          New Chat
        </motion.button>
      </motion.div>

      {/* Chat Messages */}
      <motion.div 
        variants={fadeInScale}
        className="flex-1 overflow-y-auto space-y-6 pr-4 mb-4"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            variants={listItemVariants}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                message.type === 'ai' 
                  ? 'bg-gradient-to-br from-[#102C57] to-[#DAC0A3]' 
                  : 'bg-[#102C57]/10'
              }`}>
                {message.type === 'ai' ? (
                  <Brain className="w-4 h-4 text-[#F8F0E5]" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-[#102C57]" />
                )}
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <div className={`rounded-2xl p-4 ${
                  message.type === 'ai' 
                    ? 'bg-white border border-[#DAC0A3]/20' 
                    : 'bg-[#102C57] text-[#F8F0E5]'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Sources */}
                  {message.sources && (
                    <div className="mt-3 pt-3 border-t border-[#DAC0A3]/20">
                      <p className="text-xs font-medium text-[#102C57]/60 mb-2">Sources:</p>
                      <div className="flex gap-2">
                        {message.sources.map((source, i) => (
                          <span key={i} className="px-2 py-1 bg-[#F8F0E5] rounded-lg text-xs text-[#102C57]">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Footer */}
                <div className={`flex items-center gap-2 px-2 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-xs text-[#102C57]/40">{message.timestamp}</span>
                  
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
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
      </motion.div>

      {/* Input Area */}
      <motion.div 
        variants={fadeInScale}
        className="relative"
      >
        <div className="bg-white rounded-2xl border border-[#DAC0A3]/20 shadow-lg">
          {/* Quick Actions */}
          <div className="px-4 py-3 border-b border-[#DAC0A3]/10 flex items-center gap-2">
            <span className="text-xs font-medium text-[#102C57]/60">Quick actions:</span>
            {['Summarize', 'Explain', 'Quiz me', 'Study plan'].map((action) => (
              <motion.button
                key={action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-[#F8F0E5] rounded-lg text-xs text-[#102C57] hover:bg-[#102C57]/10 transition-colors"
              >
                {action}
              </motion.button>
            ))}
          </div>

          {/* Input Field */}
          <div className="flex items-center gap-2 p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm text-[#102C57] placeholder-[#102C57]/40"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </motion.button>
          </div>
        </div>

        {/* Context Info */}
        <div className="mt-2 flex items-center gap-2 text-xs text-[#102C57]/40">
          <BookOpen className="w-3 h-3" />
          <span>Context: Current course: CS50 - Introduction to Computer Science</span>
        </div>
      </motion.div>
    </motion.div>
  );
}