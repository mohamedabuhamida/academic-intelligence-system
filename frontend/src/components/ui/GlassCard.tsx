'use client';

import { motion } from 'framer-motion';
import { glassCardVariants } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = true }: GlassCardProps) {
  return (
    <motion.div
      variants={glassCardVariants}
      initial="initial"
      animate="animate"
      whileHover={hoverable ? "hover" : undefined}
      className={cn(
        "bg-[#102C57]/40 backdrop-blur-xl border border-[#DAC0A3]/20 rounded-2xl",
        "shadow-[0_8px_32px_0_rgba(16,44,87,0.2)]",
        className
      )}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {children}
    </motion.div>
  );
}