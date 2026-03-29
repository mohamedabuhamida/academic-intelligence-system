"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/client";
import { getBackendUrl } from "@/lib/backend";

type StudyCourse = {
  id: string;
  code: string;
  name: string;
  creditHours: number | null;
  difficultyLevel: number | null;
  semesterId: string | null;
};

type SemesterInfo = {
  id: string;
  name: string | null;
  term: string | null;
  academic_year: string | null;
} | null;

type Message = {
  id: string;
  type: "user" | "ai";
  content: string;
};

function termLabel(term: string | null | undefined) {
  if (term === "fall") return "Fall";
  if (term === "spring") return "Spring";
  if (term === "summer") return "Summer";
  return term ?? "Current semester";
}

function detectTextDirection(text: string): "rtl" | "ltr" {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text) ? "rtl" : "ltr";
}

export default function StudyChatPage() {
  const supabase = createClient();
  const backendUrl = getBackendUrl();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [courses, setCourses] = useState<StudyCourse[]>([]);
  const [currentSemester, setCurrentSemester] = useState<SemesterInfo>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      content:
        "## Study Chat\nاختر مادة من مواد السمستر الحالي، ثم اسأل عن شرح، تلخيص، مراجعة سريعة، أو تدريب على نقاط معينة داخل المقرر.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true);
      setError(null);

      try {
        const response = await fetch("/api/study/courses", { cache: "no-store" });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json?.error || "Failed to load current semester courses");
        }

        setCourses(json.courses ?? []);
        setCurrentSemester(json.currentSemester ?? null);

        if (json.courses?.length) {
          setSelectedCourseId(json.courses[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load study courses");
      } finally {
        setIsLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const quickPrompts = useMemo(() => {
    if (!selectedCourse) return [];

    return [
      `اشرحلي أهم topics في ${selectedCourse.code}`,
      `اعمللي ملخص سريع لمادة ${selectedCourse.name}`,
      `اختبرني quiz قصير في ${selectedCourse.code}`,
      `اعمل خطة مذاكرة أسبوعية لمادة ${selectedCourse.name}`,
    ];
  }, [selectedCourse]);

  async function handleSend() {
    if (!input.trim() || !selectedCourse || isSending) return;

    const question = input.trim();
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;
      if (!accessToken) {
        throw new Error("Missing Supabase access token");
      }

      const response = await fetch(`${backendUrl}/api/ask`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          question,
          context_mode: "study",
          course_code: selectedCourse.code,
          course_name: selectedCourse.name,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.answer || payload?.error || "Study chat request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: String(payload?.answer ?? "No answer returned."),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "حدث خطأ أثناء إرسال السؤال.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "ai",
          content: `حدث خطأ أثناء تجهيز الإجابة.\n\n${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[28px] border border-[#DAC0A3]/30 bg-white/90 p-6 shadow-[0_20px_60px_rgba(16,44,87,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#102C57]/6 px-3 py-1 text-xs font-semibold text-[#102C57]">
              <Sparkles className="h-3.5 w-3.5" />
              Subject-focused study assistant
            </div>
            <h1 className="text-3xl font-bold text-[#102C57]">Study Chat</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#102C57]/70">
              صفحة شات مخصصة للمذاكرة. اختر المادة من مواد السمستر الحالي، وسيبقى
              الحوار مركزًا على نفس المقرر أثناء الشرح والتلخيص والمراجعة.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DAC0A3]/25 bg-[#F8F0E5] px-4 py-3 text-sm text-[#102C57]">
            <div className="flex items-center gap-2 font-semibold">
              <BookOpen className="h-4 w-4" />
              <span>{currentSemester?.name ?? "Current Semester"}</span>
            </div>
            <p className="mt-1 text-xs text-[#102C57]/60">
              {currentSemester
                ? `${termLabel(currentSemester.term)} ${currentSemester.academic_year ?? ""}`.trim()
                : "Your currently registered courses will appear here."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-[24px] border border-[#DAC0A3]/30 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#102C57]">مواد السمستر الحالي</h2>
              <p className="text-xs text-[#102C57]/55">اختر المادة التي تريد المذاكرة عليها الآن.</p>
            </div>
            <span className="rounded-full bg-[#102C57]/6 px-2.5 py-1 text-xs font-semibold text-[#102C57]">
              {courses.length}
            </span>
          </div>

          {isLoadingCourses ? (
            <div className="flex items-center gap-2 rounded-2xl bg-[#F8F0E5] px-4 py-5 text-sm text-[#102C57]/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري تحميل موادك الحالية...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DAC0A3]/40 bg-[#F8F0E5]/70 px-4 py-5 text-sm text-[#102C57]/70">
              لا توجد مواد بحالة <code>current</code> في بياناتك الآن.
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const active = course.id === selectedCourseId;

                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-right transition-all ${
                      active
                        ? "border-[#102C57] bg-[#102C57] text-[#F8F0E5] shadow-lg shadow-[#102C57]/20"
                        : "border-[#DAC0A3]/30 bg-[#FCFAF7] text-[#102C57] hover:border-[#102C57]/35 hover:bg-[#F8F0E5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{course.code}</div>
                        <div className={`mt-1 text-xs leading-6 ${active ? "text-[#F8F0E5]/80" : "text-[#102C57]/65"}`}>
                          {course.name}
                        </div>
                        <div className={`mt-3 text-[11px] ${active ? "text-[#F8F0E5]/70" : "text-[#102C57]/50"}`}>
                          {course.creditHours ?? "-"} credit hours
                        </div>
                      </div>
                      {active ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="flex min-h-[680px] flex-col rounded-[24px] border border-[#DAC0A3]/30 bg-white shadow-sm">
          <div className="border-b border-[#DAC0A3]/20 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#102C57]">
                  {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : "اختر مادة أولًا"}
                </h2>
                <p className="mt-1 text-xs text-[#102C57]/55">
                  اسأل عن المفاهيم، الملخصات، التمارين، أو خطة مذاكرة مرتبطة بالمادة المختارة.
                </p>
              </div>
              {selectedCourse ? (
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#F8F0E5] px-3 py-1 text-xs font-medium text-[#102C57]">
                  <Brain className="h-3.5 w-3.5" />
                  Subject locked
                </div>
              ) : null}
            </div>

            {quickPrompts.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="rounded-full border border-[#DAC0A3]/30 bg-[#FCFAF7] px-3 py-1.5 text-xs text-[#102C57] transition hover:border-[#102C57]/30 hover:bg-[#F8F0E5]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message) => {
              const dir = detectTextDirection(message.content);
              const isAi = message.type === "ai";

              return (
                <div
                  key={message.id}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-3xl rounded-3xl px-4 py-3 ${
                      isAi
                        ? "border border-[#DAC0A3]/25 bg-[#FCFAF7] text-[#102C57]"
                        : "bg-[#102C57] text-[#F8F0E5]"
                    }`}
                  >
                    {isAi ? (
                      <div className="prose prose-sm max-w-none text-inherit">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-7" dir={dir}>
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending ? (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-[#DAC0A3]/25 bg-[#FCFAF7] px-4 py-3 text-sm text-[#102C57]/70">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري تجهيز الإجابة...</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#DAC0A3]/20 px-5 py-4">
            {error ? (
              <p className="mb-3 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                disabled={!selectedCourse || isSending}
                placeholder={
                  selectedCourse
                    ? `اسأل عن ${selectedCourse.code}...`
                    : "اختر مادة أولًا حتى تبدأ الشات"
                }
                className="flex-1 rounded-2xl border border-[#DAC0A3]/30 bg-[#FCFAF7] px-4 py-3 text-sm text-[#102C57] outline-none transition focus:border-[#102C57]/40"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!selectedCourse || !input.trim() || isSending}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102C57] px-5 py-3 text-sm font-semibold text-[#F8F0E5] transition hover:bg-[#0d2447] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
