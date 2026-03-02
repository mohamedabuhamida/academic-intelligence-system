'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/hooks/useSidebar';
import { Profile, User } from '@/types';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User | null;
  profile: Profile | null;
}

export function DashboardLayoutClient({ 
  children, 
  user, 
  profile 
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { isExpanded } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#102C57]">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#102C57] via-[#1a3a6e] to-[#234785] opacity-50" />
      
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(218, 192, 163, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(218, 192, 163, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Sidebar */}
      <Sidebar user={user} profile={profile} />

      {/* Main Content */}
      <motion.main
        layout
        className={`
          min-h-screen transition-all duration-300
          ${isExpanded ? 'lg:pl-[280px]' : 'lg:pl-[80px]'}
        `}
      >
        {/* Header */}
        <Header user={user} profile={profile} />

        {/* Page Content with Animation */}
        <div className="pt-20 px-6 pb-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Floating AI Assistant Button (Optional) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#DAC0A3] to-[#EADBC8] rounded-2xl shadow-lg flex items-center justify-center group z-50"
      >
        <span className="text-2xl text-[#102C57] group-hover:rotate-12 transition-transform">
          🤖
        </span>
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-[#102C57] animate-pulse" />
      </motion.button>
    </div>
  );
}