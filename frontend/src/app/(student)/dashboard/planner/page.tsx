"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Send,
  Target,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createClient } from "@/lib/supabase/client";
import {
  fadeInScale,
  staggerContainer,
  listItemVariants,
} from "@/components/animations";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function detectTextDirection(text: string): "rtl" | "ltr" {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text) ? "rtl" : "ltr";
}

function formatPlannerQuestion(params: {
  targetCgpa: string;
  plannedCredits: string;
  customText: string;
}) {
  const { targetCgpa, plannedCredits, customText } = params;

  const parts: string[] = [];
  if (targetCgpa.trim()) parts.push(`Target CGPA: ${targetCgpa.trim()}`);
  if (plannedCredits.trim()) {
    parts.push(`Planned credits this semester: ${plannedCredits.trim()}`);
  }
  if (customText.trim()) parts.push(`Additional request: ${customText.trim()}`);

  if (parts.length === 0) {
    return "Help me raise my GPA this semester. How many A or A+ grades do I need?";
  }

  return [
    "Build a practical plan to increase my cumulative GPA this semester.",
    ...parts,
    "Calculate what I need and explain clearly with realistic scenarios.",
  ].join("\n");
}

export default function PlannerPage() {
  const supabase = useMemo(() => createClient(), []);

  const [targetCgpa, setTargetCgpa] = useState("");
  const [plannedCredits, setPlannedCredits] = useState("");
  const [customText, setCustomText] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionUsed, setQuestionUsed] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const customTextDir = detectTextDirection(customText);
  const questionDir = detectTextDirection(questionUsed);
  const answerDir = detectTextDirection(answer);

  const quickPrompts = [
    "How many A+ do I need this term?",
    "Can I reach 3.7 with 18 credits?",
    "Give me a low-risk GPA improvement plan",
  ];

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
        throw new Error("Please sign in again to continue.");
      }

      const question = formatPlannerQuestion({ targetCgpa, plannedCredits, customText });
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
        const detail = payload?.detail || payload?.answer || "Request failed.";
        throw new Error(String(detail));
      }

      const responseText = payload?.answer
        ? String(payload.answer)
        : "No answer returned.";
      setAnswer(responseText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.div
        variants={fadeInScale}
        className="rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#102C57]">Semester Planner</h1>
            <p className="mt-2 text-[#102C57]/65">
              Ask the planner agent for GPA strategy, target simulations, and
              practical course-load advice.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#DAC0A3]/30 bg-white/80 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#102C57]" />
            <span className="text-sm font-medium text-[#102C57]">Planner AI Ready</span>
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
          className="lg:col-span-2 rounded-2xl border border-[#DAC0A3]/25 bg-white/75 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#102C57]" />
            <h2 className="text-lg font-semibold text-[#102C57]">Planner Input</h2>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-[#102C57]/70">Target CGPA</span>
              <input
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                placeholder="3.70"
                className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/40"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[#102C57]/70">Planned Credits</span>
              <input
                value={plannedCredits}
                onChange={(e) => setPlannedCredits(e.target.value)}
                placeholder="18"
                className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/40"
              />
            </label>
          </div>

          <label className="mb-4 block space-y-2">
            <span className="text-sm text-[#102C57]/70">What do you want from the planner?</span>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={5}
              placeholder="Example: How many A or A+ grades do I need this term?"
              dir={customTextDir}
              className="w-full resize-y rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/40"
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={askPlanner}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-2.5 text-[#F8F0E5] disabled:opacity-60"
          >
            {loading ? (
              <Calculator className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "Generating..." : "Generate Plan"}
          </motion.button>
        </motion.section>

        <motion.aside
          variants={listItemVariants}
          className="rounded-2xl border border-[#DAC0A3]/25 bg-white/75 p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#102C57]" />
            <h3 className="text-lg font-semibold text-[#102C57]">Guidance</h3>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[#102C57]/75">
            <li>Use target CGPA to get exact semester GPA requirement.</li>
            <li>Add credit load for practical scenarios.</li>
            <li>Ask follow-up questions to refine the strategy.</li>
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
              <p className="mb-1 text-xs uppercase tracking-wide text-[#102C57]/50">Question Sent</p>
              <pre className="whitespace-pre-wrap rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] p-3 text-sm text-[#102C57]">
                <span dir={questionDir} className="block text-start">
                {questionUsed}
                </span>
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
              <p className="mb-2 text-xs uppercase tracking-wide text-[#102C57]/50">Planner Response</p>
              <div
                dir={answerDir}
                className="ai-markdown rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5] p-4 text-[#102C57]"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </motion.section>
      )}

      <style jsx>{`
        .ai-markdown :global(h1) {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #102c57;
        }
        .ai-markdown :global(h2),
        .ai-markdown :global(h3) {
          font-weight: 600;
          margin-top: 0.8rem;
          margin-bottom: 0.4rem;
          color: #102c57;
        }
        .ai-markdown :global(p) {
          margin-bottom: 0.65rem;
          line-height: 1.75;
          color: rgba(16, 44, 87, 0.9);
        }
        .ai-markdown :global(ul),
        .ai-markdown :global(ol) {
          margin: 0.5rem 0 0.8rem;
          padding-left: 1.2rem;
        }
        .ai-markdown :global(li) {
          margin-bottom: 0.25rem;
          line-height: 1.65;
        }
        .ai-markdown :global(strong) {
          background: #fff;
          border: 1px solid rgba(218, 192, 163, 0.35);
          border-radius: 0.35rem;
          padding: 0 0.25rem;
        }
        .ai-markdown :global(hr) {
          border: none;
          border-top: 1px solid rgba(218, 192, 163, 0.5);
          margin: 0.8rem 0;
        }
      `}</style>
    </motion.div>
  );
}
