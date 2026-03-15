"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  AlertTriangle,
} from "lucide-react";

import {
  fadeInScale,
  staggerContainer,
  listItemVariants,
} from "@/components/animations";
import Loading from "@/components/Loading";
type Activity = {
  action: string;
  detail: string;
  time: string;
  icon?: string;
};

type DashboardData = {
  user?: {
    name?: string;
  };
  academic?: {
    cgpa: number;
    activeCourses: number;
    completedCredits: number;
    requiredCredits: number;
    progress: number;
    remainingCredits: number;
    estimatedGraduation: string;
    totalCredits: number;
  };
  recentActivity?: Activity[];
};

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error("Dashboard API error", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const academic = data?.academic;

  const stats = [
    {
      icon: GraduationCap,
      label: "CGPA",
      value: academic?.cgpa ? academic.cgpa.toFixed(3) : "0.000",
      change: `Based on ${academic?.totalCredits ?? 0} graded credits`,
      color: "from-green-500 to-emerald-500",
      glow: "from-green-400/25 to-emerald-400/25",
      badge: "text-green-700 bg-green-100",
    },
    {
      icon: Target,
      label: "Active Courses",
      value: academic?.activeCourses ?? 0,
      change: academic?.activeCourses ? "In progress" : "No active courses",
      color: "from-indigo-500 to-sky-500",
      glow: "from-indigo-400/25 to-sky-400/25",
      badge: "text-indigo-700 bg-indigo-100",
    },
    {
      icon: TrendingUp,
      label: "Graduation Progress",
      value: `${academic?.progress ?? 0}%`,
      change: `${academic?.completedCredits ?? 0} / ${academic?.requiredCredits ?? 0} credits`,
      color: "from-blue-500 to-cyan-500",
      glow: "from-blue-400/25 to-cyan-400/25",
      badge: "text-blue-700 bg-blue-100",
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        variants={fadeInScale}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#102C57] mb-2">
            Welcome back, {data?.user?.name || "Student"}!
          </h1>

          <p className="text-[#102C57]/60">
            Here's your academic intelligence overview
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Start AI Session
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={listItemVariants}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.glow} opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-inner`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <p className="text-sm text-[#102C57]/60 mb-1">{stat.label}</p>

              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-[#102C57]">
                  {stat.value}
                </span>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${stat.badge}`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
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
              { question: "Build my next semester plan", time: "2 min ago" },
              {
                question: "Am I at risk of delaying graduation?",
                time: "1 hour ago",
              },
              {
                question: "What courses should I take next semester?",
                time: "3 hours ago",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={listItemVariants}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />

                  <div>
                    <p className="text-sm font-medium text-[#102C57]">
                      {item.question}
                    </p>
                    <p className="text-xs text-[#102C57]/40">{item.time}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#102C57]/20" />
              </motion.div>
            ))}
          </div>

          {/* Ask AI */}
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

        {/* AI Advisor Insight */}
        <motion.div
          variants={fadeInScale}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-[#102C57] flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5" />
            AI Advisor Insight
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10">
              <p className="text-sm text-[#102C57]">
                Your GPA is strong, but taking <b>Machine Learning</b> and
                <b> Computer Networks</b> together may increase workload.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10">
              <p className="text-sm text-[#102C57]">
                You have completed{" "}
                <b>
                  {academic?.completedCredits ?? 0} / {academic?.requiredCredits ?? 0} credits
                </b>
                . Estimated graduation status:{" "}
                <b>{academic?.estimatedGraduation ?? "Unavailable"}</b>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={fadeInScale}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-[#102C57] mb-6">
          Recent Activity
        </h2>

        <div className="space-y-4">
          {data?.recentActivity?.map((item, index) => (
            <motion.div
              key={index}
              variants={listItemVariants}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#102C57]/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#102C57]" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-[#102C57]">
                  {item.action}
                </p>
                <p className="text-xs text-[#102C57]/60">{item.detail}</p>
                <p className="text-xs text-[#102C57]/40 mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
