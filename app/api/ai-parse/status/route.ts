import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = !!process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({ configured });
}
