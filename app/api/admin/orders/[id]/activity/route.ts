import { NextRequest, NextResponse } from "next/server";
import { logInvoiceActivity, getOrderActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    const activity = await getOrderActivity(id);
    return NextResponse.json({ activity }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    const { action_type, recipient_email, notes } = await request.json();
    if (!["printed", "emailed"].includes(action_type)) {
      return NextResponse.json({ error: "Invalid action_type" }, { status: 400 });
    }
    const entry = await logInvoiceActivity({ order_id: id, action_type, recipient_email, notes });
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
