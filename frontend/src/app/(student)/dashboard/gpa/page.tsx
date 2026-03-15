"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  GraduationCap,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  fadeInScale,
  listItemVariants,
  staggerContainer,
} from "@/components/animations";
import Loading from "@/components/Loading";

type GradeScaleItem = {
  label: string;
  points: number;
};

type AvailableCourse = {
  id: string;
  name: string;
  code: string;
  creditHours: number;
};

type CalculatorCourse = {
  id: string;
  courseId: string;
  creditHours: number;
  grade: string;
};

type GpaData = {
  user?: {
    name?: string;
  };
  academic?: {
    currentCgpa: number;
    completedCredits: number;
    gradedCredits: number;
    requiredCredits: number;
    remainingCredits: number;
    completedCourseCount: number;
    lastUpdated: string | null;
  };
  recentCompletedCourses?: Array<{
    name: string;
    code: string;
    creditHours: number;
    grade: string;
    gradePoints: number;
  }>;
  availableCourses?: AvailableCourse[];
  gradeScale?: GradeScaleItem[];
};

function createEmptyCourse(): CalculatorCourse {
  return {
    id: crypto.randomUUID(),
    courseId: "",
    creditHours: 0,
    grade: "A",
  };
}

export default function GpaPage() {
  const [data, setData] = useState<GpaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetCgpa, setTargetCgpa] = useState("");
  const [courses, setCourses] = useState<CalculatorCourse[]>([
    createEmptyCourse(),
    createEmptyCourse(),
    createEmptyCourse(),
  ]);

  useEffect(() => {
    async function loadGpaData() {
      try {
        const res = await fetch("/api/gpa", { cache: "no-store" });
        const json = (await res.json()) as GpaData | { error?: string };

        if (!res.ok) {
          throw new Error("error" in json ? json.error || "Failed to load GPA data" : "Failed to load GPA data");
        }

        setData(json as GpaData);
      } catch (error) {
        console.error("GPA API error", error);
      } finally {
        setLoading(false);
      }
    }

    loadGpaData();
  }, []);

  const academic = data?.academic;
  const availableCourses = data?.availableCourses ?? [];
  const gradeScale = data?.gradeScale ?? [
    { label: "A+", points: 4 },
    { label: "A", points: 4 },
    { label: "A-", points: 3.7 },
    { label: "B+", points: 3.3 },
    { label: "B", points: 3 },
    { label: "B-", points: 2.7 },
    { label: "C+", points: 2.3 },
    { label: "C", points: 2 },
    { label: "C-", points: 1.7 },
    { label: "D+", points: 1.3 },
    { label: "D", points: 1 },
    { label: "F", points: 0 },
  ];

  const gradeMap = useMemo(
    () =>
      Object.fromEntries(gradeScale.map((item) => [item.label, item.points])) as Record<string, number>,
    [gradeScale],
  );

  const semesterTotals = useMemo(() => {
    const totalCredits = courses.reduce((sum, course) => sum + Number(course.creditHours || 0), 0);
    const totalPoints = courses.reduce(
      (sum, course) => sum + (Number(course.creditHours || 0) * (gradeMap[course.grade] ?? 0)),
      0,
    );

    return {
      totalCredits,
      semesterGpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(3)) : 0,
      totalPoints,
    };
  }, [courses, gradeMap]);

  const projectedCgpa = useMemo(() => {
    if (!academic) return 0;

    const existingQualityPoints = academic.currentCgpa * academic.gradedCredits;
    const projectedCredits = academic.gradedCredits + semesterTotals.totalCredits;
    if (projectedCredits <= 0) return 0;

    return Number(
      ((existingQualityPoints + semesterTotals.totalPoints) / projectedCredits).toFixed(3),
    );
  }, [academic, semesterTotals]);

  const requiredSemesterGpa = useMemo(() => {
    const target = Number(targetCgpa);
    if (!academic || !target || semesterTotals.totalCredits <= 0) {
      return null;
    }

    const currentQualityPoints = academic.currentCgpa * academic.gradedCredits;
    const totalFutureCredits = academic.gradedCredits + semesterTotals.totalCredits;
    const requiredQualityPoints = target * totalFutureCredits;
    const neededThisSemester = (requiredQualityPoints - currentQualityPoints) / semesterTotals.totalCredits;

    return Number(neededThisSemester.toFixed(3));
  }, [academic, semesterTotals.totalCredits, targetCgpa]);

  const addCourse = () => setCourses((prev) => [...prev, createEmptyCourse()]);

  const removeCourse = (id: string) =>
    setCourses((prev) => (prev.length === 1 ? prev : prev.filter((course) => course.id !== id)));

  const updateCourseSelection = (id: string, courseId: string) => {
    const selectedCourse = availableCourses.find((course) => course.id === courseId);

    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? {
              ...course,
              courseId,
              creditHours: selectedCourse?.creditHours ?? 0,
            }
          : course,
      ),
    );
  };

  const updateCourseGrade = (id: string, grade: string) => {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, grade } : course)),
    );
  };

  const selectedCourseIds = new Set(
    courses.map((course) => course.courseId).filter((courseId) => courseId.length > 0),
  );

  if (loading) {
    return <Loading />;
  }

  const stats = [
    {
      icon: GraduationCap,
      label: "Current CGPA",
      value: academic?.currentCgpa?.toFixed(3) ?? "0.000",
      detail: `${academic?.gradedCredits ?? 0} graded credits`,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Calculator,
      label: "Projected Semester GPA",
      value: semesterTotals.semesterGpa.toFixed(3),
      detail: `${semesterTotals.totalCredits} planned credits`,
      color: "from-indigo-500 to-sky-500",
    },
    {
      icon: TrendingUp,
      label: "Projected CGPA",
      value: projectedCgpa.toFixed(3),
      detail: `${academic?.remainingCredits ?? 0} credits left after completed load`,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      <motion.section
        variants={fadeInScale}
        className="rounded-3xl border border-[#DAC0A3]/25 bg-gradient-to-br from-white to-[#F8F0E5] p-6 shadow-lg"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#102C57]">GPA Calculator</h1>
            <p className="mt-2 text-[#102C57]/65">
              Model your semester, project your cumulative GPA, and check what it takes to reach a target.
            </p>
          </div>
          <div className="rounded-2xl border border-[#DAC0A3]/30 bg-white/80 px-4 py-3 text-sm text-[#102C57]">
            <p className="font-medium">Student</p>
            <p className="text-[#102C57]/65">{data?.user?.name ?? "Student"}</p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        className="grid grid-cols-1 gap-5 md:grid-cols-3"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={listItemVariants}
            className="rounded-2xl border border-[#DAC0A3]/20 bg-white/75 p-5 shadow-lg"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color}`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm text-[#102C57]/60">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-[#102C57]">{stat.value}</p>
            <p className="mt-2 text-xs text-[#102C57]/60">{stat.detail}</p>
          </motion.div>
        ))}
      </motion.section>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          variants={listItemVariants}
          className="lg:col-span-2 rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#102C57]">Semester Projection</h2>
              <p className="text-sm text-[#102C57]/60">Add expected courses and grades for this term.</p>
            </div>
            <button
              onClick={addCourse}
              className="inline-flex items-center gap-2 rounded-xl bg-[#102C57] px-4 py-2 text-sm font-medium text-[#F8F0E5]"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>

          <div className="space-y-4">
            {courses.map((course, index) => {
              const selectedCourse = availableCourses.find(
                (catalogCourse) => catalogCourse.id === course.courseId,
              );
              const selectableCourses = availableCourses.filter(
                (catalogCourse) =>
                  catalogCourse.id === course.courseId || !selectedCourseIds.has(catalogCourse.id),
              );

              return (
              <div
                key={course.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-[#DAC0A3]/20 bg-[#F8F0E5]/70 p-4 md:grid-cols-[1.7fr,140px,120px,auto]"
              >
                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#102C57]/55">
                    Course {index + 1}
                  </span>
                  <select
                    value={course.courseId}
                    onChange={(e) => updateCourseSelection(course.id, e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  >
                    <option value="">Select a course</option>
                    {selectableCourses.map((catalogCourse) => (
                      <option key={catalogCourse.id} value={catalogCourse.id}>
                        {catalogCourse.code} - {catalogCourse.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#102C57]/55">
                    Credits
                  </span>
                  <div className="rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-2.5 text-[#102C57]">
                    {selectedCourse ? `${selectedCourse.creditHours} hrs` : "--"}
                  </div>
                </div>

                <label className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#102C57]/55">
                    Grade
                  </span>
                  <select
                    value={course.grade}
                    onChange={(e) => updateCourseGrade(course.id, e.target.value)}
                    className="w-full rounded-xl border border-[#DAC0A3]/35 bg-white px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/35"
                  >
                    {gradeScale.map((grade) => (
                      <option key={grade.label} value={grade.label}>
                        {grade.label} ({grade.points.toFixed(1)})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="inline-flex h-[46px] w-full items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
            })}
          </div>

          {availableCourses.length === 0 && (
            <p className="mt-4 text-sm text-[#102C57]/60">
              No courses were returned from the `courses` table yet.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#DAC0A3]/20 bg-white p-4">
              <p className="text-sm font-medium text-[#102C57]">Projected Results</p>
              <div className="mt-3 space-y-2 text-sm text-[#102C57]/75">
                <p>Semester GPA: <span className="font-semibold text-[#102C57]">{semesterTotals.semesterGpa.toFixed(3)}</span></p>
                <p>Projected CGPA: <span className="font-semibold text-[#102C57]">{projectedCgpa.toFixed(3)}</span></p>
                <p>Semester Credits: <span className="font-semibold text-[#102C57]">{semesterTotals.totalCredits}</span></p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DAC0A3]/20 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#102C57]" />
                <p className="text-sm font-medium text-[#102C57]">Target CGPA Check</p>
              </div>
              <input
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                placeholder="3.70"
                className="w-full rounded-xl border border-[#DAC0A3]/35 bg-[#F8F0E5] px-4 py-2.5 text-[#102C57] outline-none focus:border-[#102C57]/35"
              />
              <p className="mt-3 text-sm text-[#102C57]/75">
                Required semester GPA:{" "}
                <span className="font-semibold text-[#102C57]">
                  {requiredSemesterGpa === null ? "Enter a target and courses" : requiredSemesterGpa.toFixed(3)}
                </span>
              </p>
              {requiredSemesterGpa !== null && requiredSemesterGpa > 4 && (
                <p className="mt-2 text-xs text-red-600">
                  This target is above a 4.0 semester GPA with the current planned load.
                </p>
              )}
            </div>
          </div>
        </motion.section>

        <motion.aside
          variants={listItemVariants}
          className="space-y-6 rounded-2xl border border-[#DAC0A3]/25 bg-white/80 p-6 shadow-lg"
        >
          <div>
            <h3 className="text-lg font-semibold text-[#102C57]">Academic Snapshot</h3>
            <div className="mt-3 space-y-2 text-sm text-[#102C57]/75">
              <p>Completed credits: <span className="font-semibold text-[#102C57]">{academic?.completedCredits ?? 0}</span></p>
              <p>Required credits: <span className="font-semibold text-[#102C57]">{academic?.requiredCredits ?? 0}</span></p>
              <p>Remaining credits: <span className="font-semibold text-[#102C57]">{academic?.remainingCredits ?? 0}</span></p>
              <p>Completed courses: <span className="font-semibold text-[#102C57]">{academic?.completedCourseCount ?? 0}</span></p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#102C57]">Recent Completed Courses</h3>
            <div className="mt-3 space-y-3">
              {(data?.recentCompletedCourses ?? []).length === 0 ? (
                <p className="text-sm text-[#102C57]/60">No completed courses found yet.</p>
              ) : (
                data?.recentCompletedCourses?.map((course) => (
                  <div
                    key={`${course.code}-${course.name}`}
                    className="rounded-xl border border-[#DAC0A3]/20 bg-[#F8F0E5]/70 p-3"
                  >
                    <p className="text-sm font-medium text-[#102C57]">
                      {course.code} - {course.name}
                    </p>
                    <p className="mt-1 text-xs text-[#102C57]/65">
                      {course.creditHours} credits · Grade {course.grade} · {course.gradePoints.toFixed(1)} points
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </motion.div>
  );
}
