"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  BarChart2,
  PlusCircle,
  Download,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { CategoryBadge, StockBadge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DashboardStats } from "@/types";

interface DashboardClientProps {
  initialStats: DashboardStats | null;
}

const INDUSTRIAL_COLORS = [
  "#ff4757", "#0984e3", "#6c5ce7", "#00b894",
  "#e17055", "#fdcb6e", "#e84393", "#74b9ff",
  "#a29bfe", "#55efc4",
];

function StatCard({
  label,
  value,
  icon: Icon,
  color = "red",
  delay = 0,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: "red" | "blue" | "purple" | "orange" | "green";
  delay?: number;
  href?: string;
}) {
  const colorMap = {
    red:    { text: "#ff4757", bg: "rgba(255,71,87,0.1)",   iconBg: "rgba(255,71,87,0.12)"  },
    blue:   { text: "#0984e3", bg: "rgba(9,132,227,0.1)",   iconBg: "rgba(9,132,227,0.12)"  },
    purple: { text: "#6c5ce7", bg: "rgba(108,92,231,0.1)",  iconBg: "rgba(108,92,231,0.12)" },
    orange: { text: "#e17055", bg: "rgba(225,112,85,0.1)",  iconBg: "rgba(225,112,85,0.12)" },
    green:  { text: "#00b894", bg: "rgba(0,184,148,0.1)",   iconBg: "rgba(0,184,148,0.12)"  },
  };
  const c = colorMap[color];

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, type: "spring", stiffness: 200 }}
      className={`bg-[var(--background)] rounded-2xl p-5 relative overflow-hidden${href ? " hover:-translate-y-0.5 transition-transform duration-200" : ""}`}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{
            background: c.iconBg,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Icon className="w-5 h-5" style={{ color: c.text }} />
        </div>
        {href && (
          <span className="font-jetbrains text-[8px] uppercase tracking-widest text-[var(--text-dim)]">View →</span>
        )}
      </div>
      <div
        className="font-jetbrains text-2xl font-black mb-0.5"
        style={{ color: c.text }}
      >
        {value}
      </div>
      <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{label}</div>
    </motion.div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-[var(--background)] px-3 py-2 text-sm rounded-lg"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <p className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1">{label}</p>
        <p className="font-jetbrains text-[#ff4757] font-bold">{payload[0].value} items</p>
      </div>
    );
  }
  return null;
};

export function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const [loading, setLoading] = useState(!initialStats);

  useEffect(() => {
    if (!initialStats) {
      fetch("/api/dashboard")
        .then(r => r.json())
        .then(data => {
          if (data && typeof data.totalProducts === "number") {
            setStats(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [initialStats]);

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
            <div className="h-7 bg-[var(--muted)] rounded w-16 mb-1" />
            <div className="h-3 bg-[var(--muted)] rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="bg-[var(--background)] rounded-2xl p-8 text-center"
        style={{ boxShadow: "var(--shadow-card)", border: "1px solid rgba(192,57,43,0.2)" }}
      >
        <p className="font-jetbrains text-[#c0392b] text-sm">
          Unable to load dashboard. Check your database connection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
            Dashboard
          </h1>
          <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
            LA Smokes Wholesale — Inventory Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Item</span>
          </Link>
          <a href="/admin/report" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={(stats.totalProducts ?? 0).toLocaleString()}
          icon={Package}
          color="red"
          delay={0}
          href="/admin/inventory"
        />
        <StatCard
          label="Total Units"
          value={(stats.totalUnits ?? 0).toLocaleString()}
          icon={TrendingUp}
          color="blue"
          delay={0.05}
          href="/admin/inventory"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStockCount ?? 0}
          icon={AlertTriangle}
          color={(stats.lowStockCount ?? 0) > 0 ? "orange" : "red"}
          delay={0.1}
          href="/admin/low-stock"
        />
        <StatCard
          label="New Orders"
          value={(stats.newOrdersCount ?? 0).toLocaleString()}
          icon={ShoppingCart}
          color="purple"
          delay={0.15}
          href="/admin/orders"
        />
      </div>

      {/* Profit + Categories row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Monthly Profit"
          value={`$${(stats.monthlyProfit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
          delay={0.2}
          href="/admin/profit"
        />
        <StatCard
          label="Categories"
          value={stats.totalCategories ?? stats.categoryBreakdown?.length ?? 0}
          icon={BarChart2}
          color="purple"
          delay={0.22}
          href="/admin/categories"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--background)] rounded-2xl p-5 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Products by Category
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.categoryBreakdown ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fill: "#4a5568", fontSize: 9, fontFamily: "var(--font-jetbrains)" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#4a5568", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(186,190,204,0.3)" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats.categoryBreakdown ?? []).map((_, index) => (
                  <Cell key={index} fill={INDUSTRIAL_COLORS[index % INDUSTRIAL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--background)] rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Recently Updated
            </h2>
            <Clock className="w-3.5 h-3.5 text-[var(--text-dim)]" />
          </div>
          <div className="space-y-3">
            {(stats.recentlyUpdated ?? []).length === 0 ? (
              <p className="font-jetbrains text-[var(--text-dim)] text-xs">No products yet</p>
            ) : (
              (stats.recentlyUpdated ?? []).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-start gap-3 group"
                >
                  <CategoryIcon category={product.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-xs font-bold text-[var(--text)] truncate group-hover:text-[#ff4757] transition-colors">
                      {product.product_name}
                    </p>
                    <p className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-0.5">
                      {formatDateTime(product.updated_at)} · Qty: {product.quantity}
                    </p>
                  </div>
                  <StockBadge quantity={product.quantity} />
                </Link>
              ))
            )}
          </div>
          <Link
            href="/admin/inventory"
            className="mt-4 font-jetbrains text-[9px] text-[#ff4757] hover:text-[#ff6b7a] flex items-center gap-1 transition-colors uppercase tracking-widest font-bold"
          >
            View all →
          </Link>
        </motion.div>
      </div>

      {/* Low stock warning */}
      {(stats.lowStockCount ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--background)] rounded-xl p-4 flex items-center gap-3"
          style={{
            boxShadow: "var(--shadow-card)",
            border: "1px solid rgba(225,112,85,0.3)",
          }}
        >
          <AlertTriangle className="w-5 h-5 text-[#e17055] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-sans text-xs font-black text-[#c0602a] uppercase tracking-wider">
              {stats.lowStockCount ?? 0} item{(stats.lowStockCount ?? 0) !== 1 ? "s" : ""} low on stock
            </p>
            <p className="font-jetbrains text-[10px] text-[#e17055] mt-0.5">
              Review and restock to avoid outages
            </p>
          </div>
          <Link
            href="/admin/low-stock"
            className="btn-secondary text-[#e17055] hover:text-[#e17055] flex-shrink-0"
            style={{ fontSize: "9px" }}
          >
            View →
          </Link>
        </motion.div>
      )}

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-[var(--background)] rounded-2xl p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Inventory by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(stats.categoryBreakdown ?? []).map((item) => (
            <Link
              key={item.category}
              href={`/admin/inventory?category=${encodeURIComponent(item.category)}`}
              className="flex flex-col items-center gap-2 p-3 bg-[var(--background)] rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <span className="text-xl">{item.icon || "📦"}</span>
              <div className="text-center">
                <div className="font-jetbrains text-sm font-black text-[#ff4757] group-hover:text-[#ff6b7a]">
                  {item.count}
                </div>
                <div className="font-jetbrains text-[9px] text-[var(--text-muted)] leading-tight">{item.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
