"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { title: "Current GPA", value: "3.45", color: "from-green-500 to-emerald-600" },
  { title: "Completed Credits", value: "96", color: "from-blue-500 to-indigo-600" },
  { title: "Remaining Credits", value: "46", color: "from-purple-500 to-violet-600" },
  { title: "Risk Level", value: "Low", color: "from-orange-500 to-red-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Academic Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          AI-powered insights for your academic journey.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
          >
            <div
              className={`absolute inset-0 opacity-20 bg-gradient-to-br ${stat.color}`}
            />
            <h3 className="text-sm text-gray-400">{stat.title}</h3>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI System Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">AI System Status</h2>
            <p className="text-gray-400 text-sm mt-1">
              RAG Engine Operational
            </p>
          </div>

          <motion.div
            animate={{
              boxShadow: [
                "0 0 10px #22c55e",
                "0 0 20px #22c55e",
                "0 0 10px #22c55e",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-4 h-4 bg-green-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/dashboard/chat">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg cursor-pointer"
          >
            💬 Chat with AI Mentor
          </motion.div>
        </Link>

        <Link href="/dashboard/planner">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg cursor-pointer"
          >
            📅 Plan Next Semester
          </motion.div>
        </Link>

        <Link href="/dashboard/gpa">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg cursor-pointer"
          >
            📊 Analyze GPA
          </motion.div>
        </Link>
      </div>
    </div>
  );
}