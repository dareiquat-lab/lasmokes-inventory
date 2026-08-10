import { NextResponse } from "next/server";
import { getProfitData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getProfitData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/profit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
