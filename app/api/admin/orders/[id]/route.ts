import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, updateOrder, getOrderById, deleteOrder } from "@/lib/db";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

const VALID_STATUSES: OrderStatus[] = ["new", "contacted", "ready", "completed", "cancelled"];

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json(order, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const body = await request.json();
    const { customer_name, customer_phone, customer_email, notes, items,
            business_name, tobacco_license_number, sellers_permit_number } = body;

    if (!customer_name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!customer_phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    if (!customer_email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!Array.isArray(items) || !items.length) return NextResponse.json({ error: "No items" }, { status: 400 });

    const order = await updateOrder(id, {
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email.trim(),
      notes: notes?.trim() || undefined,
      business_name: business_name?.trim() || null,
      tobacco_license_number: tobacco_license_number?.trim() || null,
      sellers_permit_number: sellers_permit_number?.trim() || null,
      items,
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json(order);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PUT /api/admin/orders/[id]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("DELETE /api/admin/orders/[id]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
