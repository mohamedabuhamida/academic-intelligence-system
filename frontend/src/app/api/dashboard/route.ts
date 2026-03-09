import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {

  const supabase = await createClient();

  // get current logged user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  // GPA
  const { data: gpaData } = await supabase
    .from("gpa_history")
    .select("gpa")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single();

  // courses
  const { data: courses } = await supabase
    .from("student_courses")
    .select("id,status,credits")
    .eq("user_id", userId);

  // profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_required_hours")
    .eq("id", userId)
    .single();

  const completedCredits =
    courses?.filter((c) => c.status === "completed")
      .reduce((sum, c) => sum + (c.credits || 0), 0) || 0;

  const requiredCredits = profile?.total_required_hours || 142;

  const progress = Math.round((completedCredits / requiredCredits) * 100);

  return NextResponse.json({
    gpa: gpaData?.gpa || 0,
    activeCourses: courses?.length || 0,
    completedCredits,
    requiredCredits,
    progress
  });
}