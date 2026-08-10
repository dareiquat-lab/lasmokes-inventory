"use client";

import { useEffect } from "react";

type ReportData = Awaited<ReturnType<typeof import("@/lib/db").getMonthlyReportData>>;

const STATUS_LABELS: Record<string, string> = {
  new: "New", contacted: "Contacted", ready: "Ready",
  completed: "Completed", cancelled: "Cancelled",
};
const STATUS_COLORS: Record<string, string> = {
  new: "#1565C0", contacted: "#6A1B9A", ready: "#E65100",
  completed: "#2E7D32", cancelled: "#B71C1C",
};

function fmt(n: number) {
  return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ReportPrintClient({ data }: { data: ReportData }) {
  useEffect(() => { window.print(); }, []);

  const totalStockValue = data.categoryTotals.reduce(
    (s, c) => s + parseFloat(String(c.stock_value || 0)), 0
  );
  const totalUnits = data.categoryTotals.reduce(
    (s, c) => s + parseInt(String(c.total_units || 0)), 0
  );
  const lowStockProducts = data.allProducts.filter(
    p => parseInt(String(p.quantity)) <= data.lowStockThreshold
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; background: #fff; color: #1a1a1a; }
        .no-print { position: fixed; top: 16px; right: 16px; z-index: 100; display: flex; gap: 8px; }
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        .page { max-width: 900px; margin: 0 auto; padding: 32px 40px; }
        h1 { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
        h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #4a5568; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e5e9ef; }
        h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4a5568; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; background: #f7f9fb; border-bottom: 1px solid #e5e9ef; }
        td { padding: 7px 10px; border-bottom: 1px solid #f0f2f5; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; }
        .low { color: #c0392b; font-weight: 700; }
        .section { margin-bottom: 32px; }
        .stat-row { display: flex; gap: 20px; margin-bottom: 24px; }
        .stat { flex: 1; background: #f7f9fb; border-radius: 8px; padding: 14px 18px; border: 1px solid #e5e9ef; }
        .stat-val { font-size: 22px; font-weight: 900; color: #ff4757; }
        .stat-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-top: 2px; }
        .mono { font-family: 'Courier New', monospace; }
      `}</style>

      {/* Print / Back buttons */}
      <div className="no-print">
        <button
          onClick={() => window.print()}
          style={{ padding: "8px 18px", background: "#ff4757", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{ padding: "8px 18px", background: "#e0e5ec", color: "#2d3436", border: "1px solid #babecc", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Close
        </button>
      </div>

      <div className="page">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 20, borderBottom: "3px solid #ff4757" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ff4757", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
              LA SMOKES WHOLESALE
            </div>
            <h1>Monthly Report</h1>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#4a5568", marginTop: 4 }}>{data.month}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 }}>Generated</div>
            <div style={{ fontSize: 12, color: "#4a5568", marginTop: 2 }}>{data.generatedAt}</div>
          </div>
        </div>

        {/* ── SECTION 1: Sales Summary ───────────────────────────── */}
        <div className="section">
          <h2>Sales Summary — {data.month}</h2>

          <div className="stat-row">
            <div className="stat">
              <div className="stat-val">{data.monthlyOrders.length}</div>
              <div className="stat-lbl">Total Orders</div>
            </div>
            <div className="stat">
              <div className="stat-val">{fmt(data.totalOrderValue)}</div>
              <div className="stat-lbl">Total Order Value</div>
            </div>
            <div className="stat">
              <div className="stat-val">
                {data.statusBreakdown.find(s => s.status === "completed")?.count ?? 0}
              </div>
              <div className="stat-lbl">Completed</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: "#e17055" }}>
                {data.statusBreakdown.find(s => s.status === "new")?.count ?? 0}
              </div>
              <div className="stat-lbl">Pending (New)</div>
            </div>
          </div>

          {/* Status breakdown */}
          {data.statusBreakdown.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3>Orders by Status</h3>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.statusBreakdown.map(row => (
                    <tr key={row.status}>
                      <td>
                        <span className="badge" style={{ background: STATUS_COLORS[row.status] || "#374151" }}>
                          {STATUS_LABELS[row.status] || row.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders list */}
          <h3>Orders This Month</h3>
          {data.monthlyOrders.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 12, padding: "12px 0" }}>No orders this month.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyOrders.map(order => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  return (
                    <tr key={String(order.id)}>
                      <td className="mono" style={{ fontSize: 11 }}>{String(order.order_number)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(String(order.created_at))}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{String(order.customer_name)}</div>
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>{String(order.customer_phone)}</div>
                      </td>
                      <td style={{ fontSize: 11, color: "#4a5568" }}>
                        {items.map((it: Record<string, unknown>, i: number) => (
                          <div key={i}>{String(it.quantity)}× {String(it.product_name)}</div>
                        ))}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>
                        {fmt(parseFloat(String(order.order_total || 0)))}
                      </td>
                      <td>
                        <span className="badge" style={{ background: STATUS_COLORS[String(order.status)] || "#374151" }}>
                          {STATUS_LABELS[String(order.status)] || String(order.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── SECTION 2: Inventory ───────────────────────────────── */}
        <div className="page-break" />
        <div className="section">
          <h2>Current Inventory Stock</h2>

          <div className="stat-row">
            <div className="stat">
              <div className="stat-val" style={{ color: "#0984e3" }}>{data.allProducts.length}</div>
              <div className="stat-lbl">Total Products</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: "#6c5ce7" }}>{totalUnits.toLocaleString()}</div>
              <div className="stat-lbl">Total Units</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: "#00b894" }}>{fmt(totalStockValue)}</div>
              <div className="stat-lbl">Est. Stock Value</div>
            </div>
            <div className="stat">
              <div className="stat-val" style={{ color: lowStockProducts.length > 0 ? "#e17055" : "#2E7D32" }}>
                {lowStockProducts.length}
              </div>
              <div className="stat-lbl">Low Stock Items</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ marginBottom: 20 }}>
            <h3>By Category</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: "center" }}>Products</th>
                  <th style={{ textAlign: "center" }}>Units</th>
                  <th style={{ textAlign: "right" }}>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryTotals.map(cat => (
                  <tr key={String(cat.category)}>
                    <td style={{ fontWeight: 600 }}>{String(cat.category)}</td>
                    <td style={{ textAlign: "center" }}>{String(cat.product_count)}</td>
                    <td style={{ textAlign: "center" }}>{String(cat.total_units)}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      {fmt(parseFloat(String(cat.stock_value || 0)))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Low stock alert */}
          {lowStockProducts.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "#c0392b" }}>⚠ Low Stock Items (≤ {data.lowStockThreshold} units)</h3>
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th style={{ textAlign: "right" }}>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={String(p.id)}>
                      <td className="mono" style={{ fontSize: 11 }}>{String(p.sku)}</td>
                      <td style={{ fontWeight: 600 }}>{String(p.product_name)}</td>
                      <td>{String(p.category)}</td>
                      <td style={{ textAlign: "center" }} className="low">{String(p.quantity)}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {fmt(parseFloat(String(p.price)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Full inventory */}
          <h3>Full Product List</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Unit Price</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.allProducts.map(p => {
                const qty = parseInt(String(p.quantity));
                return (
                  <tr key={String(p.id)}>
                    <td className="mono" style={{ fontSize: 11 }}>{String(p.sku)}</td>
                    <td style={{ fontWeight: qty <= data.lowStockThreshold ? 700 : 400 }}>
                      {String(p.product_name)}
                    </td>
                    <td style={{ fontSize: 11, color: "#4a5568" }}>{String(p.category)}</td>
                    <td style={{ textAlign: "center" }} className={qty <= data.lowStockThreshold ? "low" : ""}>
                      {qty}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      {fmt(parseFloat(String(p.price)))}
                    </td>
                    <td style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>
                      {fmtDate(String(p.updated_at))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e9ef", fontSize: 10, color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
          <span>LA Smokes Wholesale — Confidential Internal Report</span>
          <span>{data.generatedAt}</span>
        </div>
      </div>
    </>
  );
}
