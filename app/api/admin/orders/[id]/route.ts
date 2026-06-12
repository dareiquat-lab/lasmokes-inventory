import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
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

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 500 });
    }

    // Fresh connection per-request — avoids any module-level caching issues
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!rows[0]) {
      return NextResponse.json({ error: `Order ${id} not found in DB` }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("PATCH /api/admin/orders/[id]:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
