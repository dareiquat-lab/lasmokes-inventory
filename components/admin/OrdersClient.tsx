"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types";
import type { Order, OrderStatus } from "@/types";

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
      className="badge font-orbitron"
      style={{ color: s.color, borderColor: `${s.color}40`, background: `${s.color}10` }}
    >
      {s.label}
    </span>
  );
}

function StatusSelector({ orderId, current, onChange, error }: {
  orderId: number;
  current: OrderStatus;
  onChange: (id: number, status: OrderStatus) => void;
  error?: string;
}) {
  const s = ORDER_STATUSES.find(o => o.value === current);
  const color = s?.color ?? "#00ff88";

  return (
    <div className="flex flex-col gap-1">
      <select
        value={current}
        onChange={e => onChange(orderId, e.target.value as OrderStatus)}
        className="font-orbitron text-[9px] uppercase tracking-wider cursor-pointer focus:outline-none"
        style={{
          background: "#0d0d17",
          border: `1px solid ${error ? "#ff336650" : color + "50"}`,
          color: error ? "#ff3366" : color,
          colorScheme: "dark",
          padding: "3px 8px",
          borderRadius: "2px",
          minWidth: "100px",
        }}
      >
        {ORDER_STATUSES.map(st => (
          <option key={st.value} value={st.value} style={{ background: "#0d0d17", color: st.color }}>
            {st.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-1 font-jetbrains text-[8px] text-[#ff3366]">
          <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]" title={error}>Failed</span>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, onStatusChange, statusError }: {
  order: Order;
  onStatusChange: (id: number, status: OrderStatus) => void;
  statusError?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || [];

  return (
    <>
      <tr
        className={cn(
          "border-b border-[#0d0d17] hover:bg-[#00ff8804] transition-colors cursor-pointer",
          expanded && "bg-[#00ff8804]"
        )}
        onClick={() => setExpanded(e => !e)}
      >
        <td className="table-cell">
          <span className="font-jetbrains text-[#00ff88] text-xs font-bold">{order.order_number}</span>
        </td>
        <td className="table-cell">
          <div>
            <div className="font-jetbrains text-xs text-[#c0c0d8] font-bold">{order.customer_name}</div>
            <div className="font-jetbrains text-[10px] text-[#4a4a6a] mt-0.5">{order.customer_phone}</div>
          </div>
        </td>
        <td className="table-cell hidden sm:table-cell">
          <span className="font-jetbrains text-xs text-[#4a4a6a]">{order.customer_email}</span>
        </td>
        <td className="table-cell hidden md:table-cell">
          <span className="font-jetbrains text-xs text-[#4a4a6a]">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </td>
        <td className="table-cell hidden lg:table-cell">
          <span className="font-jetbrains text-[10px] text-[#2e2e4a]">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="table-cell">
          <StatusBadge status={order.status} />
        </td>
        <td className="table-cell" onClick={e => e.stopPropagation()}>
          <StatusSelector
            orderId={order.id}
            current={order.status}
            onChange={onStatusChange}
            error={statusError}
          />
        </td>
        <td className="table-cell w-8">
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-[#4a4a6a]" />
            : <ChevronDown className="w-3.5 h-3.5 text-[#4a4a6a]" />
          }
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#00ff8804]">
          <td colSpan={8} className="px-4 py-3">
            <div className="space-y-2">
              {items.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] mb-2">
                    Items Ordered
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 font-jetbrains text-xs">
                      <span className="text-[#2e2e4a] w-16">{item.product_sku || "—"}</span>
                      <span className="text-[#c0c0d8] flex-1">{item.product_name}</span>
                      <span className="text-[#00ff88] font-bold">×{item.quantity}</span>
                      <span className="text-[#4a4a6a]">${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-jetbrains text-xs text-[#2e2e4a]">No items recorded</p>
              )}

              {order.notes && (
                <div className="mt-2 pt-2 border-t border-[#1e1e2e]">
                  <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] mb-1">
                    Customer Notes
                  </div>
                  <p className="font-jetbrains text-xs text-[#4a4a6a]">{order.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const POLL_MS = 8_000;

export function OrdersClient() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  // per-order error map: orderId → error message
  const [statusErrors, setStatusErrors] = useState<Record<number, string>>({});
  const debounceRef = useRef<NodeJS.Timeout>();
  const isIdlePage = !debouncedSearch && !statusFilter && page === 1;

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const getParams = useCallback(() => new URLSearchParams({
    search: debouncedSearch,
    status: statusFilter,
    page: String(page),
    limit: "25",
  }), [debouncedSearch, statusFilter, page]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?${getParams()}`);
      const json: PaginatedOrders = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getParams]);

  // Initial load
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Auto-poll: silently refresh on idle page, do nothing otherwise
  useEffect(() => {
    if (!isIdlePage) return;
    const id = setInterval(() => fetchOrders(true), POLL_MS);
    return () => clearInterval(id);
  }, [isIdlePage, fetchOrders]);

  const handleStatusChange = useCallback(async (id: number, status: OrderStatus) => {
    // Clear any previous error for this order
    setStatusErrors(e => { const n = { ...e }; delete n[id]; return n; });

    // Capture previous state for rollback
    const prev = data;

    // Optimistic update — show instantly
    setData(d => d
      ? { ...d, orders: d.orders.map(o => o.id === id ? { ...o, status } : o) }
      : d
    );

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Roll back optimistic update
        setData(prev);
        const msg: string = json?.error ?? `Error ${res.status}`;
        setStatusErrors(e => ({ ...e, [id]: msg }));
        console.error(`Status update failed for order ${id}:`, msg);
        return;
      }

      // Confirm with server-returned row (preserves items from local state)
      setData(d => d
        ? { ...d, orders: d.orders.map(o => o.id === id ? { ...json, items: o.items } : o) }
        : d
      );
    } catch (e) {
      setData(prev);
      const msg = e instanceof Error ? e.message : "Network error";
      setStatusErrors(err => ({ ...err, [id]: msg }));
      console.error(e);
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e4a]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name, email, phone..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e2e4a] hover:text-[#00ff88]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e4a] pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field pl-9 pr-8 min-w-[160px] cursor-pointer"
            style={{ colorScheme: "dark" }}
          >
            <option value="" style={{ background: "#0d0d17", color: "#e0e0f0" }}>All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value} style={{ background: "#0d0d17", color: s.color }}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="flex items-center gap-3 font-jetbrains text-[10px] text-[#2e2e4a]">
          <span>
            <span className="text-[#00ff8860]">//</span>{" "}
            {data.total.toLocaleString()} order{data.total !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {statusFilter && ` · status: ${statusFilter}`}
          </span>
          {isIdlePage && (
            <span className="text-[#1e1e2e]">· live</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
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
                  <tr key={i} className="border-b border-[#0d0d17] animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-[#0d0d17] rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.orders.length ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-[#1e1e2e]" />
                      <p className="font-orbitron text-xs text-[#2e2e4a] uppercase tracking-widest">
                        No orders found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.orders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    statusError={statusErrors[order.id]}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e2e]">
            <span className="font-jetbrains text-[10px] text-[#2e2e4a]">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 font-orbitron text-[9px] text-[#4a4a6a] hover:text-[#00ff88] disabled:opacity-30 clip-chamfer-sm border border-[#1e1e2e] hover:border-[#00ff8840] transition-all"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 font-orbitron text-[9px] text-[#4a4a6a] hover:text-[#00ff88] disabled:opacity-30 clip-chamfer-sm border border-[#1e1e2e] hover:border-[#00ff8840] transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
