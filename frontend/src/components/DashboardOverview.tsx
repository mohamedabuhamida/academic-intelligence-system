// app/dashboard/components/DashboardOverview.tsx (updated stats section)
const stats = [
  {
    icon: GraduationCap,
    label: "CGPA",
    value: data?.gpa ? data.gpa.toFixed(3) : "0",
    change: `Based on ${data?.completedCredits || 0} credits`,
    color: "from-green-500 to-emerald-500",
    glow: "from-green-400/25 to-emerald-400/25",
    badge: "text-green-700 bg-green-100",
  },
  {
    icon: Target,
    label: "Active Courses",
    value: data?.activeCourses ?? 0,
    change: data?.activeCourses ? "In progress" : "No active courses",
    color: "from-indigo-500 to-sky-500",
    glow: "from-indigo-400/25 to-sky-400/25",
    badge: "text-indigo-700 bg-indigo-100",
  },
  {
    icon: TrendingUp,
    label: "Graduation Progress",
    value: `${data?.progress ?? 0}%`,
    change: `${data?.completedCredits ?? 0} / ${data?.requiredCredits ?? 0} credits`,
    color: "from-blue-500 to-cyan-500",
    glow: "from-blue-400/25 to-cyan-400/25",
    badge: "text-blue-700 bg-blue-100",
  },
];