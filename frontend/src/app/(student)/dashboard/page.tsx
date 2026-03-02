import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { motion } from "framer-motion";
import { getDashboardData } from "@/lib/supabase/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { RecentGrades } from "@/components/dashboard/RecentGrades";
import { CourseProgress } from "@/components/dashboard/CourseProgress";
import { RiskAnalysis } from "@/components/dashboard/RiskAnalysis";
import { SemesterPlanner } from "@/components/dashboard/SemesterPlanner";
import { pageTransition } from "@/lib/animations";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can be ignored in Server Components if middleware refreshes sessions
          }
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }

  const dashboardData = await getDashboardData(session.user.id);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F8F0E5]">
          Welcome back, {dashboardData.profile?.full_name?.split(' ')[0] || 'Scholar'}
        </h1>
        <p className="text-[#EADBC8] mt-2">
          Here's your academic overview for the current semester
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#EADBC8] text-sm">Current GPA</p>
              <p className="text-3xl font-bold text-[#F8F0E5] mt-2">
                {dashboardData.gpaHistory[0]?.gpa.toFixed(2) || '3.75'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#DAC0A3]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-[#DAC0A3]">🎓</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#EADBC8] text-sm">Courses This Term</p>
              <p className="text-3xl font-bold text-[#F8F0E5] mt-2">
                {dashboardData.currentCourses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#DAC0A3]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-[#DAC0A3]">📚</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#EADBC8] text-sm">Credits Completed</p>
              <p className="text-3xl font-bold text-[#F8F0E5] mt-2">
                {dashboardData.profile?.total_required_hours || 45}/120
              </p>
            </div>
            <div className="w-12 h-12 bg-[#DAC0A3]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-[#DAC0A3]">⚡</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#EADBC8] text-sm">Risk Level</p>
              <p className="text-3xl font-bold text-[#F8F0E5] mt-2">
                {dashboardData.riskAnalysis[0]?.risk_level || 'Low'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#DAC0A3]/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-[#DAC0A3]">📊</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 columns wide */}
        <div className="lg:col-span-2 space-y-6">
          <SemesterPlanner plans={dashboardData.semesterPlans} />
          <CourseProgress courses={dashboardData.currentCourses} />
        </div>

        {/* Right Column - 1 column wide */}
        <div className="space-y-6">
          <UpcomingDeadlines deadlines={dashboardData.upcomingDeadlines} />
          <RecentGrades grades={dashboardData.recentGrades} />
          <RiskAnalysis risks={dashboardData.riskAnalysis} />
        </div>
      </div>
    </motion.div>
  );
}
