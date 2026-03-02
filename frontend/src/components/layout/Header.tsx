'use client';

import { motion } from 'framer-motion';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { headerVariants, statusPulseVariants } from '@/lib/animations';
import { useAIStatus } from '@/hooks/useAIStatus';
import { Avatar } from '@/components/ui/Avatar';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Profile } from '@/types';

interface HeaderProps {
  profile: Profile | null;
}

export default function Header({ profile }: HeaderProps) {
  const { status, tokensUsed, tokensLimit, model } = useAIStatus();

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className="fixed top-0 right-0 left-[80px] lg:left-[280px] h-16 bg-[#102C57]/60 backdrop-blur-xl border-b border-[#DAC0A3]/20 z-40 transition-all duration-300"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#EADBC8]/50 group-hover:text-[#DAC0A3] transition-colors" />
            <input
              type="text"
              placeholder="Search courses, documents, or ask AI..."
              className="w-full h-10 pl-10 pr-4 bg-[#DAC0A3]/5 border border-[#DAC0A3]/20 rounded-xl text-[#F8F0E5] placeholder-[#EADBC8]/30 focus:outline-none focus:border-[#DAC0A3] focus:bg-[#DAC0A3]/10 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* AI Status */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 px-4 py-2 bg-[#DAC0A3]/10 rounded-xl border border-[#DAC0A3]/20"
          >
            <StatusIndicator status={status} />
            <div className="hidden lg:block">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-4 h-4 text-[#DAC0A3]" />
                <span className="text-sm text-[#F8F0E5]">{model}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-3 h-3 text-[#EADBC8]" />
                <span className="text-xs text-[#EADBC8]">
                  {tokensUsed}/{tokensLimit} tokens
                </span>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl hover:bg-[#DAC0A3]/10 transition-colors group"
          >
            <BellIcon className="w-6 h-6 text-[#EADBC8] group-hover:text-[#F8F0E5] transition-colors" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#DAC0A3] rounded-full" />
          </motion.button>

          {/* User Avatar */}
          <Avatar 
            profile={profile}
            size="md"
            className="cursor-pointer hover:ring-2 hover:ring-[#DAC0A3] transition-all"
          />
        </div>
      </div>
    </motion.header>
  );
}