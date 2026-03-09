import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {

  try {

    const supabase = await createClient();

    // current logged user
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


    // Profile (name + required credits)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,total_required_hours")
      .eq("id", userId)
      .single();


    // GPA
    const { data: gpaData } = await supabase
      .from("gpa_history")
      .select("gpa")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();


    // Courses
    const { data: courses } = await supabase
      .from("student_courses")
      .select("id,status,credits")
      .eq("user_id", userId);


    // Active courses
    const activeCourses =
      courses?.filter((c) => c.status === "enrolled").length || 0;


    // Completed credits
    const completedCredits =
      courses
        ?.filter((c) => c.status === "completed")
        .reduce((sum, c) => sum + (c.credits || 0), 0) || 0;


    const requiredCredits = profile?.total_required_hours || 142;

    const progress = Math.round(
      (completedCredits / requiredCredits) * 100
    );


    // recent activity mock (later can be from DB)
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
console.log({

      user: {
        id: userId,
        name: profile?.full_name || "Student",
        email: user.email
      },

      gpa: gpaData?.gpa || 0,

      activeCourses,

      completedCredits,

      requiredCredits,

      progress,

      recentActivity

    })

    return NextResponse.json({

      user: {
        id: userId,
        name: profile?.full_name ,
        email: user.email
      },

      gpa: gpaData?.gpa || 0,

      activeCourses,

      completedCredits,

      requiredCredits,

      progress,

      recentActivity

    });

  } catch (error) {

    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );

  }

}