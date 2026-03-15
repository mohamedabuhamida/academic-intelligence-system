// app/components/Header.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { headerVariants } from './animations';

interface HeaderProps {
  isSidebarExpanded: boolean;
}

export default function Header({ isSidebarExpanded }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-0 right-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[#DAC0A3]/20 px-8 py-4 transition-all duration-300 ${
        isSidebarExpanded ? "left-70" : "left-22"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 max-w-md"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#102C57]/40 group-focus-within:text-[#102C57] transition-colors" />
            <input
              type="text"
              placeholder="Search courses, notes, or ask AI..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F8F0E5] rounded-2xl border border-[#DAC0A3]/20 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/10 transition-all outline-none text-sm text-[#102C57] placeholder-[#102C57]/40"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#102C57]/10 rounded-lg text-[#102C57] text-xs font-medium"
            >
              ⌘ K
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* AI Status (Mobile/Tablet) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 rounded-xl border border-[#DAC0A3]/20"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 bg-green-500 rounded-full opacity-20"
              />
            </div>
            <span className="text-xs font-medium text-[#102C57]">AI Ready</span>
          </motion.div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative w-10 h-10 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/20 flex items-center justify-center text-[#102C57] hover:border-[#102C57]/30 transition-all"
          >
            <motion.div
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </motion.div>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/20 flex items-center justify-center text-[#102C57] hover:border-[#102C57]/30 transition-all"
            >
              <Bell className="w-4 h-4" />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
              />
            </motion.button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[#DAC0A3]/20 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-[#DAC0A3]/20">
                  <h3 className="font-semibold text-[#102C57]">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      whileHover={{ backgroundColor: '#F8F0E5' }}
                      className="p-4 border-b border-[#DAC0A3]/10 cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#102C57]/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#102C57]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#102C57]">AI Study Tip</p>
                          <p className="text-xs text-[#102C57]/60">Your study efficiency improved by 15%</p>
                          <p className="text-xs text-[#102C57]/40 mt-1">5 min ago</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-[#DAC0A3]/20">
                  <button className="text-sm text-[#102C57]/60 hover:text-[#102C57] transition-colors">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/20 hover:border-[#102C57]/30 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#102C57] to-[#DAC0A3] flex items-center justify-center text-[#F8F0E5] font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[#102C57]">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-[#102C57]/40">Student</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#102C57]/40 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#DAC0A3]/20 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-[#DAC0A3]/20">
                  <p className="text-sm font-medium text-[#102C57]">{user?.email}</p>
                  <p className="text-xs text-[#102C57]/40">Student • AI Credits: 150</p>
                </div>
                <div className="p-2">
                  {[
                    { icon: User, label: 'Profile' },
                    { icon: Settings, label: 'Settings' },
                  ].map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 4 }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#102C57]/60 hover:bg-[#F8F0E5] hover:text-[#102C57] transition-all"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500/60 hover:bg-red-50 hover:text-red-500 transition-all mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
