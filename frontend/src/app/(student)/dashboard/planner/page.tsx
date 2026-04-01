"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BookOpen,
  Calculator,
  CheckSquare,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  WandSparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createClient } from "@/lib/supabase/client";
import { getBackendUrl } from "@/lib/backend";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getMessages } from "@/lib/i18n/messages";
import { fadeInScale, listItemVariants, staggerContainer } from "@/components/animations";

const BACKEND_URL = getBackendUrl();

type EligibleCourse = {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  level: number | null;
  difficulty_level: number | null;
  missing_prerequisites: string[];
  can_register: boolean;
};

type NotEligibleCourse = {
  id: string;
  code: string;
  name: string;
  credit_hours: number;
  level: number | null;
  difficulty_level: number | null;
  reason: "missing_prerequisites" | "insufficient_completed_credits";
  missing_prerequisites: string[];
  required_credits?: number;
  current_completed_credits?: number;
};

type RecommendationResult = {
  requiredSemesterGpa: number | null;
  recommendedCourses: EligibleCourse[];
  recommendedCredits: number;
  note: string;
};

function detectTextDirection(text: string): "rtl" | "ltr" {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text) ? "rtl" : "ltr";
}

function formatPlannerQuestion(params: {
  locale: "en" | "ar";
  targetCgpa: string;
  plannedCredits: string;
  customText: string;
  selectedCourses: EligibleCourse[];
}) {
  const { locale, targetCgpa, plannedCredits, customText, selectedCourses } = params;
  const isArabic = locale === "ar";

  const parts: string[] = [];
  if (targetCgpa.trim()) {
    parts.push(
      isArabic ? `المعدل التراكمي المستهدف: ${targetCgpa.trim()}` : `Target CGPA: ${targetCgpa.trim()}`
    );
  }

  const selectedCredits = selectedCourses.reduce((sum, c) => sum + (c.credit_hours || 0), 0);
  const creditsToUse = plannedCredits.trim() || (selectedCredits > 0 ? String(selectedCredits) : "");
  if (creditsToUse) {
    parts.push(
      isArabic
        ? `الساعات المخططة لهذا الفصل: ${creditsToUse}`
        : `Planned credits this semester: ${creditsToUse}`
    );
  }

  if (selectedCourses.length > 0) {
    const lines = selectedCourses.map(
      (c) => isArabic ? `- ${c.code} (${c.credit_hours} ساعات)` : `- ${c.code} (${c.credit_hours} credits)`
    );
    parts.push(
      isArabic
        ? `المقررات المختارة للتسجيل:\n${lines.join("\n")}`
        : `Selected courses for registration:\n${lines.join("\n")}`
    );
  }

  if (customText.trim()) {
    parts.push(isArabic ? `طلب إضافي: ${customText.trim()}` : `Additional request: ${customText.trim()}`);
  }

  if (parts.length === 0) {
    return isArabic
      ? "ساعدني على رفع معدلي هذا الفصل. كم درجة A أو A+ أحتاج؟"
      : "Help me raise my GPA this semester. How many A or A+ grades do I need?";
  }

  return isArabic
    ? [
        "ابنِ لي خطة عملية لرفع المعدل التراكمي هذا الفصل.",
        ...parts,
        "استخدم المقررات المختارة وساعاتها الفعلية في الحسابات.",
        "احسب المطلوب مني واشرحه بوضوح مع سيناريوهات واقعية.",
      ].join("\n")
    : [
        "Build a practical plan to increase my cumulative GPA this semester.",
        ...parts,
        "Use the selected courses and their real credit hours in your calculations.",
        "Calculate what I need and explain clearly with realistic scenarios.",
      ].join("\n");
}

export default function PlannerPage() {
  const { locale } = useLocale();
  const copy = getMessages(locale).planner;
  const isArabic = locale === "ar";
  const supabase = useMemo(() => createClient(), []);
  const ui = {
    aiReady: isArabic ? "المخطط الذكي جاهز" : "Planner AI Ready",
    plannerInput: isArabic ? "مدخلات المخطط" : "Planner Input",
    selectedSummary: isArabic ? "المحدد" : "Selected",
    coursesCount: isArabic ? "مقرر" : "course(s)",
    creditsShort: isArabic ? "ساعة" : "credits",
    loadingAvailableCourses: isArabic ? "جاري تحميل المقررات المتاحة..." : "Loading available courses...",
    noEligibleCourses: isArabic ? "لا توجد مقررات متاحة." : "No eligible courses found.",
    creditShort: isArabic ? "س.م" : "cr",
    notEligibleCourses: isArabic ? "المقررات غير المتاحة" : "Not eligible courses",
    missingPrerequisites: isArabic ? "المتطلبات الناقصة" : "Missing prerequisites",
    requiresCompletedCredits: isArabic ? "يتطلب على الأقل" : "Requires at least",
    completedCreditsHave: isArabic ? "ساعة مكتملة (لديك" : "completed credits (you have",
    recommendationSummary: isArabic ? "ملخص التوصية" : "Recommendation Summary",
    requiredSemesterGpa: isArabic ? "معدل الفصل المطلوب" : "Required semester GPA",
    notAvailable: isArabic ? "غير متاح" : "N/A",
    recommending: isArabic ? "جارٍ الاقتراح..." : "Recommending...",
    generating: isArabic ? "جارٍ الإنشاء..." : "Generating...",
    guidance: isArabic ? "إرشادات" : "Guidance",
    guidance1: isArabic ? "اختر المقررات من قائمة المقررات المتاحة فقط." : "Choose courses from eligible list only.",
    guidance2: isArabic ? "يعتمد المخطط على المقررات المختارة والساعات الحقيقية لكل مقرر." : "Planner uses selected courses and real credit hours.",
    guidance3: isArabic ? "استخدم اقتراح أفضل المقررات للحصول على مزيج محسن من 18 ساعة." : 'Use "Suggest Best Courses" for an optimized 18-credit mix.',
    questionSent: isArabic ? "الطلب المرسل" : "Question Sent",
    plannerResponse: isArabic ? "رد المخطط" : "Planner Response",
    noAnswerReturned: isArabic ? "لم يتم إرجاع إجابة." : "No answer returned.",
    unexpectedError: isArabic ? "حدث خطأ غير متوقع." : "Unexpected error.",
    targetAndCreditsFirst: isArabic ? "أدخل المعدل المستهدف والساعات المخططة أولاً." : "Please enter target CGPA and planned credits first.",
    recommendationFailed: isArabic ? "فشل في توليد التوصية." : "Recommendation failed.",
    signInAgain: isArabic ? "يرجى تسجيل الدخول مرة أخرى للمتابعة." : "Please sign in again to continue.",
    requestFailed: isArabic ? "فشل الطلب." : "Request failed.",
  } as const;

  const [targetCgpa, setTargetCgpa] = useState("");
  const [plannedCredits, setPlannedCredits] = useState("");
  const [customText, setCustomText] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionUsed, setQuestionUsed] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [eligibleCourses, setEligibleCourses] = useState<EligibleCourse[]>([]);
  const [notEligibleCourses, setNotEligibleCourses] = useState<NotEligibleCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [recommending, setRecommending] = useState(false);

  const customTextDir = detectTextDirection(customText);
  const questionDir = detectTextDirection(questionUsed);
  const answerDir = detectTextDirection(answer);

  const selectedCourses = useMemo(
    () => eligibleCourses.filter((c) => selectedCourseIds.includes(c.id)),
    [eligibleCourses, selectedCourseIds]
  );

  const selectedCredits = useMemo(
    () => selectedCourses.reduce((sum, c) => sum + (c.credit_hours || 0), 0),
    [selectedCourses]
  );

  useEffect(() => {
    async function loadEligibleCourses() {
      setCoursesLoading(true);
      try {
        const res = await fetch("/api/planner/eligible-courses", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || copy.noEligibleCourses);
        }

        setEligibleCourses((json?.eligible || []) as EligibleCourse[]);
        setNotEligibleCourses((json?.notEligible || []) as NotEligibleCourse[]);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : copy.noEligibleCourses);
      } finally {
        setCoursesLoading(false);
      }
    }

    loadEligibleCourses();
  }, []);

  const quickPrompts = [
    isArabic ? "كم درجة A+ أحتاج هذا الفصل؟" : "How many A+ do I need this term?",
    isArabic ? "هل يمكنني الوصول إلى 3.7 بهذا العبء؟" : "Can I reach 3.7 with this selected load?",
    isArabic ? "أعطني خطة آمنة لرفع المعدل" : "Give me a low-risk GPA improvement plan",
  ];

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const suggestBestCourses = async () => {
    setError("");
    setRecommendation(null);
    setRecommending(true);
    try {
      const target = Number(targetCgpa);
      const planned = Number(plannedCredits || selectedCredits || 0);
      if (!target || !planned) {
        throw new Error(ui.targetAndCreditsFirst);
      }

      const res = await fetch("/api/planner/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCgpa: target, plannedCredits: planned, locale }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || ui.recommendationFailed);
      }

      const rec = json as RecommendationResult;
      setRecommendation(rec);
      setSelectedCourseIds(rec.recommendedCourses.map((c) => c.id));
      if (!plannedCredits) {
        setPlannedCredits(String(rec.recommendedCredits));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.recommendationFailed);
    } finally {
      setRecommending(false);
    }
  };

  const askPlanner = async () => {
    setError("");
    setLoading(true);
    setAnswer("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        throw new Error(ui.signInAgain);
      }

      const question = formatPlannerQuestion({
        locale,
        targetCgpa,
        plannedCredits,
        customText,
        selectedCourses,
      });
      setQuestionUsed(question);

      const res = await fetch(`${BACKEND_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const payload = await res.json();
      if (!res.ok) {
        const detail = payload?.detail || payload?.answer || ui.requestFailed;
        throw new Error(String(detail));
      }

      const responseText = payload?.answer ? String(payload.answer) : ui.noAnswerReturned;
      setAnswer(responseText);
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.unexpectedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <motion.div
        variants={fadeInScale}
        className={`rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className={isArabic ? "text-right" : "text-left"}>
            <h1 className="text-3xl font-bold text-[#102C57]">{copy.title}</h1>
            <p className="mt-2 text-[#102C57]/65">
              {copy.description}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#DAC0A3]/30 bg-white/80 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#102C57]" />
            <span className="text-sm font-medium text-[#102C57]">{ui.aiReady}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setCustomText(prompt)}
              className="rounded-lg border border-[#DAC0A3]/30 bg-white px-3 py-1.5 text-xs text-[#102C57]/75 hover:border-[#102C57]/30 hover:text-[#102C57]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          variants={listItemVariants}
          className={`lg:col-span-2 rounded-2xl border border-[#DAC0A3]/25 bg-white/75 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <div className={`mb-5 flex items-center gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
            <SlidersHorizontal className="h-5 w-5 text-[#102C57]" />
            <h2 className="text-lg font-semibold text-[#102C57]">{ui.plannerInput}</h2>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-[#102C57]/70">{copy.targetCgpa}</span>
              <input
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                placeholder="3.70"
                className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/40"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[#102C57]/70">{copy.plannedCredits} {isArabic ? "(اختياري)" : "(optional)"}</span>
              <input
                value={plannedCredits}
                onChange={(e) => setPlannedCredits(e.target.value)}
                placeholder={selectedCredits > 0 ? String(selectedCredits) : "18"}
                className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/40"
              />
            </label>
          </div>

          <label className="mb-4 block space-y-2">
            <span className="text-sm text-[#102C57]/70">{copy.yourRequest}</span>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              placeholder={copy.yourRequestPlaceholder}
              dir={customTextDir}
              className="w-full resize-y rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/40"
            />
          </label>

          <div className="mb-4 rounded-xl border border-[#DAC0A3]/25 bg-[#F8F0E5]/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-[#102C57]">{copy.eligibleCourses}</p>
              <span className="text-xs text-[#102C57]/65">
                {ui.selectedSummary}: {selectedCourses.length} {ui.coursesCount}, {selectedCredits} {ui.creditsShort}
              </span>
            </div>

            {coursesLoading ? (
              <p className="text-sm text-[#102C57]/60">{ui.loadingAvailableCourses}</p>
            ) : eligibleCourses.length === 0 ? (
              <p className="text-sm text-[#102C57]/60">{ui.noEligibleCourses}</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {eligibleCourses.map((course) => {
                  const selected = selectedCourseIds.includes(course.id);
                  return (
                    <button
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`w-full rounded-lg border px-3 py-2 ${isArabic ? "text-right" : "text-left"} transition ${
                        selected
                          ? "border-[#102C57]/40 bg-white"
                          : "border-[#DAC0A3]/35 bg-[#F8F0E5] hover:bg-white"
                      }`}
                    >
                      <div className={`flex items-center justify-between gap-3 ${isArabic ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2 text-[#102C57] ${isArabic ? "flex-row-reverse" : ""}`}>
                          {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          <span className="text-sm font-medium">{course.code}</span>
                          <span className="text-sm text-[#102C57]/80">{course.name}</span>
                        </div>
                        <span className="text-xs text-[#102C57]/70">{course.credit_hours} {ui.creditShort}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {notEligibleCourses.length > 0 && (
            <details className="mb-4 rounded-xl border border-[#DAC0A3]/25 bg-white/80 p-3">
              <summary className="cursor-pointer text-sm font-medium text-[#102C57]">
                {ui.notEligibleCourses} ({notEligibleCourses.length})
              </summary>
              <div className="mt-3 space-y-2">
                {notEligibleCourses.map((course) => (
                  <div key={course.id} className="rounded-lg border border-[#DAC0A3]/25 bg-[#F8F0E5] p-2.5">
                    <p className="text-sm font-medium text-[#102C57]">
                      {course.code} - {course.name} ({course.credit_hours} {ui.creditShort})
                    </p>
                    {course.reason === "missing_prerequisites" ? (
                      <p className="text-xs text-[#102C57]/70">
                        {ui.missingPrerequisites}: {course.missing_prerequisites.join(", ")}
                      </p>
                    ) : (
                      <p className="text-xs text-[#102C57]/70">
                        {ui.requiresCompletedCredits} {course.required_credits} {isArabic ? "ساعة مكتملة" : "completed credits"} ({isArabic ? `لديك ${course.current_completed_credits}` : `you have ${course.current_completed_credits}`})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}

          {recommendation && (
            <div className="mb-4 rounded-xl border border-[#DAC0A3]/25 bg-white p-3">
              <p className="text-sm font-medium text-[#102C57]">{ui.recommendationSummary}</p>
              <p className="mt-1 text-xs text-[#102C57]/70">
                {ui.requiredSemesterGpa}: <span className="font-semibold">{recommendation.requiredSemesterGpa ?? ui.notAvailable}</span>
              </p>
              <p className="text-xs text-[#102C57]/70">
                {copy.recommendedCredits}: <span className="font-semibold">{recommendation.recommendedCredits}</span>
              </p>
              <p className="mt-1 text-xs text-[#102C57]/65">{recommendation.note}</p>
            </div>
          )}

          <div className={`flex flex-wrap gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={suggestBestCourses}
              disabled={recommending || coursesLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#102C57]/20 bg-white px-4 py-2.5 text-[#102C57] disabled:opacity-60"
            >
              <WandSparkles className={`h-4 w-4 ${recommending ? "animate-pulse" : ""}`} />
              {recommending ? ui.recommending : copy.suggestBestCourses}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={askPlanner}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-2.5 text-[#F8F0E5] disabled:opacity-60"
            >
              {loading ? <Calculator className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {loading ? ui.generating : copy.askPlanner}
            </motion.button>
          </div>
        </motion.section>

        <motion.aside
          variants={listItemVariants}
          className={`rounded-2xl border border-[#DAC0A3]/25 bg-white/75 p-6 shadow-lg ${isArabic ? "text-right" : "text-left"}`}
        >
          <div className={`mb-4 flex items-center gap-2 ${isArabic ? "justify-end" : "justify-start"}`}>
            <BookOpen className="h-5 w-5 text-[#102C57]" />
            <h3 className="text-lg font-semibold text-[#102C57]">{ui.guidance}</h3>
          </div>
          <ul className={`list-disc space-y-2 text-sm text-[#102C57]/75 ${isArabic ? "pr-5" : "pl-5"}`}>
            <li>{ui.guidance1}</li>
            <li>{ui.guidance2}</li>
            <li>{ui.guidance3}</li>
          </ul>
        </motion.aside>
      </motion.div>

      {(questionUsed || answer || error) && (
        <motion.section
          initial="initial"
          animate="animate"
          variants={fadeInScale}
          className="rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg"
        >
          {questionUsed && (
            <div className="mb-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-[#102C57]/50">{ui.questionSent}</p>
              <pre className="whitespace-pre-wrap rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] p-3 text-sm text-[#102C57]">
                <span dir={questionDir} className="block text-start">{questionUsed}</span>
              </pre>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {answer && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-[#102C57]/50">{ui.plannerResponse}</p>
              <div dir={answerDir} className="ai-markdown rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] p-4 text-[#102C57]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </motion.section>
      )}

      <style jsx>{`
        .ai-markdown :global(h1) { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #102c57; }
        .ai-markdown :global(h2), .ai-markdown :global(h3) { font-weight: 600; margin-top: 0.8rem; margin-bottom: 0.4rem; color: #102c57; }
        .ai-markdown :global(p) { margin-bottom: 0.65rem; line-height: 1.75; color: rgba(16, 44, 87, 0.9); }
        .ai-markdown :global(ul), .ai-markdown :global(ol) { margin: 0.5rem 0 0.8rem; padding-left: 1.2rem; }
        .ai-markdown :global(li) { margin-bottom: 0.25rem; line-height: 1.65; }
        .ai-markdown :global(strong) { background: #fff; border: 1px solid rgba(218, 192, 163, 0.35); border-radius: 0.35rem; padding: 0 0.25rem; }
        .ai-markdown :global(hr) { border: none; border-top: 1px solid rgba(218, 192, 163, 0.5); margin: 0.8rem 0; }
      `}</style>
    </motion.div>
  );
}
