import { NextRequest, NextResponse } from "next/server";
import { getProfitData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const data = await getProfitData({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/profit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
