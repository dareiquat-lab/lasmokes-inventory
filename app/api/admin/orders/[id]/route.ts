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

    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await updateOrderStatus(id, status);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
