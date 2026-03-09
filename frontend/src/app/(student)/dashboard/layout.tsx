// app/dashboard/layout.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { pageTransitionVariants } from '@/components/animations';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col bg-[#F8F0E5]">
      {/* Sidebar */}
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} 
      />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'ml-[280px]' : 'ml-[88px]'
        }`}
      >
        <Header isSidebarExpanded={isSidebarExpanded} />

        {/* Page Content with Transition */}
        <main className="p-8 pt-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative z-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
