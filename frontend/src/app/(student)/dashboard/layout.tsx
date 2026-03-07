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
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-[#DAC0A3]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-[#102C57]/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-[#EADBC8]/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

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
        {/* <Header isSidebarExpanded={isSidebarExpanded} /> */}

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

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
