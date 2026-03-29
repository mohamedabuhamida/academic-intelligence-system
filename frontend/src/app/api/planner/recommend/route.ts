import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPlannerEligibility, type EligibleCourse } from "../_lib";

type DPState = {
  score: number;
  selectedIds: string[];
};

function requiredSemesterGpa(
  currentCgpa: number,
  completedCredits: number,
  targetCgpa: number,
  plannedCredits: number
) {
  if (plannedCredits <= 0) return null;
  const currentQualityPoints = currentCgpa * completedCredits;
  const totalFutureCredits = completedCredits + plannedCredits;
  const targetQualityPoints = targetCgpa * totalFutureCredits;
  return Number(((targetQualityPoints - currentQualityPoints) / plannedCredits).toFixed(3));
}

function pickBestCourses(eligible: EligibleCourse[], plannedCredits: number) {
  const maxCredits = Math.max(0, Math.floor(plannedCredits));
  const dp: Array<DPState | null> = Array(maxCredits + 1).fill(null);
  dp[0] = { score: 0, selectedIds: [] };

  for (const course of eligible) {
    const c = Math.max(0, course.credit_hours || 0);
    if (c <= 0 || c > maxCredits) continue;

    const difficulty = Number(course.difficulty_level ?? 3);
    const score = difficulty * c;

    for (let credits = maxCredits; credits >= c; credits--) {
      const prev = dp[credits - c];
      if (!prev) continue;

      const candidate: DPState = {
        score: prev.score + score,
        selectedIds: [...prev.selectedIds, course.id],
      };

      if (!dp[credits] || candidate.score < (dp[credits] as DPState).score) {
        dp[credits] = candidate;
      }
    }
  }

  for (let credits = maxCredits; credits >= 0; credits--) {
    if (!dp[credits]) continue;
    const selectedSet = new Set((dp[credits] as DPState).selectedIds);
    const selectedCourses = eligible.filter((c) => selectedSet.has(c.id));
    return { selectedCourses, selectedCredits: credits };
  }

  return { selectedCourses: [] as EligibleCourse[], selectedCredits: 0 };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { targetCgpa?: number; plannedCredits?: number };
    const targetCgpa = Number(body?.targetCgpa ?? 0);
    const plannedCredits = Number(body?.plannedCredits ?? 0);

    if (!targetCgpa || !plannedCredits) {
      return NextResponse.json(
        { error: "targetCgpa and plannedCredits are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eligibility = await buildPlannerEligibility(user.id);
    const picked = pickBestCourses(eligibility.eligible, plannedCredits);
    const requiredGpa = requiredSemesterGpa(
      eligibility.currentCgpa,
      eligibility.completedCredits,
      targetCgpa,
      plannedCredits
    );

    return NextResponse.json({
      targetCgpa,
      plannedCredits,
      currentCgpa: eligibility.currentCgpa,
      completedCredits: eligibility.completedCredits,
      requiredSemesterGpa: requiredGpa,
      recommendedCourses: picked.selectedCourses,
      recommendedCredits: picked.selectedCredits,
      note:
        picked.selectedCredits < plannedCredits
          ? "Could not exactly match requested credits with current eligible set."
          : "Recommendation generated from eligible courses and difficulty weighting.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

