import { getOrders } from "@/lib/db";
import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import type { Order } from "@/types";
import { ORDER_STATUSES } from "@/types";

export const dynamic = "force-dynamic";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtMoney(items: Array<{ price: number | string; quantity: number }>) {
  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  return `$${total.toFixed(2)}`;
}

export default async function InvoicesPage() {
  const { orders } = await getOrders({ limit: 200 });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
            Invoices
          </h1>
          <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
            {orders.length} invoice{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <div
        className="bg-[var(--background)] rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-[var(--text-dim)] mx-auto mb-3" />
            <p className="font-jetbrains text-xs text-[var(--text-muted)] uppercase tracking-widest">
              No invoices yet
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {["Invoice #", "Date", "Customer", "Status", "Total", ""].map((h) => (
                  <th key={h} className="table-header first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(orders as Order[]).map((order, i) => {
                const statusDef = ORDER_STATUSES.find((s) => s.value === order.status);
                const items = (order.items ?? []) as Array<{ price: number | string; quantity: number }>;
                const isEven = i % 2 === 0;

                return (
                  <tr
                    key={order.id}
                    style={{ background: isEven ? "transparent" : "rgba(0,0,0,0.015)" }}
                  >
                    <td className="table-cell pl-6">
                      <span className="font-jetbrains text-xs font-black text-[#ff4757]">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-jetbrains text-xs text-[var(--text-muted)]">
                        {fmt(order.created_at)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="font-sans text-sm font-bold text-[var(--text)]">
                        {order.customer_name}
                      </div>
                      <div className="font-jetbrains text-[10px] text-[var(--text-dim)]">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ background: statusDef?.color || "#374151" }}
                      >
                        {statusDef?.label || order.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-jetbrains text-sm font-black text-[var(--text)]">
                        {items.length > 0 ? fmtMoney(items) : "—"}
                      </span>
                    </td>
                    <td className="table-cell pr-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 btn-secondary py-1.5 px-3"
                        style={{ fontSize: "10px" }}
                      >
                        <FileText className="w-3 h-3" />
                        View Invoice
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
