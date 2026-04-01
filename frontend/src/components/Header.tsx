'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/components/providers/LocaleProvider';
import { getMessages } from '@/lib/i18n/messages';
import { createClient } from '@/lib/supabase/client';
import { headerVariants } from './animations';

interface HeaderProps {
  isSidebarExpanded: boolean;
}

type HeaderAlert = {
  id: string;
  tone: "warning" | "info" | "success";
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function Header({ isSidebarExpanded }: HeaderProps) {
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).header;
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alerts, setAlerts] = useState<HeaderAlert[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const loadHeaderData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      try {
        const response = await fetch("/api/profile-freshness", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok) {
          setAlerts(payload.alerts ?? []);
        }
      } catch (error) {
        console.error("Header alerts error", error);
      }
    };

    loadHeaderData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = localizePath("/login");
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      dir="ltr"
      className={`fixed top-0 right-0 z-40 border-b border-[#DAC0A3]/20 bg-white/70 px-8 py-4 backdrop-blur-xl transition-all duration-300 ${
        isSidebarExpanded ? "left-70" : "left-22"
      }`}
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md flex-1"
        >
          <div className="group relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#102C57]/40 transition-colors group-focus-within:text-[#102C57]" />
            <input
              type="text"
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-[#DAC0A3]/20 bg-[#F8F0E5] py-2.5 pl-11 pr-4 text-sm text-[#102C57] outline-none transition-all placeholder:text-[#102C57]/40 focus:border-[#102C57] focus:ring-2 focus:ring-[#102C57]/10"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-[#102C57]/10 px-2 py-1 text-xs font-medium text-[#102C57]"
            >
              Ctrl K
            </motion.div>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden items-center gap-2 rounded-xl border border-[#DAC0A3]/20 bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 px-3 py-2 md:flex"
          >
            <div className="relative">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-1 rounded-full bg-green-500 opacity-20"
              />
            </div>
            <span className="text-xs font-medium text-[#102C57]">{copy.aiReady}</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] text-[#102C57] transition-all hover:border-[#102C57]/30"
          >
            <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.3 }}>
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.div>
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] text-[#102C57] transition-all hover:border-[#102C57]/30"
            >
              <Bell className="h-4 w-4" />
              {alerts.length > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"
                />
              ) : null}
            </motion.button>

            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[#DAC0A3]/20 bg-white shadow-2xl"
              >
                <div className="border-b border-[#DAC0A3]/20 p-4">
                  <h3 className="font-semibold text-[#102C57]">{copy.notifications}</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <Link key={alert.id} href={localizePath(alert.ctaHref)} onClick={() => setShowNotifications(false)}>
                        <motion.div
                          whileHover={{ backgroundColor: "#F8F0E5" }}
                          className="cursor-pointer border-b border-[#DAC0A3]/10 p-4"
                        >
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102C57]/10">
                              <Sparkles className="h-4 w-4 text-[#102C57]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#102C57]">{alert.title}</p>
                              <p className="text-xs text-[#102C57]/60">{alert.message}</p>
                              <p className="mt-1 text-xs text-[#102C57]/40">{alert.ctaLabel}</p>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-[#102C57]/60">{copy.noAlerts}</div>
                  )}
                </div>
                <div className="border-t border-[#DAC0A3]/20 p-3 text-center">
                  <Link
                    href={localizePath("/dashboard/profile")}
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-[#102C57]/60 transition-colors hover:text-[#102C57]"
                  >
                    {copy.openProfile}
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] py-2 pl-3 pr-2 transition-all hover:border-[#102C57]/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#102C57] to-[#DAC0A3] font-medium text-[#F8F0E5]">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-[#102C57]">{user?.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-[#102C57]/40">{copy.student}</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-[#102C57]/40 transition-transform ${
                  showProfileMenu ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#DAC0A3]/20 bg-white shadow-2xl"
              >
                <div className="border-b border-[#DAC0A3]/20 p-3">
                  <p className="text-sm font-medium text-[#102C57]">{user?.email}</p>
                  <p className="text-xs text-[#102C57]/40">
                    {copy.student} • {copy.aiCredits}: 150
                  </p>
                </div>
                <div className="p-2">
                  {[
                    { icon: User, label: copy.profile, href: "/dashboard/profile" },
                    { icon: Settings, label: copy.settings, href: "/dashboard/settings" },
                  ].map((item) => (
                    <Link key={item.label} href={localizePath(item.href)} onClick={() => setShowProfileMenu(false)}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[#102C57]/60 transition-all hover:bg-[#F8F0E5] hover:text-[#102C57]"
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-500/60 transition-all hover:bg-red-50 hover:text-red-500"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">{copy.logout}</span>
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
