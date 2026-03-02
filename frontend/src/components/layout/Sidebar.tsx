'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { sidebarVariants, itemVariants } from '@/lib/animations';
import { useSidebar } from '@/hooks/useSidebar';

const navigation = [
  { name: 'AI Chat', href: '/dashboard/chat', icon: ChatBubbleLeftIcon },
  { name: 'Semester Planner', href: '/dashboard/planner', icon: CalendarIcon },
  { name: 'GPA Analyzer', href: '/dashboard/gpa', icon: ChartBarIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Courses', href: '/dashboard/courses', icon: AcademicCapIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      initial={false}
      className="fixed left-0 top-0 h-screen bg-[#102C57]/80 backdrop-blur-xl border-r border-[#DAC0A3]/20 z-50 flex flex-col"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#DAC0A3]/20">
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#F8F0E5] to-[#DAC0A3] rounded-lg flex items-center justify-center">
                <span className="text-[#102C57] font-bold text-xl">A</span>
              </div>
              <span className="text-[#F8F0E5] font-semibold text-lg">AcademAI</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#DAC0A3]/10 transition-colors"
        >
          {isExpanded ? (
            <ChevronDoubleLeftIcon className="w-5 h-5 text-[#DAC0A3]" />
          ) : (
            <ChevronDoubleRightIcon className="w-5 h-5 text-[#DAC0A3]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className={`
                  flex items-center px-3 py-3 rounded-xl transition-all relative
                  ${isActive 
                    ? 'bg-[#DAC0A3]/20 text-[#F8F0E5]' 
                    : 'text-[#EADBC8]/70 hover:text-[#F8F0E5] hover:bg-[#DAC0A3]/10'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-8 bg-[#DAC0A3] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <item.icon className="w-6 h-6 min-w-[24px]" />
                
                <AnimatePresence mode="wait">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Info - Collapsed View */}
      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-[#DAC0A3]/20"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F8F0E5] to-[#DAC0A3] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <span className="text-[#102C57] font-bold">U</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}