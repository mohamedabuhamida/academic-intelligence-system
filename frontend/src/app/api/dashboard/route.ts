import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {

  try {

    const supabase = await createClient();

    // authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;


    // profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,total_required_hours")
      .eq("id", userId)
      .single();


    // latest GPA
    const { data: gpaData } = await supabase
      .from("gpa_history")
      .select("gpa")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();


    // courses with credit hours
    const { data: courses } = await supabase
      .from("student_courses")
      .select(`
        status,
        courses (
          credit_hours
        )
      `)
      .eq("user_id", userId);


    // active courses
    const activeCourses =
      courses?.filter((c) => c.status === "current").length || 0;


    // completed credits
    const completedCredits =
      courses
        ?.filter((c) => c.status === "completed")
        .reduce(
          (sum, c) => sum + (c.courses?.credit_hours || 0),
          0
        ) || 0;


    const requiredCredits = profile?.total_required_hours ?? 142;


    const progress = Math.round(
      (completedCredits / requiredCredits) * 100
    ) || 0;


    const recentActivity = [
      {
        action: "AI Generated Semester Plan",
        detail: "Recommended 15 credits",
        time: "Today"
      },
      {
        action: "Course Progress Updated",
        detail: `${completedCredits} credits completed`,
        time: "Yesterday"
      }
    ];


    const response = {

      user: {
        id: userId,
        name: profile?.full_name ?? "Student",
        email: user.email
      },

      gpa: Number(gpaData?.gpa) || 0,

      activeCourses,

      completedCredits,

      requiredCredits,

      progress,

      recentActivity

    };

    console.log("Dashboard Data:", response);

    return NextResponse.json(response);

  } catch (error) {

    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }

}