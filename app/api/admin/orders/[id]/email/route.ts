import { NextRequest, NextResponse } from "next/server";
import { getOrderById, logInvoiceActivity } from "@/lib/db";
import type { Order, OrderItem } from "@/types";

export const dynamic = "force-dynamic";

type OrderWithItems = Order & { items: Array<Pick<OrderItem, "product_name" | "product_sku" | "quantity" | "price">> };

function buildEmailHtml(order: OrderWithItems, message?: string): string {
  const statusColors: Record<string, string> = {
    new: "#1565C0",
    contacted: "#6A1B9A",
    ready: "#E65100",
    completed: "#2E7D32",
    cancelled: "#B71C1C",
  };

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;color:#4b5563">${item.product_sku || "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px">${item.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700">×${item.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace">$${Number(item.price).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const total = (order.items || []).reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#1a1a1a;padding:28px 32px;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="color:#ff4757;font-size:22px;font-weight:900;letter-spacing:-0.5px">LA SMOKES</div>
        <div style="color:#9ca3af;font-size:11px;margin-top:4px;letter-spacing:1px;text-transform:uppercase">Invoice / Order Summary</div>
      </div>
      <div style="background:${statusColors[order.status] || "#374151"};color:#fff;padding:6px 14px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${order.status}</div>
    </div>
    <div style="padding:28px 32px">
      ${message ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:24px;color:#92400e;font-size:14px">${message}</div>` : ""}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Order Number</td><td style="font-weight:700;font-size:14px">${order.order_number}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Date</td><td style="font-size:14px">${new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Customer</td><td style="font-weight:600;font-size:14px">${order.customer_name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Phone</td><td style="font-size:14px">${order.customer_phone}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="font-size:14px">${order.customer_email}</td></tr>
        ${order.notes ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;vertical-align:top">Notes</td><td style="font-size:14px;color:#374151">${order.notes}</td></tr>` : ""}
      </table>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px">Items Ordered</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead><tr style="background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">SKU</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Price</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot><tr style="background:#f9fafb">
          <td colspan="3" style="padding:10px 12px;font-weight:700;text-align:right">Total</td>
          <td style="padding:10px 12px;font-weight:900;text-align:right;font-family:monospace;font-size:15px">$${total.toFixed(2)}</td>
        </tr></tfoot>
      </table>
      <div style="border-top:1px solid #e5e7eb;padding-top:16px;color:#9ca3af;font-size:11px;text-align:center">LA Smokes · This is an automated invoice summary.</div>
    </div>
  </div></body></html>`;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service not configured. Add RESEND_API_KEY to environment variables." },
      { status: 503 }
    );
  }

  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });

    const { to, subject, message } = await request.json();
    if (!to) return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });

    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const fromEmail = process.env.EMAIL_FROM || "LA Smokes <noreply@lasmokes.com>";
    const emailSubject = subject || `Order Invoice - ${order.order_number}`;
    const html = buildEmailHtml(order as OrderWithItems, message);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: fromEmail, to, subject: emailSubject, html }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { message?: string }).message || "Email delivery failed" },
        { status: 502 }
      );
    }

    await logInvoiceActivity({
      order_id: id,
      action_type: "emailed",
      recipient_email: to,
      notes: emailSubject,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
