// app/dashboard/page.tsx (Overview)
'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  BookOpen,
  Clock,
  Target,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Award
} from 'lucide-react';
import { fadeInScale, staggerContainer, listItemVariants } from '@/components/animations';

export default function DashboardOverview() {
  return (
    <div
      className="space-y-8 min-h-screen"
    >
      {/* Welcome Section */}
      {/* <motion.div variants={fadeInScale} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#102C57] mb-2">Welcome back, Alex! 👋</h1>
          <p className="text-[#102C57]/60">Here's your academic intelligence overview</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Start AI Session
        </motion.button>
      </motion.div> */}

      {/* Stats Grid */}
      {/* <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: GraduationCap, label: 'Current GPA', value: '3.85', change: '+0.2', color: 'from-green-500 to-emerald-500' },
          { icon: Clock, label: 'Study Hours', value: '124', change: '+12', color: 'from-blue-500 to-cyan-500' },
          { icon: Target, label: 'Courses', value: '5', change: '2 completed', color: 'from-purple-500 to-pink-500' },
          { icon: Award, label: 'Achievements', value: '8', change: '3 new', color: 'from-amber-500 to-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={listItemVariants}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-[#102C57]" />
              </div>
              <p className="text-sm text-[#102C57]/60 mb-1">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-[#102C57]">{stat.value}</span>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div> */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Study Assistant */}
        <motion.div 
          variants={fadeInScale}
          className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#102C57] flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Study Assistant
            </h2>
            <motion.button
              whileHover={{ x: 4 }}
              className="text-sm text-[#102C57]/40 hover:text-[#102C57] flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-4">
            {[
              { question: "Can you explain quantum computing?", time: "2 min ago", status: "answered" },
              { question: "Create a study schedule for finals", time: "1 hour ago", status: "processing" },
              { question: "Summarize my notes on machine learning", time: "3 hours ago", status: "answered" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={listItemVariants}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'answered' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-[#102C57]">{item.question}</p>
                    <p className="text-xs text-[#102C57]/40">{item.time}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#102C57]/20" />
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInScale}
            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 border border-[#DAC0A3]/20"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask AI anything about your studies..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#102C57] placeholder-[#102C57]/40"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium"
              >
                Send
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div 
          variants={fadeInScale}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#102C57] flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming
            </h2>
            <motion.button
              whileHover={{ x: 4 }}
              className="text-sm text-[#102C57]/40 hover:text-[#102C57] flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {[
              { task: "Calculus II Exam", course: "MATH 201", time: "Tomorrow, 10 AM", priority: "high" },
              { task: "Physics Lab Report", course: "PHYS 101", time: "Dec 15, 11:59 PM", priority: "medium" },
              { task: "Literature Review", course: "ENGL 210", time: "Dec 18, 5 PM", priority: "low" },
              { task: "Study Group Meeting", course: "CS 50", time: "Today, 3 PM", priority: "medium" },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={listItemVariants}
                whileHover={{ x: 4 }}
                className="p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    item.priority === 'high' ? 'bg-red-500' : 
                    item.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                  }`} />
                  <span className="text-xs font-medium text-[#102C57]/60">{item.course}</span>
                </div>
                <p className="text-sm font-medium text-[#102C57] mb-1">{item.task}</p>
                <p className="text-xs text-[#102C57]/40">{item.time}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        variants={fadeInScale}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#102C57]">Recent Activity</h2>
          <motion.button
            whileHover={{ x: 4 }}
            className="text-sm text-[#102C57]/40 hover:text-[#102C57] flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="space-y-4">
          {[
            { action: "Completed AI Study Session", detail: "Machine Learning Fundamentals", time: "2 hours ago", icon: Brain },
            { action: "Achievement Unlocked", detail: "Early Bird - 5 days streak", time: "Yesterday", icon: Award },
            { action: "Course Progress", detail: "Advanced Mathematics - 75% complete", time: "Yesterday", icon: TrendingUp },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={listItemVariants}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#102C57]/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-[#102C57]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#102C57]">{item.action}</p>
                <p className="text-xs text-[#102C57]/60">{item.detail}</p>
                <p className="text-xs text-[#102C57]/40 mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}