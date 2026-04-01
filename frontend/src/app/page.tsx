"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  Shield,
} from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).landing;

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: copy.featureAssistantTitle,
      description: copy.featureAssistantDescription,
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: copy.featurePlanningTitle,
      description: copy.featurePlanningDescription,
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: copy.featureAnalyticsTitle,
      description: copy.featureAnalyticsDescription,
    },
  ];

  const stats = [
    {
      value: "98%",
      label: copy.statAccuracy,
      icon: <Shield className="w-6 h-6" />,
    },
    {
      value: "50K+",
      label: copy.statStudents,
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      value: "24/7",
      label: copy.statSupport,
      icon: <Brain className="w-6 h-6" />,
    },
    {
      value: "15min",
      label: copy.statResponse,
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F0E5]">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#DAC0A3]/20 bg-[#F8F0E5]/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102C57]">
                <Brain className="w-5 h-5 text-[#F8F0E5]" />
              </div>
              <span className="text-xl font-semibold text-[#102C57]">
                Aether<span className="text-[#DAC0A3]">Academy</span>
              </span>
            </motion.div>

            <div className="hidden items-center gap-8 md:flex">
              {[copy.features, copy.solutions, copy.pricing].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="text-sm font-medium text-[#102C57]/70 transition-colors hover:text-[#102C57]"
                >
                  {item}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <Link
                href={localizePath("/login")}
                className="px-5 py-2 text-sm font-medium text-[#102C57] transition-colors hover:text-[#102C57]/80"
              >
                {copy.signIn}
              </Link>
              <Link
                href={localizePath("/login")}
                className="flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-2 text-sm font-medium text-[#F8F0E5] shadow-lg shadow-[#102C57]/20"
              >
                {copy.getStarted}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      <section className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#DAC0A3]/20 px-4 py-2 text-sm font-medium text-[#102C57]">
                <Sparkles className="w-4 h-4" />
                {copy.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-6xl font-bold leading-tight text-[#102C57] md:text-7xl"
            >
              {copy.heroTitleLine1}
              <span className="block text-[#DAC0A3]">{copy.heroTitleLine2}</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-12 max-w-2xl text-xl text-[#102C57]/70"
            >
              {copy.heroDescription}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 30px -10px rgba(16,44,87,0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#102C57] px-8 py-4 text-lg font-semibold text-[#F8F0E5] sm:w-auto"
              >
                {copy.startTrial}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-2xl border-2 border-[#DAC0A3] px-8 py-4 text-lg font-semibold text-[#102C57] sm:w-auto"
              >
                {copy.watchDemo}
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative mt-20"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#F8F0E5] via-transparent to-transparent" />
            <div className="relative overflow-hidden rounded-3xl border border-[#DAC0A3]/20 shadow-2xl">
              <img
                src="/api/placeholder/1200/600"
                alt={copy.dashboardPreviewAlt}
                className="h-auto w-full"
              />
              <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-[#F8F0E5]/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#EADBC8] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.h2 variants={fadeInUp} className="mb-4 text-4xl font-bold text-[#102C57]">
              {copy.intelligenceTitle}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-xl text-[#102C57]/60"
            >
              {copy.intelligenceDescription}
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-3xl bg-[#DAC0A3] opacity-0 transition-opacity group-hover:opacity-10" />
                <div className="relative rounded-3xl border border-[#DAC0A3]/20 bg-[#F8F0E5] p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102C57] text-[#F8F0E5] transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold text-[#102C57]">{feature.title}</h3>
                  <p className="text-[#102C57]/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F0E5] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#102C57]/10 text-[#102C57]">
                  {stat.icon}
                </div>
                <div className="mb-2 text-3xl font-bold text-[#102C57]">{stat.value}</div>
                <div className="text-[#102C57]/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102C57] px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="mb-6 text-4xl font-bold text-[#F8F0E5] md:text-5xl">{copy.ctaTitle}</h2>
          <p className="mb-10 text-xl text-[#F8F0E5]/80">{copy.ctaDescription}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2 rounded-2xl bg-[#DAC0A3] px-8 py-4 text-lg font-semibold text-[#102C57]"
          >
            {copy.getStartedNow}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </section>

      <footer className="border-t border-[#DAC0A3]/20 bg-[#102C57] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DAC0A3]">
                <Brain className="w-5 h-5 text-[#102C57]" />
              </div>
              <span className="text-xl font-semibold text-[#F8F0E5]">AetherAcademy</span>
            </div>
            <div className="flex gap-8">
              {[copy.terms, copy.privacy, copy.contact].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  whileHover={{ y: -2 }}
                  className="text-sm text-[#F8F0E5]/60 transition-colors hover:text-[#F8F0E5]"
                >
                  {item}
                </motion.a>
              ))}
            </div>
            <div className="text-sm text-[#F8F0E5]/40">{copy.footerCopyright}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
