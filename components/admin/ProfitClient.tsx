"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart2,
  Package,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

interface ProfitItem {
  id: number;
  product_name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
  margin_amount: number;
  margin_pct: number;
  potential_profit: number;
  stock_value: number;
  cost_basis: number;
}

interface CategoryBreakdown {
  category: string;
  icon: string;
  productCount: number;
  potentialProfit: number;
  stockValue: number;
  avgMarginPct: number;
}

interface ProfitData {
  products: ProfitItem[];
  monthlyActualProfit: number;
  monthlyRevenue: number;
  monthlyUnitsSold: number;
  totalPotentialProfit: number;
  totalStockValue: number;
  avgMarginPct: number;
  productsWithCost: number;
  totalProducts: number;
  categoryBreakdown: CategoryBreakdown[];
  month: string;
}

type ViewMode = "overview" | "products" | "categories";
type SortKey = "product_name" | "category" | "cost" | "price" | "margin_pct" | "potential_profit" | "quantity";

function formatMoney(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function MarginBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const color = pct >= 40 ? "#00b894" : pct >= 20 ? "#fdcb6e" : pct > 0 ? "#e17055" : "var(--text-dim)";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-[var(--muted)] rounded-full h-1.5 overflow-hidden" style={{ minWidth: 40 }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <span className="font-jetbrains text-[10px] font-bold w-10 text-right" style={{ color }}>
        {pct > 0 ? `${pct.toFixed(1)}%` : "—"}
      </span>
    </div>
  );
}

function SummaryCard({
  label, value, sub, icon: Icon, color, delay = 0,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, type: "spring", stiffness: 200 }}
      className="bg-[var(--background)] rounded-2xl p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl mb-4"
        style={{ background: `${color}18`, boxShadow: "var(--shadow-sm)" }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="font-jetbrains text-2xl font-black mb-0.5" style={{ color }}>{value}</div>
      <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
      {sub && <div className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-1">{sub}</div>}
    </motion.div>
  );
}

export function ProfitClient() {
  const [data, setData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("overview");
  const [sortKey, setSortKey] = useState<SortKey>("potential_profit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profit");
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedProducts = data
    ? [...data.products].sort((a, b) => {
        const av = a[sortKey as keyof ProfitItem] as number | string;
        const bv = b[sortKey as keyof ProfitItem] as number | string;
        const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : [];

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <Minus className="w-3 h-3 text-[var(--text-dim)]" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-[#ff4757]" />
      : <ChevronDown className="w-3 h-3 text-[#ff4757]" />;
  };

  const ThButton = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => handleSort(k)}
      className="flex items-center gap-1 font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[#ff4757] transition-colors"
    >
      {label}
      <SortIcon k={k} />
    </button>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--background)] rounded-2xl p-5 animate-pulse"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="w-10 h-10 bg-[var(--muted)] rounded-xl mb-4" />
            <div className="h-7 bg-[var(--muted)] rounded w-24 mb-1" />
            <div className="h-3 bg-[var(--muted)] rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[var(--background)] rounded-2xl p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="font-jetbrains text-[#c0392b] text-sm">Unable to load profit data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label={`${data.month} Profit`}
          value={formatMoney(data.monthlyActualProfit)}
          sub={`on ${formatMoney(data.monthlyRevenue)} revenue`}
          icon={DollarSign}
          color="#00b894"
          delay={0}
        />
        <SummaryCard
          label="Potential Inventory Profit"
          value={formatMoney(data.totalPotentialProfit)}
          sub={`if all ${data.totalProducts} products sold`}
          icon={TrendingUp}
          color="#ff4757"
          delay={0.05}
        />
        <SummaryCard
          label="Avg Margin"
          value={`${data.avgMarginPct.toFixed(1)}%`}
          sub="across all stocked inventory"
          icon={BarChart2}
          color="#6c5ce7"
          delay={0.1}
        />
        <SummaryCard
          label="Cost Entered"
          value={`${data.productsWithCost} / ${data.totalProducts}`}
          sub="products with cost data"
          icon={Package}
          color="#0984e3"
          delay={0.15}
        />
      </div>

      {/* Missing cost notice */}
      {data.productsWithCost < data.totalProducts && (
        <div
          className="bg-[var(--background)] rounded-xl p-4 flex items-start gap-3"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid rgba(9,132,227,0.25)" }}
        >
          <Package className="w-4 h-4 text-[#0984e3] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-jetbrains text-[10px] font-black uppercase tracking-wider text-[#0984e3]">
              {data.totalProducts - data.productsWithCost} product{data.totalProducts - data.productsWithCost !== 1 ? "s" : ""} missing cost data
            </p>
            <p className="font-jetbrains text-[10px] text-[var(--text-muted)] mt-0.5">
              Enter a cost per product in Inventory → Edit Item to improve accuracy. Products with no cost assume $0 cost.
            </p>
          </div>
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-1.5">
        {(["overview", "products", "categories"] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-4 py-2 font-jetbrains text-[9px] uppercase tracking-widest rounded-xl transition-all duration-200"
            style={
              view === v
                ? { background: "#ff4757", color: "#fff", boxShadow: "var(--shadow-sm)" }
                : { background: "var(--background)", color: "var(--text-muted)", boxShadow: "var(--shadow-sm)" }
            }
          >
            {v === "overview" ? "Overview" : v === "products" ? "By Product" : "By Category"}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Monthly summary */}
          <div
            className="bg-[var(--background)] rounded-2xl p-5 space-y-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              {data.month} — Completed Orders
            </h2>
            <div className="space-y-3">
              {[
                { label: "Revenue", value: formatMoney(data.monthlyRevenue), color: "#0984e3" },
                { label: "Profit", value: formatMoney(data.monthlyActualProfit), color: "#00b894" },
                { label: "Margin", value: data.monthlyRevenue > 0 ? `${((data.monthlyActualProfit / data.monthlyRevenue) * 100).toFixed(1)}%` : "—", color: "#6c5ce7" },
                { label: "Units Sold", value: data.monthlyUnitsSold.toLocaleString(), color: "#ff4757" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #e8ecf1" }}>
                  <span className="font-jetbrains text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
                  <span className="font-jetbrains text-sm font-black" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            {data.monthlyRevenue === 0 && (
              <p className="font-jetbrains text-[10px] text-[var(--text-dim)]">
                No completed orders this month yet. Profit reflects orders marked as Completed.
              </p>
            )}
          </div>

          {/* Inventory summary */}
          <div
            className="bg-[var(--background)] rounded-2xl p-5 space-y-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Inventory Potential
            </h2>
            <div className="space-y-3">
              {[
                { label: "Stock Value (retail)", value: formatMoney(data.totalStockValue), color: "#0984e3" },
                { label: "Stock Cost Basis", value: formatMoney(data.products.reduce((s, p) => s + (parseFloat(String(p.cost_basis)) || 0), 0)), color: "#e17055" },
                { label: "Potential Profit", value: formatMoney(data.totalPotentialProfit), color: "#00b894" },
                { label: "Avg Margin", value: `${data.avgMarginPct.toFixed(1)}%`, color: "#6c5ce7" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #e8ecf1" }}>
                  <span className="font-jetbrains text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
                  <span className="font-jetbrains text-sm font-black" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* BY PRODUCT */}
      {view === "products" && (
        <motion.div
          key="products"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-2xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-shadow)" }}>
                  <th className="table-header"><ThButton label="Product" k="product_name" /></th>
                  <th className="table-header hidden md:table-cell"><ThButton label="Category" k="category" /></th>
                  <th className="table-header"><ThButton label="Cost" k="cost" /></th>
                  <th className="table-header"><ThButton label="Price" k="price" /></th>
                  <th className="table-header"><ThButton label="Margin" k="margin_pct" /></th>
                  <th className="table-header hidden sm:table-cell"><ThButton label="Units" k="quantity" /></th>
                  <th className="table-header"><ThButton label="Pot. Profit" k="potential_profit" /></th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#ff475704] transition-colors"
                    style={{ borderBottom: "1px solid #f0f2f5" }}
                  >
                    <td className="table-cell">
                      <div>
                        <div className="font-sans text-xs font-bold text-[var(--text)] leading-tight">{p.product_name}</div>
                        <div className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-0.5">{p.sku}</div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="font-jetbrains text-[10px] text-[var(--text-muted)]">{p.category}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-jetbrains text-xs text-[#e17055] font-bold">
                        {parseFloat(String(p.cost)) > 0 ? formatMoney(parseFloat(String(p.cost))) : <span className="text-[var(--text-dim)]">—</span>}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="font-jetbrains text-xs text-[#0984e3] font-bold">
                        {formatMoney(parseFloat(String(p.price)))}
                      </span>
                    </td>
                    <td className="table-cell" style={{ minWidth: 120 }}>
                      <MarginBar pct={parseFloat(String(p.margin_pct))} />
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="font-jetbrains text-xs text-[var(--text-muted)]">{p.quantity}</span>
                    </td>
                    <td className="table-cell">
                      <span className="font-jetbrains text-xs font-black" style={{ color: parseFloat(String(p.potential_profit)) > 0 ? "#00b894" : "var(--text-dim)" }}>
                        {parseFloat(String(p.potential_profit)) > 0
                          ? formatMoney(parseFloat(String(p.potential_profit)))
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* BY CATEGORY */}
      {view === "categories" && (
        <motion.div
          key="categories"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-2xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-shadow)" }}>
                  <th className="table-header">Category</th>
                  <th className="table-header hidden sm:table-cell">Products</th>
                  <th className="table-header">Stock Value</th>
                  <th className="table-header">Margin</th>
                  <th className="table-header">Pot. Profit</th>
                </tr>
              </thead>
              <tbody>
                {[...data.categoryBreakdown]
                  .sort((a, b) => b.potentialProfit - a.potentialProfit)
                  .map((cat) => (
                    <tr
                      key={cat.category}
                      className="hover:bg-[#ff475704] transition-colors"
                      style={{ borderBottom: "1px solid #f0f2f5" }}
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-sans text-xs font-bold text-[var(--text)]">{cat.category}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="font-jetbrains text-xs text-[var(--text-muted)]">{cat.productCount}</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-jetbrains text-xs text-[#0984e3] font-bold">
                          {cat.stockValue > 0 ? formatMoney(cat.stockValue) : "—"}
                        </span>
                      </td>
                      <td className="table-cell" style={{ minWidth: 120 }}>
                        <MarginBar pct={cat.avgMarginPct} />
                      </td>
                      <td className="table-cell">
                        <span className="font-jetbrains text-xs font-black" style={{ color: cat.potentialProfit > 0 ? "#00b894" : "var(--text-dim)" }}>
                          {cat.potentialProfit > 0 ? formatMoney(cat.potentialProfit) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
