"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BellRing, Globe2, LayoutPanelTop, Settings2, ShieldCheck, UserRound } from "lucide-react";

import { fadeInScale, listItemVariants, staggerContainer } from "@/components/animations";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";

export default function SettingsPage() {
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).settingsPage;
  const isArabic = locale === "ar";

  const cards = [
    {
      icon: Globe2,
      title: copy.languageTitle,
      description: copy.languageDescription,
      value: `${copy.currentLanguage}: ${locale.toUpperCase()}`,
    },
    {
      icon: LayoutPanelTop,
      title: copy.interfaceTitle,
      description: copy.interfaceDescription,
      value: copy.headerSidebarNote,
    },
    {
      icon: BellRing,
      title: copy.notificationsTitle,
      description: copy.notificationsDescription,
      value: copy.notificationsState,
    },
  ];

  const shortcuts = [
    { label: copy.manageProfile, href: "/dashboard/profile", icon: UserRound },
    { label: copy.resetPassword, href: "/dashboard/reset-password", icon: ShieldCheck },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <motion.section
        variants={fadeInScale}
        className={`rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-[#102C57]/8 px-3 py-1 text-xs font-semibold text-[#102C57]">
          <Settings2 className="h-3.5 w-3.5" />
          {copy.title}
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[#102C57]">{copy.title}</h1>
        <p className="mt-2 max-w-3xl text-[#102C57]/65">{copy.description}</p>
      </motion.section>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {cards.map((card) => (
          <motion.section
            key={card.title}
            variants={listItemVariants}
            className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
          >
            <div className={`flex items-center gap-3 text-[#102C57] ${isArabic ? "flex-row-reverse" : ""}`}>
              <div className="rounded-xl bg-[#F8F0E5] p-3">
                <card.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{card.title}</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#102C57]/75">{card.description}</p>
            <div className="mt-4 rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/70 p-4 text-sm font-medium text-[#102C57]">
              {card.value}
            </div>
          </motion.section>
        ))}
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          variants={listItemVariants}
          className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <h2 className="text-lg font-semibold text-[#102C57]">{copy.preferencesTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[#102C57]/75">{copy.preferencesDescription}</p>
          <p className="mt-4 text-sm leading-7 text-[#102C57]/75">{copy.notificationsHint}</p>
        </motion.section>

        <motion.aside
          variants={listItemVariants}
          className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <h2 className="text-lg font-semibold text-[#102C57]">{copy.accountTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-[#102C57]/75">{copy.accountDescription}</p>
          <div className="mt-5 space-y-3">
            {shortcuts.map((shortcut) => (
              <Link
                key={shortcut.href}
                href={localizePath(shortcut.href)}
                className="flex items-center justify-between rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/60 px-4 py-3 text-[#102C57] transition hover:border-[#102C57]/20 hover:bg-white"
              >
                <div className={`flex items-center gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
                  <shortcut.icon className="h-4 w-4" />
                  <span className="font-medium">{shortcut.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.aside>
      </motion.div>
    </motion.div>
  );
}
