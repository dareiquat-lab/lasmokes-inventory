"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp, Printer, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types";
import type { Order, OrderStatus, InvoiceActivity } from "@/types";
import { EmailInvoiceModal } from "@/components/admin/EmailInvoiceModal";

interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUSES.find(o => o.value === status);
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.color, color: "#ffffff" }}
    >
      {s.label}
    </span>
  );
}

function StatusSelector({ orderId, current, onChange }: {
  orderId: number;
  current: OrderStatus;
  onChange: (id: number, status: OrderStatus) => void;
}) {
  const s = ORDER_STATUSES.find(o => o.value === current);
  const color = s?.color ?? "#1565C0";
  return (
    <select
      value={current}
      onChange={e => onChange(orderId, e.target.value as OrderStatus)}
      className="font-jetbrains text-[9px] uppercase tracking-wider cursor-pointer focus:outline-none rounded-lg font-bold"
      style={{
        background: color,
        border: "none",
        color: "#ffffff",
        padding: "5px 10px",
        minWidth: "110px",
      }}
    >
      {ORDER_STATUSES.map(st => (
        <option key={st.value} value={st.value} style={{ background: st.color, color: "#ffffff" }}>
          {st.label}
        </option>
      ))}
    </select>
  );
}

function OrderRow({
  order,
  onStatusChange,
  onEmail,
}: {
  order: Order;
  onStatusChange: (id: number, status: OrderStatus) => void;
  onEmail: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activity, setActivity] = useState<InvoiceActivity[] | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const items = order.items || [];

  const handleExpand = useCallback(() => {
    setExpanded((e) => {
      const next = !e;
      if (next && activity === null) {
        setActivityLoading(true);
        fetch(`/api/admin/orders/${order.id}/activity`)
          .then((r) => r.json())
          .then((d) => setActivity(d.activity || []))
          .catch(() => setActivity([]))
          .finally(() => setActivityLoading(false));
      }
      return next;
    });
  }, [order.id, activity]);

  const handlePrint = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`/admin/orders/${order.id}/invoice`, "_blank");
      // Log print activity
      fetch(`/api/admin/orders/${order.id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: "printed" }),
      })
        .then((r) => r.json())
        .then((entry) => {
          if (activity !== null) {
            setActivity((prev) => (prev ? [entry, ...prev] : [entry]));
          }
        })
        .catch(() => {});
    },
    [order.id, activity]
  );

  const handleEmailClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEmail(order);
    },
    [onEmail, order]
  );

  return (
    <>
      <tr
        className={cn(
          "transition-colors cursor-pointer",
          expanded ? "bg-[#ff475706]" : "hover:bg-[#ff475704]"
        )}
        style={{ borderBottom: "1px solid #f0f2f5" }}
        onClick={handleExpand}
      >
        <td className="table-cell">
          <span className="font-jetbrains text-[#ff4757] text-xs font-bold">{order.order_number}</span>
        </td>
        <td className="table-cell">
          <div>
            <div className="font-sans text-xs text-[#2d3436] font-bold">{order.customer_name}</div>
            <div className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5">{order.customer_phone}</div>
          </div>
        </td>
        <td className="table-cell hidden sm:table-cell">
          <span className="font-jetbrains text-xs text-[#4a5568]">{order.customer_email}</span>
        </td>
        <td className="table-cell hidden md:table-cell">
          <span className="font-jetbrains text-xs text-[#4a5568]">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </td>
        <td className="table-cell hidden lg:table-cell">
          <span className="font-jetbrains text-[10px] text-[#babecc]">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="table-cell">
          <StatusBadge status={order.status} />
        </td>
        <td className="table-cell" onClick={(e) => e.stopPropagation()}>
          <StatusSelector orderId={order.id} current={order.status} onChange={onStatusChange} />
        </td>
        <td className="table-cell" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Print invoice"
              className="p-1.5 rounded-lg text-[#4a5568] hover:text-[#2d3436] hover:bg-[#babecc30] transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleEmailClick}
              title="Email invoice"
              className="p-1.5 rounded-lg text-[#4a5568] hover:text-[#ff4757] hover:bg-[#ff475710] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleExpand} className="p-1.5">
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#babecc]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#babecc]" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#ff475706]">
          <td colSpan={8} className="px-4 py-3">
            <div className="space-y-2">
              {items.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568] mb-2">
                    Items Ordered
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 font-jetbrains text-xs">
                      <span className="text-[#babecc] w-16">{item.product_sku || "—"}</span>
                      <span className="text-[#2d3436] flex-1">{item.product_name}</span>
                      <span className="text-[#ff4757] font-bold">×{item.quantity}</span>
                      <span className="text-[#4a5568]">${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-jetbrains text-xs text-[#babecc]">No items recorded</p>
              )}
              {order.notes && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid #babecc" }}>
                  <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568] mb-1">
                    Customer Notes
                  </div>
                  <p className="font-jetbrains text-xs text-[#4a5568]">{order.notes}</p>
                </div>
              )}
              {/* Activity log */}
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid #babecc" }}>
                <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568] mb-2">
                  Invoice Activity
                </div>
                {activityLoading ? (
                  <div className="font-jetbrains text-[10px] text-[#babecc] animate-pulse">Loading...</div>
                ) : activity && activity.length > 0 ? (
                  <div className="space-y-1">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 font-jetbrains text-[10px]">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wide"
                          style={{
                            fontSize: 8,
                            background: a.action_type === "emailed" ? "#6A1B9A" : "#374151",
                          }}
                        >
                          {a.action_type === "emailed" ? (
                            <Mail className="w-2.5 h-2.5" />
                          ) : (
                            <Printer className="w-2.5 h-2.5" />
                          )}
                          {a.action_type}
                        </span>
                        {a.recipient_email && (
                          <span className="text-[#4a5568]">{a.recipient_email}</span>
                        )}
                        <span className="text-[#babecc] ml-auto">
                          {new Date(a.performed_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-jetbrains text-[10px] text-[#babecc]">No activity yet</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function OrdersClient() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout>();
  const pendingIds = useRef<Set<number>>(new Set());
  const [emailModalOrder, setEmailModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        page: String(page),
        limit: "25",
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const json: PaginatedOrders = await res.json();
      setData(prev => {
        if (!prev || pendingIds.current.size === 0) return json;
        return {
          ...json,
          orders: json.orders.map(fresh =>
            pendingIds.current.has(fresh.id)
              ? (prev.orders.find(o => o.id === fresh.id) ?? fresh)
              : fresh
          ),
        };
      });
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 10_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleStatusChange = useCallback(async (orderId: number, status: OrderStatus) => {
    const originalStatus = data?.orders.find(o => o.id === orderId)?.status;

    pendingIds.current.add(orderId);

    setData(d => d
      ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status } : o) }
      : d
    );

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Status update failed:", err?.error ?? res.status);
        if (originalStatus) {
          setData(d => d
            ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status: originalStatus } : o) }
            : d
          );
        }
      }
    } catch (e) {
      console.error(e);
      if (originalStatus) {
        setData(d => d
          ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status: originalStatus } : o) }
          : d
        );
      }
    } finally {
      pendingIds.current.delete(orderId);
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babecc]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name, email, phone..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#babecc] hover:text-[#ff4757]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babecc] pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field pl-9 pr-8 min-w-[160px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="font-jetbrains text-[10px] text-[#babecc]">
          {data.total.toLocaleString()} order{data.total !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
          {statusFilter && ` · status: ${statusFilter}`}
        </div>
      )}

      {/* Table */}
      <div
        className="bg-[#e0e5ec] rounded-2xl overflow-hidden"
        style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #babecc" }}>
                <th className="table-header">Order #</th>
                <th className="table-header">Customer</th>
                <th className="table-header hidden sm:table-cell">Email</th>
                <th className="table-header hidden md:table-cell">Items</th>
                <th className="table-header hidden lg:table-cell">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Update</th>
                <th className="table-header w-8"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-[#d1d9e6] rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.orders.length ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-xl bg-[#e0e5ec] flex items-center justify-center"
                        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
                      >
                        <Search className="w-5 h-5 text-[#babecc]" />
                      </div>
                      <p className="font-jetbrains text-xs text-[#babecc] uppercase tracking-widest">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onEmail={setEmailModalOrder}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #babecc" }}>
            <span className="font-jetbrains text-[10px] text-[#babecc]">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 font-jetbrains text-[9px] text-[#4a5568] hover:text-[#ff4757] disabled:opacity-30 rounded-lg transition-all"
                style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 font-jetbrains text-[9px] text-[#4a5568] hover:text-[#ff4757] disabled:opacity-30 rounded-lg transition-all"
                style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {emailModalOrder && (
        <EmailInvoiceModal
          order={emailModalOrder}
          isOpen={!!emailModalOrder}
          onClose={() => setEmailModalOrder(null)}
          onSent={() => setEmailModalOrder(null)}
        />
      )}
    </div>
  );
}
