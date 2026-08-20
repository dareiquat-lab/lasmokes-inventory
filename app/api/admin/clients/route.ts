import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getClients({
      search: searchParams.get("search") || "",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "25"),
      type: searchParams.get("type") || "",
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("GET /api/admin/clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.business_name?.trim()) {
      return NextResponse.json({ error: "business_name is required" }, { status: 400 });
    }
    const client = await createClient(body);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/clients error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
