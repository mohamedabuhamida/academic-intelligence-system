import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_required_hours")
    .eq("id", user?.id)
    .single();

  const { data: courses } = await supabase
    .from("student_courses")
    .select("credits,status")
    .eq("user_id", user?.id)
    .eq("status", "completed");

  const completed =
    courses?.reduce((sum, c) => sum + (c.credits || 0), 0) || 0;

  const required = profile?.total_required_hours || 142;

  return NextResponse.json({
    completed,
    required,
    progress: Math.round((completed / required) * 100)
  });
}