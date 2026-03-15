"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Plus, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { fadeInScale, listItemVariants, staggerContainer } from "@/components/animations";
import Loading from "@/components/Loading";

type University = { id: string; name: string };
type Semester = { id: string; name: string | null; term: string | null; academic_year: string | null };
type Course = { id: string; code: string | null; name: string; credit_hours: number; level: number | null };
type ExistingStudentCourse = {
  id: string;
  semester_id: string | null;
  course_id: string | null;
  status: string | null;
  grade: string | null;
  grade_points: number | null;
};

type HistoryRow = {
  id: string;
  semesterId: string;
  courseId: string;
  status: "completed" | "failed" | "current" | "planned";
  grade: string;
};

type OnboardingData = {
  profile?: {
    full_name?: string | null;
    department?: string | null;
    university_id?: string | null;
    total_required_hours?: number | null;
  } | null;
  universities: University[];
  semesters: Semester[];
  courses: Course[];
  studentCourses: ExistingStudentCourse[];
  gradeScale: Array<{ grade: string; points: number }>;
};

const steps = [
  { id: 0, title: "Personal Info", icon: UserRound },
  { id: 1, title: "Academic Setup", icon: GraduationCap },
  { id: 2, title: "Course History", icon: BookOpen },
];

function createHistoryRow(): HistoryRow {
  return {
    id: crypto.randomUUID(),
    semesterId: "",
    courseId: "",
    status: "completed",
    grade: "A",
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [data, setData] = useState<OnboardingData | null>(null);

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [totalRequiredHours, setTotalRequiredHours] = useState("142");
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([createHistoryRow()]);

  useEffect(() => {
    async function loadOnboarding() {
      try {
        const res = await fetch("/api/onboarding", { cache: "no-store" });
        const json = (await res.json()) as OnboardingData;

        if (!res.ok) {
          throw new Error("Failed to load onboarding data.");
        }

        setData(json);
        setFullName(json.profile?.full_name ?? "");
        setDepartment(json.profile?.department ?? "");
        setUniversityId(json.profile?.university_id ?? "");
        setTotalRequiredHours(String(json.profile?.total_required_hours ?? 142));

        if ((json.studentCourses ?? []).length > 0) {
          setHistoryRows(
            json.studentCourses.map((course) => ({
              id: course.id,
              semesterId: course.semester_id ?? "",
              courseId: course.course_id ?? "",
              status: (course.status as HistoryRow["status"]) ?? "completed",
              grade: course.grade ?? "A",
            })),
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load onboarding data.");
      } finally {
        setLoading(false);
      }
    }

    loadOnboarding();
  }, []);

  const gradeScale = data?.gradeScale ?? [];
  const gradePointMap = useMemo(
    () => Object.fromEntries(gradeScale.map((item) => [item.grade, item.points])) as Record<string, number>,
    [gradeScale],
  );

  const addHistoryRow = () => setHistoryRows((prev) => [...prev, createHistoryRow()]);

  const updateHistoryRow = (id: string, field: keyof Omit<HistoryRow, "id">, value: string) => {
    setHistoryRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              ...(field === "status" && (value === "current" || value === "planned")
                ? { grade: "" }
                : {}),
            }
          : row,
      ),
    );
  };

  const removeHistoryRow = (id: string) => {
    setHistoryRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  };

  const validateCurrentStep = () => {
    if (step === 0) {
      return fullName.trim() && department.trim();
    }

    if (step === 1) {
      return Number(totalRequiredHours) > 0;
    }

    return historyRows.every((row) => {
      const needsGrade = row.status === "completed" || row.status === "failed";
      return row.semesterId && row.courseId && (!needsGrade || row.grade);
    });
  };

  const saveOnboarding = async () => {
    setSaving(true);
    setError("");

    try {
      const payload = {
        fullName,
        department,
        universityId: universityId || null,
        totalRequiredHours: Number(totalRequiredHours),
        academicHistory: historyRows.map((row) => ({
          semesterId: row.semesterId,
          courseId: row.courseId,
          status: row.status,
          grade: row.status === "completed" || row.status === "failed" ? row.grade : null,
          gradePoints:
            row.status === "completed" || row.status === "failed"
              ? gradePointMap[row.grade] ?? 0
              : null,
        })),
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Failed to save onboarding.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save onboarding.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.section
        variants={fadeInScale}
        className="rounded-[2rem] border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg"
      >
        <h1 className="text-3xl font-bold text-[#102C57]">Complete Your Profile</h1>
        <p className="mt-2 max-w-2xl text-[#102C57]/65">
          Set up your student profile step by step, then add your academic history from the semester you started studying until now.
        </p>
      </motion.section>

      <motion.section variants={staggerContainer} className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <motion.aside
          variants={listItemVariants}
          className="rounded-3xl border border-[#DAC0A3]/25 bg-white/80 p-5 shadow-lg"
        >
          <div className="space-y-3">
            {steps.map((item) => {
              const active = item.id === step;
              const completed = item.id < step;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    active
                      ? "border-[#102C57] bg-[#102C57] text-[#F8F0E5]"
                      : completed
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-[#DAC0A3]/20 bg-[#F8F0E5]/50 text-[#102C57]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      {completed ? <CheckCircle2 className="h-5 w-5" /> : <item.icon className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] opacity-70">Step {item.id + 1}</div>
                      <div className="text-sm font-semibold">{item.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.aside>

        <motion.section
          variants={listItemVariants}
          className="rounded-3xl border border-[#DAC0A3]/25 bg-white/85 p-6 shadow-lg"
        >
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-[#102C57]">Personal Information</h2>
                <p className="mt-1 text-sm text-[#102C57]/60">Tell us who you are so the dashboard can personalize your experience.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#102C57]/70">Full name</span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#102C57]/70">Department</span>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-[#102C57]">Academic Setup</h2>
                <p className="mt-1 text-sm text-[#102C57]/60">Add the core details for your degree plan.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#102C57]/70">University</span>
                  <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  >
                    <option value="">Select a university</option>
                    {(data?.universities ?? []).map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#102C57]/70">Total required hours</span>
                  <input
                    type="number"
                    min="1"
                    value={totalRequiredHours}
                    onChange={(e) => setTotalRequiredHours(e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#102C57]">Academic History</h2>
                  <p className="mt-1 text-sm text-[#102C57]/60">
                    Add your courses from the start of your study journey. Include completed, failed, current, and planned courses.
                  </p>
                </div>

                <button
                  onClick={addHistoryRow}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-4 py-2.5 text-sm font-medium text-[#F8F0E5]"
                >
                  <Plus className="h-4 w-4" />
                  Add Row
                </button>
              </div>

              <div className="space-y-4">
                {historyRows.map((row, index) => {
                  const gradeNeeded = row.status === "completed" || row.status === "failed";

                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl border border-[#DAC0A3]/20 bg-[#F8F0E5]/55 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#102C57]">Entry {index + 1}</p>
                        <button
                          onClick={() => removeHistoryRow(row.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                          <span className="text-xs uppercase tracking-[0.14em] text-[#102C57]/55">Semester</span>
                          <select
                            value={row.semesterId}
                            onChange={(e) => updateHistoryRow(row.id, "semesterId", e.target.value)}
                            className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                          >
                            <option value="">Select semester</option>
                            {(data?.semesters ?? []).map((semester) => (
                              <option key={semester.id} value={semester.id}>
                                {[semester.academic_year, semester.term, semester.name].filter(Boolean).join(" - ")}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs uppercase tracking-[0.14em] text-[#102C57]/55">Course</span>
                          <select
                            value={row.courseId}
                            onChange={(e) => updateHistoryRow(row.id, "courseId", e.target.value)}
                            className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                          >
                            <option value="">Select course</option>
                            {(data?.courses ?? []).map((course) => (
                              <option key={course.id} value={course.id}>
                                {course.code ?? "N/A"} - {course.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs uppercase tracking-[0.14em] text-[#102C57]/55">Status</span>
                          <select
                            value={row.status}
                            onChange={(e) => updateHistoryRow(row.id, "status", e.target.value)}
                            className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35"
                          >
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="current">Current</option>
                            <option value="planned">Planned</option>
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs uppercase tracking-[0.14em] text-[#102C57]/55">Grade</span>
                          <select
                            value={row.grade}
                            disabled={!gradeNeeded}
                            onChange={(e) => updateHistoryRow(row.id, "grade", e.target.value)}
                            className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-3 text-[#102C57] outline-none focus:border-[#102C57]/35 disabled:opacity-50"
                          >
                            <option value="">No grade</option>
                            {gradeScale.map((grade) => (
                              <option key={grade.grade} value={grade.grade}>
                                {grade.grade} ({grade.points.toFixed(1)})
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="rounded-xl border border-[#DAC0A3]/25 bg-white px-4 py-3 text-sm font-medium text-[#102C57] disabled:opacity-40"
            >
              Back
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => {
                  if (!validateCurrentStep()) {
                    setError("Please complete the current step before continuing.");
                    return;
                  }
                  setError("");
                  setStep((prev) => Math.min(steps.length - 1, prev + 1));
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-3 text-sm font-medium text-[#F8F0E5]"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={saveOnboarding}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-5 py-3 text-sm font-medium text-[#F8F0E5] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Finish Setup"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.section>
      </motion.section>
    </motion.div>
  );
}
