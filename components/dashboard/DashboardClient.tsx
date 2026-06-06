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

const NEON_SHADES = [
  "#00ff88", "#00d4ff", "#ff00ff", "#ffff00",
  "#00ff88cc", "#00d4ffcc", "#ff00ffcc",
  "#33ffaa", "#33eeff",
];

function StatCard({
  label,
  value,
  icon: Icon,
  color = "green",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: "green" | "cyan" | "magenta" | "red";
  delay?: number;
}) {
  const colorMap = {
    green:   { text: "#00ff88", border: "#00ff8830", bg: "#00ff8810", glow: "#00ff8840" },
    cyan:    { text: "#00d4ff", border: "#00d4ff30", bg: "#00d4ff10", glow: "#00d4ff40" },
    magenta: { text: "#ff00ff", border: "#ff00ff30", bg: "#ff00ff10", glow: "#ff00ff40" },
    red:     { text: "#ff3366", border: "#ff336630", bg: "#ff336610", glow: "#ff336640" },
  };
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card p-5 relative overflow-hidden"
      style={{ borderColor: c.border }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 20px ${c.glow}18` }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center clip-chamfer-sm border"
            style={{ background: c.bg, borderColor: c.border, boxShadow: `0 0 10px ${c.glow}` }}
          >
            <Icon className="w-5 h-5" style={{ color: c.text }} />
          </div>
        </div>
        <div
          className="font-orbitron text-2xl font-black mb-0.5"
          style={{ color: c.text, textShadow: `0 0 10px ${c.glow}` }}
        >
          {value}
        </div>
        <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">{label}</div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d17] border border-[#00ff8830] px-3 py-2 text-sm clip-chamfer-sm">
        <p className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] mb-1">{label}</p>
        <p className="font-jetbrains text-[#00ff88] font-bold">{payload[0].value} items</p>
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
          <div key={i} className="card p-5 animate-pulse">
            <div className="w-10 h-10 bg-[#0d0d17] clip-chamfer-sm mb-4 border border-[#1e1e2e]" />
            <div className="h-7 bg-[#0d0d17] rounded w-16 mb-1" />
            <div className="h-3 bg-[#0a0a0f] rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card p-8 text-center border-[#ff336630]">
        <p className="font-jetbrains text-[#ff3366] text-sm">
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
          <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider glitch">
            DASHBOARD
          </h1>
          <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
            <span className="text-[#00ff8860]">//</span> LA Smokes Inventory Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/new" className="btn-primary flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Item</span>
          </Link>
          <a href="/api/export?format=csv" className="btn-secondary flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={(stats.totalProducts ?? 0).toLocaleString()}
          icon={Package}
          color="green"
          delay={0}
        />
        <StatCard
          label="Total Units"
          value={(stats.totalUnits ?? 0).toLocaleString()}
          icon={TrendingUp}
          color="cyan"
          delay={0.05}
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStockCount ?? 0}
          icon={AlertTriangle}
          color={(stats.lowStockCount ?? 0) > 0 ? "red" : "green"}
          delay={0.1}
        />
        <StatCard
          label="Categories"
          value={stats.categoryBreakdown?.length ?? 0}
          icon={BarChart2}
          color="magenta"
          delay={0.15}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 lg:col-span-2 border-[#00ff8820]"
        >
          <h2 className="font-orbitron text-[10px] font-black uppercase tracking-widest text-[#4a4a6a] mb-4">
            <span className="text-[#00ff8860]">&gt;</span> Products by Category
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.categoryBreakdown ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fill: "#4a4a6a", fontSize: 9, fontFamily: "var(--font-orbitron)" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "#4a4a6a", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#00ff8808" }} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {(stats.categoryBreakdown ?? []).map((_, index) => (
                  <Cell key={index} fill={NEON_SHADES[index % NEON_SHADES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5 border-[#00d4ff20]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-[10px] font-black uppercase tracking-widest text-[#4a4a6a]">
              <span className="text-[#00d4ff60]">&gt;</span> Recently Updated
            </h2>
            <Clock className="w-3.5 h-3.5 text-[#2e2e4a]" />
          </div>
          <div className="space-y-3">
            {(stats.recentlyUpdated ?? []).length === 0 ? (
              <p className="font-jetbrains text-[#2e2e4a] text-xs">No products yet</p>
            ) : (
              (stats.recentlyUpdated ?? []).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-start gap-3 group"
                >
                  <CategoryIcon category={product.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-jetbrains text-xs font-bold text-[#c0c0d8] truncate group-hover:text-[#00ff88] transition-colors">
                      {product.product_name}
                    </p>
                    <p className="font-jetbrains text-[9px] text-[#2e2e4a] mt-0.5">
                      {formatDateTime(product.updated_at)} · Qty: {product.quantity}
                    </p>
                  </div>
                  <StockBadge quantity={product.quantity} />
                </Link>
              ))
            )}
          </div>
          <Link
            href="/inventory"
            className="mt-4 font-orbitron text-[9px] text-[#00ff88] hover:text-[#33ffaa] flex items-center gap-1 transition-colors uppercase tracking-widest"
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
          transition={{ delay: 0.3 }}
          className="border border-[#ff336630] bg-[#ff336608] p-4 flex items-center gap-3 clip-chamfer-md"
          style={{ boxShadow: "0 0 20px #ff336610" }}
        >
          <AlertTriangle className="w-5 h-5 text-[#ff3366] flex-shrink-0 drop-shadow-[0_0_6px_#ff3366]" />
          <div className="flex-1">
            <p className="font-orbitron text-xs font-black text-[#ff3366] uppercase tracking-wider">
              {stats.lowStockCount ?? 0} item{(stats.lowStockCount ?? 0) !== 1 ? "s" : ""} low on stock
            </p>
            <p className="font-jetbrains text-[10px] text-[#ff336670] mt-0.5">
              Review and restock to avoid outages
            </p>
          </div>
          <Link
            href="/low-stock"
            className="font-orbitron text-[9px] text-[#ff3366] font-black border border-[#ff336640] px-3 py-1.5 uppercase tracking-widest hover:bg-[#ff336615] transition-colors clip-chamfer-sm flex-shrink-0"
          >
            View →
          </Link>
        </motion.div>
      )}

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card p-5"
      >
        <h2 className="font-orbitron text-[10px] font-black uppercase tracking-widest text-[#4a4a6a] mb-4">
          <span className="text-[#ff00ff60]">&gt;</span> Inventory by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(stats.categoryBreakdown ?? []).map((item) => (
            <Link
              key={item.category}
              href={`/inventory?category=${encodeURIComponent(item.category)}`}
              className="flex flex-col items-center gap-2 p-3 bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#00ff8840] hover:bg-[#00ff8808] transition-all group clip-chamfer-sm"
            >
              <CategoryIcon category={item.category} size="sm" />
              <div className="text-center">
                <div className="font-orbitron text-sm font-black text-[#00ff88] group-hover:text-[#33ffaa]">
                  {item.count}
                </div>
                <div className="font-jetbrains text-[9px] text-[#4a4a6a] leading-tight">{item.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
