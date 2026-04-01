"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle, Mail, Clock3, BookOpen, LifeBuoy, MessageSquareMore } from "lucide-react";

import { fadeInScale, listItemVariants, staggerContainer } from "@/components/animations";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";

export default function SupportPage() {
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).supportPage;
  const isArabic = locale === "ar";

  const faqs = [
    { question: copy.faq1Question, answer: copy.faq1Answer },
    { question: copy.faq2Question, answer: copy.faq2Answer },
    { question: copy.faq3Question, answer: copy.faq3Answer },
  ];

  const quickLinks = [
    { label: copy.openProfile, href: "/dashboard/profile", icon: BookOpen },
    { label: copy.planner, href: "/dashboard/planner", icon: LifeBuoy },
    { label: copy.studyChat, href: "/dashboard/study-chat", icon: MessageSquareMore },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <motion.section
        variants={fadeInScale}
        className={`rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#102C57]/8 px-3 py-1 text-xs font-semibold text-[#102C57]">
              <HelpCircle className="h-3.5 w-3.5" />
              {copy.title}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#102C57]">{copy.title}</h1>
            <p className="mt-2 max-w-3xl text-[#102C57]/65">{copy.description}</p>
          </div>
        </div>
      </motion.section>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          variants={listItemVariants}
          className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <div className="mb-5 flex items-center gap-2 text-[#102C57]">
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{copy.contactTitle}</h2>
          </div>

          <p className="text-sm leading-7 text-[#102C57]/75">{copy.contactDescription}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/70 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#102C57]/50">{copy.emailLabel}</p>
              <p className="mt-2 text-base font-semibold text-[#102C57]">support@aetheracademy.app</p>
            </div>
            <div className="rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/70 p-4">
              <div className="flex items-center gap-2 text-[#102C57]/50">
                <Clock3 className="h-4 w-4" />
                <p className="text-xs font-medium uppercase tracking-wide">{copy.responseTimeLabel}</p>
              </div>
              <p className="mt-2 text-base font-semibold text-[#102C57]">{copy.responseTimeValue}</p>
            </div>
          </div>
        </motion.section>

        <motion.aside
          variants={listItemVariants}
          className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <div className="mb-5 flex items-center gap-2 text-[#102C57]">
            <BookOpen className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{copy.quickLinksTitle}</h2>
          </div>

          <div className="space-y-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={localizePath(item.href)}
                className="flex items-center justify-between rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/60 px-4 py-3 text-[#102C57] transition hover:border-[#102C57]/20 hover:bg-white"
              >
                <div className={`flex items-center gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.aside>
      </motion.div>

      <motion.section
        variants={fadeInScale}
        className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        <h2 className="text-lg font-semibold text-[#102C57]">{copy.faqTitle}</h2>
        <div className="mt-5 space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/60 p-4">
              <h3 className="text-sm font-semibold text-[#102C57]">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-[#102C57]/75">{faq.answer}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
