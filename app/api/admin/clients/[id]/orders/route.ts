import { NextRequest, NextResponse } from "next/server";
import { getOrdersByClientId } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    const orders = await getOrdersByClientId(id);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/admin/clients/[id]/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch client orders" }, { status: 500 });
  }
}
