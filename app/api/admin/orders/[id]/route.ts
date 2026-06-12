import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = ["new", "contacted", "ready", "completed", "cancelled"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();
    const status: OrderStatus = body.status;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status: "${status}"` }, { status: 400 });
    }

    const order = await updateOrderStatus(id, status);
    if (!order) {
      return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PATCH /api/admin/orders/[id]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
