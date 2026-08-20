"use client";

import { ORDER_STATUSES } from "@/types";
import type { Order, OrderItem, Client } from "@/types";
import { useRouter } from "next/navigation";

type OrderWithItems = Order & { items: Array<Pick<OrderItem, "product_name" | "product_sku" | "quantity" | "price">> };

interface Props {
  order: OrderWithItems;
  client?: Client | null;
}

const label = (text: string) => ({
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: 1.5,
  color: "#9ca3af",
  marginBottom: 6,
});

const fieldLabel = { fontSize: 11, color: "#6b7280", marginBottom: 2 } as const;
const fieldValue = { fontSize: 14, fontWeight: 600, color: "#111827" } as const;
const fieldValueMono = { ...fieldValue, fontFamily: "monospace" } as const;

export function InvoicePrintClient({ order, client }: Props) {
  const router = useRouter();
  const status = ORDER_STATUSES.find((s) => s.value === order.status);
  const items = order.items || [];
  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  const fullAddress = client
    ? [client.address, client.city, client.state, client.zip].filter(Boolean).join(", ")
    : null;

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      {/* Print controls */}
      <div
        className="print:hidden"
        style={{
          maxWidth: 800,
          margin: "0 auto 16px auto",
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => router.push("/admin/orders")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "#e5e7eb",
            color: "#374151",
          }}
        >
          ← Back to Orders
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "#1a1a1a",
            color: "#fff",
          }}
        >
          🖨️ Print
        </button>
        <button
          onClick={() => {
            document.title = `Invoice-${order.order_number}`;
            window.print();
          }}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            background: "#ff4757",
            color: "#fff",
          }}
        >
          ⬇️ Save as PDF
        </button>
      </div>

      {/* Invoice document */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#1a1a1a",
            color: "#fff",
            padding: "28px 36px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#ff4757", letterSpacing: "-0.5px" }}>
              LA SMOKES WHOLESALE
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, letterSpacing: 2, textTransform: "uppercase" }}>
              Invoice / Order Summary
            </div>
          </div>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#fff",
              background: status?.color || "#374151",
            }}
          >
            {status?.label || order.status}
          </div>
        </div>

        <div style={{ padding: 36 }}>

          {/* ── Top meta grid ─────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginBottom: 28,
            }}
          >
            {/* Order details */}
            <div>
              <div style={label("Order Details")}>Order Details</div>
              {[
                {
                  label: "Order Number",
                  value: order.order_number,
                  mono: true,
                  red: true,
                },
                {
                  label: "Date",
                  value: new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                },
                { label: "Status", value: status?.label || order.status },
              ].map(({ label: l, value, mono, red }) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <div style={fieldLabel}>{l}</div>
                  <div
                    style={{
                      ...( mono ? fieldValueMono : fieldValue),
                      ...(red ? { color: "#ff4757" } : {}),
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill To */}
            <div>
              <div style={label("Bill To")}>Bill To</div>
              {client ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <div style={fieldLabel}>Business</div>
                    <div style={{ ...fieldValue, fontSize: 15 }}>{client.business_name}</div>
                  </div>
                  {client.contact_name && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={fieldLabel}>Contact</div>
                      <div style={fieldValue}>{client.contact_name}</div>
                    </div>
                  )}
                  {(client.phone || order.customer_phone) && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={fieldLabel}>Phone</div>
                      <div style={fieldValue}>{client.phone || order.customer_phone}</div>
                    </div>
                  )}
                  {(client.email || order.customer_email) && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={fieldLabel}>Email</div>
                      <div style={fieldValue}>{client.email || order.customer_email}</div>
                    </div>
                  )}
                  {fullAddress && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={fieldLabel}>Address</div>
                      <div style={fieldValue}>{fullAddress}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {[
                    { label: "Name", value: order.customer_name },
                    { label: "Phone", value: order.customer_phone },
                    { label: "Email", value: order.customer_email },
                  ].map(({ label: l, value }) => (
                    <div key={l} style={{ marginBottom: 10 }}>
                      <div style={fieldLabel}>{l}</div>
                      <div style={fieldValue}>{value}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ── Compliance box (license numbers) ────────── */}
          {client && (client.tobacco_license_number || client.sellers_permit_number) && (
            <div
              style={{
                background: "#fff8f8",
                border: "1px solid #fecaca",
                borderLeft: "4px solid #ff4757",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 28,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <div style={{ ...label(""), marginBottom: 4 }}>Tobacco License No.</div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: 0.5,
                  }}
                >
                  {client.tobacco_license_number || "—"}
                </div>
              </div>
              <div>
                <div style={{ ...label(""), marginBottom: 4 }}>Sellers Permit No.</div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: 0.5,
                  }}
                >
                  {client.sellers_permit_number || "—"}
                </div>
              </div>
            </div>
          )}

          {/* ── Customer notes ───────────────────────────── */}
          {order.notes && (
            <div style={{ marginBottom: 24 }}>
              <div style={label("Customer Notes")}>Customer Notes</div>
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                {order.notes}
              </div>
            </div>
          )}

          {/* ── Line items ───────────────────────────────── */}
          <div style={label("Items Ordered")}>Items Ordered</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["SKU", "Product", "Qty", "Unit Price", "Subtotal"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 14px",
                      textAlign:
                        h === "Qty" ? "center" : ["Unit Price", "Subtotal"].includes(h) ? "right" : "left",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: "#6b7280",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#6b7280" }}>
                    {item.product_sku || "—"}
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 14 }}>{item.product_name}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, fontSize: 14 }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "monospace", fontSize: 13 }}>
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb" }}>
                <td
                  colSpan={4}
                  style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, fontSize: 13 }}
                >
                  Total
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: 17,
                    fontWeight: 900,
                    color: "#ff4757",
                  }}
                >
                  ${total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "20px 36px",
            textAlign: "center",
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          LA Smokes Wholesale · {new Date().getFullYear()} · Confidential · Internal Document
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
