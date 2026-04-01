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

import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";
import { sidebarVariants } from "./animations";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { locale, localizePath, stripLocalePrefix } = useLocale();
  const copy = getMessages(locale).sidebar;
  const normalizedPathname = stripLocalePrefix(pathname ?? "/");

  const navItems = [
    { icon: Brain, label: copy.overview, href: "/dashboard" },
    { icon: MessageSquare, label: copy.aiChat, href: "/dashboard/chat" },
    { icon: BookOpen, label: copy.studyChat, href: "/dashboard/study-chat" },
    { icon: Calendar, label: copy.planner, href: "/dashboard/planner" },
    { icon: TrendingUp, label: copy.gpa, href: "/dashboard/gpa" },
    { icon: CalendarRange, label: copy.timeline, href: "/dashboard/timeline" },
  ];

  const bottomItems = [
    { icon: User, label: copy.profile, href: "/dashboard/profile" },
    { icon: HelpCircle, label: copy.support, href: "/dashboard/support" },
    { icon: Settings, label: copy.settings, href: "/dashboard/settings" },
  ];

  return (
    <motion.aside
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      dir="ltr"
      className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#DAC0A3]/20 bg-white/80 shadow-xl backdrop-blur-xl"
    >
      <div
        className={`p-6 flex items-center ${
          isExpanded ? "justify-between" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102C57]">
            <Brain className="h-5 w-5 text-[#F8F0E5]" />
          </div>

          <motion.span
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap text-xl font-semibold text-[#102C57]"
          >
            Aether<span className="text-[#DAC0A3]"> Academy</span>
          </motion.span>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className="m-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#102C57]/10 transition-colors hover:bg-[#102C57]/20"
        >
          {isExpanded ? (
            <ChevronLeft className="h-4 w-4 text-[#102C57]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#102C57]" />
          )}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mx-4 mb-6 rounded-2xl border border-[#DAC0A3]/20 bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 p-3 backdrop-blur-sm ${
          !isExpanded && "flex justify-center"
        }`}
      >
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 rounded-full bg-green-500 opacity-20"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#102C57]">{copy.aiAssistant}</p>
              <p className="text-xs text-[#102C57]/60">{copy.activeLearning}</p>
            </div>
            <Sparkles className="h-4 w-4 text-[#DAC0A3]" />
          </div>
        ) : (
          <div className="relative">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-1 rounded-full bg-green-500 opacity-20"
            />
          </div>
        )}
      </motion.div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = normalizedPathname === item.href;
          return (
            <Link key={item.href} href={localizePath(item.href)}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                  isActive
                    ? "bg-[#102C57] text-[#F8F0E5] shadow-lg shadow-[#102C57]/20"
                    : "text-[#102C57]/60 hover:bg-[#102C57]/5 hover:text-[#102C57]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-[#102C57]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`relative z-10 h-5 w-5 ${!isExpanded && "mx-auto"}`} />
                {isExpanded && <span className="relative z-10 text-sm font-medium">{item.label}</span>}
                {!isExpanded && (
                  <div className="invisible absolute left-full ml-2 whitespace-nowrap rounded bg-[#102C57] px-2 py-1 text-xs text-[#F8F0E5] opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#DAC0A3]/20 px-3 pb-6 pt-4">
        {bottomItems.map((item) => (
          <Link key={item.href} href={localizePath(item.href)}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[#102C57]/60 transition-all hover:bg-[#102C57]/5 hover:text-[#102C57]"
            >
              <item.icon className={`h-5 w-5 ${!isExpanded && "mx-auto"}`} />
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
              {!isExpanded && (
                <div className="invisible absolute left-full ml-2 whitespace-nowrap rounded bg-[#102C57] px-2 py-1 text-xs text-[#F8F0E5] opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  {item.label}
                </div>
              )}
            </motion.div>
          </Link>
        ))}

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="group mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-[#102C57]/40 transition-all hover:bg-red-500/5 hover:text-red-500"
        >
          <LogOut className={`h-5 w-5 ${!isExpanded && "mx-auto"}`} />
          {isExpanded && <span className="text-sm font-medium">{copy.logout}</span>}
          {!isExpanded && (
            <div className="invisible absolute left-full ml-2 whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
              {copy.logout}
            </div>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
