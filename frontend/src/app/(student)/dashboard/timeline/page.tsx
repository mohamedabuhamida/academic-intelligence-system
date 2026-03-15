"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarRange,
  CheckCircle2,
  Flag,
  Layers3,
} from "lucide-react";

import {
  fadeInScale,
  listItemVariants,
  staggerContainer,
} from "@/components/animations";
import Loading from "@/components/Loading";

type TimelineCourse = {
  code: string;
  name: string;
  creditHours: number;
  status: string | null;
  grade: string | null;
};

type TimelineSemester = {
  id: string;
  name: string;
  term: string | null;
  academicYear: string | null;
  totalCredits: number;
  completedCredits: number;
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  statusCounts: {
    completed: number;
    current: number;
    planned: number;
    failed: number;
  };
  courses: TimelineCourse[];
};

type TimelineData = {
  user?: {
    name?: string;
  };
  summary?: {
    totalRequiredHours: number;
    completedCredits: number;
    remainingCredits: number;
    progress: number;
    semesterCount: number;
  };
  timeline?: TimelineSemester[];
};

function statusLabel(status: string | null) {
  switch (status) {
    case "completed":
      return "Completed";
    case "current":
      return "Current";
    case "planned":
      return "Planned";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
}

function statusClasses(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "current":
      return "bg-blue-100 text-blue-700";
    case "planned":
      return "bg-amber-100 text-amber-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function termLabel(term: string | null) {
  if (!term) return "Term";
  return term.charAt(0).toUpperCase() + term.slice(1);
}

function semesterAccent(index: number) {
  const accents = [
    "from-[#f6c453] to-[#f0a81b]",
    "from-[#9bc46b] to-[#6ca43f]",
    "from-[#7bb8d8] to-[#4e87b6]",
    "from-[#d6a76a] to-[#c5803e]",
  ];
  return accents[index % accents.length];
}

export default function TimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch("/api/timeline", { cache: "no-store" });
        const json = (await res.json()) as TimelineData;
        setData(json);
      } catch (error) {
        console.error("Timeline API error", error);
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const summary = data?.summary;
  const timeline = data?.timeline ?? [];

  const stats = [
    {
      icon: Layers3,
      label: "Semesters",
      value: summary?.semesterCount ?? 0,
      detail: "Tracked on your path",
      color: "from-[#102C57] to-[#1c4f93]",
    },
    {
      icon: CheckCircle2,
      label: "Completed Credits",
      value: summary?.completedCredits ?? 0,
      detail: `${summary?.progress ?? 0}% of degree complete`,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Flag,
      label: "Remaining Credits",
      value: summary?.remainingCredits ?? 0,
      detail: `${summary?.totalRequiredHours ?? 0} total required`,
      color: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.section
        variants={fadeInScale}
        className="overflow-hidden rounded-[2rem] border border-[#DAC0A3]/25 bg-[radial-gradient(circle_at_top_left,_rgba(16,44,87,0.10),_transparent_34%),linear-gradient(135deg,_#fffdf9_0%,_#f8f0e5_55%,_#f2e7d7_100%)] p-6 shadow-lg"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#102C57]/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#102C57]/60">
              <CalendarRange className="h-3.5 w-3.5" />
              Academic Journey
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#102C57] md:text-4xl">
              Semester Timeline
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#102C57]/65 md:text-base">
              Follow your academic path semester by semester, with course activity and credit progress in one place.
            </p>
          </div>

          <div className="min-w-[240px] rounded-3xl border border-white/80 bg-white/75 p-5 text-sm text-[#102C57] shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[#102C57]/45">Student</p>
            <p className="mt-2 text-lg font-semibold">{data?.user?.name ?? "Student"}</p>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[#102C57]/55">
                <span>Degree Progress</span>
                <span>{summary?.progress ?? 0}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#102C57]/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#102C57] to-[#d6a76a]"
                  style={{ width: `${summary?.progress ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={staggerContainer} className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={listItemVariants}
            className="rounded-[1.6rem] border border-[#DAC0A3]/20 bg-white/80 p-5 shadow-lg"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm uppercase tracking-[0.16em] text-[#102C57]/45">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-[#102C57]">{stat.value}</p>
            <p className="mt-2 text-xs text-[#102C57]/60">{stat.detail}</p>
          </motion.div>
        ))}
      </motion.section>

      {timeline.length === 0 ? (
        <motion.div
          variants={fadeInScale}
          className="rounded-3xl border border-dashed border-[#DAC0A3]/35 bg-white/70 px-4 py-12 text-center text-sm text-[#102C57]/60"
        >
          No semester activity found yet.
        </motion.div>
      ) : (
        <motion.section
          variants={staggerContainer}
          className="relative space-y-10 pb-6 before:absolute before:left-1/2 before:top-2 before:hidden before:h-[calc(100%-1rem)] before:w-[3px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-b before:from-[#e8dcc9] before:via-[#d9c4a6] before:to-[#eee3d3] lg:before:block"
        >
          {timeline.map((semester, index) => (
            <motion.div
              key={semester.id}
              variants={listItemVariants}
              className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] lg:items-center"
            >
              <div className={`${index % 2 === 0 ? "lg:col-start-1" : "lg:col-start-3"}`}>
                <div className="overflow-hidden rounded-[1.75rem] border border-[#d7cec0] bg-white shadow-[0_18px_45px_rgba(16,44,87,0.08)]">
                  <div className="border-b border-[#efe5d7] bg-[#fffdfa] px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-[#102C57]/45">
                          {semester.academicYear ?? "Academic Year"} {semester.term ? ` ${termLabel(semester.term)}` : ""}
                        </div>
                        <h2 className="mt-1 text-xl font-semibold text-[#102C57]">{semester.name}</h2>
                      </div>
                      <div className={`rounded-full bg-gradient-to-r ${semesterAccent(index)} px-4 py-1.5 text-sm font-semibold text-white shadow-sm`}>
                        {semester.semesterGpa !== null ? semester.semesterGpa.toFixed(3) : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="space-y-3">
                      {semester.courses.map((course) => (
                        <div
                          key={`${semester.id}-${course.code}-${course.name}`}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-medium text-[#42536b]">
                              {course.code} - {course.name}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${statusClasses(course.status)}`}>
                            {course.grade ?? statusLabel(course.status)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-dotted border-[#d9cdbd] pt-4 text-sm text-[#58697f]">
                      <div className="flex items-center justify-between">
                        <span>SP.Hrs: {semester.totalCredits}</span>
                        <span>SGPA: {semester.semesterGpa !== null ? semester.semesterGpa.toFixed(3) : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative hidden h-full items-center justify-center lg:flex">
                <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f8f0e5] bg-gradient-to-br ${semesterAccent(index)} text-sm font-bold text-white shadow-[0_10px_25px_rgba(16,44,87,0.16)]`}>
                  {semester.cumulativeGpa !== null ? semester.cumulativeGpa.toFixed(2) : "--"}
                </div>
                <div className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 translate-y-12 xl:block">
                  {/* <div className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6c7a8d] shadow-sm ring-1 ring-[#e6d7c2]">
                    CGPA {semester.cumulativeGpa !== null ? semester.cumulativeGpa.toFixed(3) : "N/A"}
                  </div> */}
                </div>
              </div>

              <div className={`${index % 2 === 0 ? "lg:col-start-3" : "lg:col-start-1"} hidden lg:block`} />
            </motion.div>
          ))}
        </motion.section>
      )}
    </motion.div>
  );
}
