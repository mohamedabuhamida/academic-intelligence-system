"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  AlertTriangle,
  BellRing,
} from "lucide-react";

import {
  fadeInScale,
  staggerContainer,
  listItemVariants,
} from "@/components/animations";
import Loading from "@/components/Loading";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";
type Activity = {
  action: string;
  detail: string;
  time: string;
  icon?: string;
};

type DashboardData = {
  user?: {
    name?: string;
  };
  academic?: {
    cgpa: number;
    activeCourses: number;
    completedCredits: number;
    requiredCredits: number;
    progress: number;
    remainingCredits: number;
    estimatedGraduation: string;
    totalCredits: number;
  };
  recentActivity?: Activity[];
};

type AdvisorInsight = {
  id: string;
  tone: "success" | "warning" | "info";
  title: string;
  message: string;
};

type AdvisorData = {
  insights?: AdvisorInsight[];
};

type DashboardAlert = {
  id: string;
  tone: "warning" | "info" | "success";
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
};

type FreshnessData = {
  alerts?: DashboardAlert[];
};

export default function DashboardOverview() {
  const { locale, localizePath } = useLocale();
  const copy = getMessages(locale).dashboard;
  const [data, setData] = useState<DashboardData | null>(null);
  const [advisorData, setAdvisorData] = useState<AdvisorData | null>(null);
  const [freshnessData, setFreshnessData] = useState<FreshnessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardRes, advisorRes, freshnessRes] = await Promise.all([
          fetch(`/api/dashboard?locale=${locale}`, { cache: "no-store" }),
          fetch(`/api/advisor?locale=${locale}`, { cache: "no-store" }),
          fetch(`/api/profile-freshness?locale=${locale}`, { cache: "no-store" }),
        ]);

        const dashboardJson = await dashboardRes.json();
        const advisorJson = await advisorRes.json();
        const freshnessJson = await freshnessRes.json();

        setData(dashboardJson);
        if (advisorRes.ok) {
          setAdvisorData(advisorJson);
        }
        if (freshnessRes.ok) {
          setFreshnessData(freshnessJson);
        }
      } catch (err) {
        console.error("Dashboard API error", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [locale]);

  if (loading) {
    return <Loading />;
  }

  const academic = data?.academic;
  const advisorInsights = advisorData?.insights ?? [];
  const profileAlerts = freshnessData?.alerts ?? [];
  const primaryAlert = profileAlerts[0] ?? null;
  const studyPrompts =
    locale === "ar"
      ? [
          { question: "ابنِ خطتي للفصل القادم", time: "منذ دقيقتين" },
          { question: "هل أنا معرض لتأخير التخرج؟", time: "منذ ساعة" },
          { question: "ما المقررات التي ينبغي أن آخذها الفصل القادم؟", time: "منذ 3 ساعات" },
        ]
      : [
          { question: "Build my next semester plan", time: "2 min ago" },
          { question: "Am I at risk of delaying graduation?", time: "1 hour ago" },
          { question: "What courses should I take next semester?", time: "3 hours ago" },
        ];

  const stats = [
    {
      icon: GraduationCap,
      label: copy.cgpa,
      value: academic?.cgpa ? academic.cgpa.toFixed(3) : "0.000",
      change: `${copy.cgpa}: ${academic?.totalCredits ?? 0}`,
      color: "from-green-500 to-emerald-500",
      glow: "from-green-400/25 to-emerald-400/25",
      badge: "text-green-700 bg-green-100",
    },
    {
      icon: Target,
      label: copy.activeCourses,
      value: academic?.activeCourses ?? 0,
      change: academic?.activeCourses ? copy.inProgress : copy.activeCoursesEmpty,
      color: "from-indigo-500 to-sky-500",
      glow: "from-indigo-400/25 to-sky-400/25",
      badge: "text-indigo-700 bg-indigo-100",
    },
    {
      icon: TrendingUp,
      label: copy.graduationProgress,
      value: `${academic?.progress ?? 0}%`,
      change: `${academic?.completedCredits ?? 0} / ${academic?.requiredCredits ?? 0} credits`,
      color: "from-blue-500 to-cyan-500",
      glow: "from-blue-400/25 to-cyan-400/25",
      badge: "text-blue-700 bg-blue-100",
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        variants={fadeInScale}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#102C57] mb-2">
            {copy.welcomeBack}, {data?.user?.name || "Student"}!
          </h1>

          <p className="text-[#102C57]/60">
            {copy.overviewSubtitle}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          {copy.startAiSession}
        </motion.button>
      </motion.div>

      {profileAlerts.length > 0 ? (
        <motion.section
          variants={fadeInScale}
          className="rounded-[2rem] border border-[#DAC0A3]/25 bg-gradient-to-r from-[#FFFDF9] to-[#F8F0E5] p-6 shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#102C57]/8 px-3 py-1 text-xs font-semibold text-[#102C57]">
                <BellRing className="h-3.5 w-3.5" />
                {copy.freshnessBadge}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-[#102C57]">
                {copy.freshnessTitle}
              </h2>
              <p className="mt-1 text-sm text-[#102C57]/60">
                {copy.freshnessDescription}
              </p>
            </div>
            {primaryAlert ? (
              <Link
                href={localizePath(primaryAlert.ctaHref)}
                className="rounded-xl bg-[#102C57] px-4 py-2 text-sm font-medium text-[#F8F0E5]"
              >
                {primaryAlert.ctaLabel}
              </Link>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {profileAlerts.map((alert) => {
              const toneClasses =
                alert.tone === "warning"
                  ? "border-amber-200 bg-amber-50/80"
                  : alert.tone === "success"
                    ? "border-green-200 bg-green-50/80"
                    : "border-blue-200 bg-blue-50/80";

              return (
                <div key={alert.id} className={`rounded-2xl border p-4 ${toneClasses}`}>
                  <p className="text-sm font-semibold text-[#102C57]">{alert.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#102C57]/75">{alert.message}</p>
                  <Link
                    href={localizePath(alert.ctaHref)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#102C57] underline underline-offset-4"
                  >
                    {alert.ctaLabel}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </motion.section>
      ) : null}

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={listItemVariants}
            whileHover={{ y: -4 }}
            className="relative group"
          >
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.glow} opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-inner`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <p className="text-sm text-[#102C57]/60 mb-1">{stat.label}</p>

              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-[#102C57]">
                  {stat.value}
                </span>

                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${stat.badge}`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Study Assistant */}
        <motion.div
          variants={fadeInScale}
          className="lg:col-span-2 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#102C57] flex items-center gap-2">
              <Brain className="w-5 h-5" />
              {copy.aiStudyAssistant}
            </h2>

            <motion.button
              whileHover={{ x: 4 }}
              className="text-sm text-[#102C57]/40 hover:text-[#102C57] flex items-center gap-1"
            >
              {copy.viewAll}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-4">
            {studyPrompts.map((item, index) => (
              <motion.div
                key={index}
                variants={listItemVariants}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />

                  <div>
                    <p className="text-sm font-medium text-[#102C57]">
                      {item.question}
                    </p>
                    <p className="text-xs text-[#102C57]/40">{item.time}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#102C57]/20" />
              </motion.div>
            ))}
          </div>

          {/* Ask AI */}
          <motion.div
            variants={fadeInScale}
            className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#102C57]/5 to-[#DAC0A3]/5 border border-[#DAC0A3]/20"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={copy.askAiPlaceholder}
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#102C57] placeholder-[#102C57]/40"
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#102C57] text-[#F8F0E5] rounded-xl text-sm font-medium"
              >
                {copy.send}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* AI Advisor Insight */}
        <motion.div
          variants={fadeInScale}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
        >
          <h2 className="text-lg font-semibold text-[#102C57] flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5" />
            {copy.advisorInsight}
          </h2>

          <div className="space-y-4">
            {advisorInsights.length > 0 ? (
              advisorInsights.map((insight) => {
                const toneClasses =
                  insight.tone === "warning"
                    ? "border-amber-200 bg-amber-50/70"
                    : insight.tone === "success"
                      ? "border-green-200 bg-green-50/70"
                      : "border-[#DAC0A3]/10 bg-[#F8F0E5]";

                return (
                  <div
                    key={insight.id}
                    className={`rounded-xl border p-4 ${toneClasses}`}
                  >
                    <p className="text-sm font-semibold text-[#102C57]">
                      {insight.title}
                    </p>
                    <p className="mt-2 text-sm text-[#102C57]/80">
                      {insight.message}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-[#F8F0E5] border border-[#DAC0A3]/10">
                <p className="text-sm text-[#102C57]">
                  {copy.noAdvisorInsights}{" "}
                  <b>
                    {academic?.completedCredits ?? 0} / {academic?.requiredCredits ?? 0} credits
                  </b>
                  .
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        variants={fadeInScale}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#DAC0A3]/20 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-[#102C57] mb-6">
          {copy.recentActivity}
        </h2>

        <div className="space-y-4">
          {data?.recentActivity?.map((item, index) => (
            <motion.div
              key={index}
              variants={listItemVariants}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-[#102C57]/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-[#102C57]" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-[#102C57]">
                  {item.action}
                </p>
                <p className="text-xs text-[#102C57]/60">{item.detail}</p>
                <p className="text-xs text-[#102C57]/40 mt-1">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
