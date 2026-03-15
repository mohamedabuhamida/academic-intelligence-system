import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Advisor endpoint is not implemented yet." },
    { status: 501 },
  );
}
