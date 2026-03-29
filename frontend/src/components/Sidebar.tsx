// app/components/Sidebar.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  MessageSquare,
  Calendar,
  CalendarRange,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { sidebarVariants } from "./animations";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Brain, label: "Overview", href: "/dashboard" },
  { icon: MessageSquare, label: "AI Chat", href: "/dashboard/chat" },
  { icon: BookOpen, label: "Study Chat", href: "/dashboard/study-chat" },
  { icon: Calendar, label: "Study Planner", href: "/dashboard/planner" },
  { icon: TrendingUp, label: "GPA Calculator", href: "/dashboard/gpa" },
  { icon: CalendarRange, label: "Timeline", href: "/dashboard/timeline" },

];

const bottomItems = [
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: HelpCircle, label: "Help & Support", href: "/dashboard/support" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      className="fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-[#DAC0A3]/20 shadow-xl z-50 flex flex-col"
    >
      {/* Logo Area */}
      <div
  className={`p-6 flex items-center ${
    isExpanded ? "justify-between" : "justify-center"
  }`}
>
  <div className="flex items-center gap-2">
    {/* Logo Icon */}
    <div className="w-8 h-8 rounded-xl bg-[#102C57] flex items-center justify-center">
      <Brain className="w-5 h-5 text-[#F8F0E5]" />
    </div>

    {/* Logo Text */}
    <motion.span
      initial={false}
      animate={{
        opacity: isExpanded ? 1 : 0,
        width: isExpanded ? "auto" : 0,
      }}
      transition={{ duration: 0.2 }}
      className="text-xl font-semibold text-[#102C57] overflow-hidden whitespace-nowrap"
    >
      Aether<span className="text-[#DAC0A3]">{" "}Academy</span>
    </motion.span>
  </div>

  {/* Toggle Button */}
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onToggle}
    className="w-6 h-6 m-2 rounded-full bg-[#102C57]/10 hover:bg-[#102C57]/20 flex items-center justify-center transition-colors"
  >
    {isExpanded ? (
      <ChevronLeft className="w-4 h-4 text-[#102C57]" />
    ) : (
      <ChevronRight className="w-4 h-4 text-[#102C57]" />
    )}
  </motion.button>
</div>

      {/* AI Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-4 mb-6 p-3 rounded-2xl bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 border border-[#DAC0A3]/20 backdrop-blur-sm ${
          !isExpanded && "flex justify-center"
        }`}
      >
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 bg-green-500 rounded-full opacity-20"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#102C57]">AI Assistant</p>
              <p className="text-xs text-[#102C57]/60">Active & Learning</p>
            </div>
            <Sparkles className="w-4 h-4 text-[#DAC0A3]" />
          </div>
        ) : (
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 bg-green-500 rounded-full opacity-20"
            />
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-3 py-3 mb-1 rounded-xl transition-all cursor-pointer group ${
                  isActive
                    ? "bg-[#102C57] text-[#F8F0E5] shadow-lg shadow-[#102C57]/20"
                    : "text-[#102C57]/60 hover:bg-[#102C57]/5 hover:text-[#102C57]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[#102C57] rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 relative z-10 ${!isExpanded && "mx-auto"}`}
                />
                {isExpanded && (
                  <span className="text-sm font-medium relative z-10">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#102C57] text-[#F8F0E5] text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-6 border-t border-[#DAC0A3]/20 pt-4">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center gap-3 px-3 py-3 mb-1 rounded-xl text-[#102C57]/60 hover:bg-[#102C57]/5 hover:text-[#102C57] transition-all cursor-pointer group"
            >
              <item.icon className={`w-5 h-5 ${!isExpanded && "mx-auto"}`} />
              {isExpanded && (
                <span className="text-sm font-medium">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#102C57] text-[#F8F0E5] text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </motion.div>
          </Link>
        ))}

        {/* Logout Button */}
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#102C57]/40 hover:bg-red-500/5 hover:text-red-500 transition-all cursor-pointer group mt-2"
        >
          <LogOut className={`w-5 h-5 ${!isExpanded && "mx-auto"}`} />
          {isExpanded && <span className="text-sm font-medium">Logout</span>}

          {/* Tooltip for collapsed state */}
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
              Logout
            </div>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
