// app/api/debug/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Test each query separately
    const profile = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const gpa = await supabase
      .from("gpa_history")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });

    const courses = await supabase
      .from("student_courses")
      .select(`
        *,
        courses (*)
      `)
      .eq("user_id", userId);

    return NextResponse.json({
      user,
      profile: profile.data,
      profileError: profile.error,
      gpa: gpa.data,
      gpaError: gpa.error,
      courses: courses.data,
      coursesError: courses.error,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}