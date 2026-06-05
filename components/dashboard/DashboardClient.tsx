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

const EMERALD_SHADES = [
  "#10b981", "#059669", "#047857", "#065f46",
  "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5",
];

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "emerald",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: string;
  delay?: number;
}) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-gray-500">{trend}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-medium">{payload[0].value} products</p>
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
          // Treat API error responses as null so the error state renders
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
            <div className="w-10 h-10 bg-[#222] rounded-lg mb-4" />
            <div className="h-7 bg-[#222] rounded w-16 mb-1" />
            <div className="h-4 bg-[#1a1a1a] rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">Unable to load dashboard stats. Check your database connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">LA Smokes Inventory Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/products/new" className="btn-primary flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Link>
          <a
            href="/api/export?format=csv"
            className="btn-secondary flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
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
          color="emerald"
          delay={0}
        />
        <StatCard
          label="Total Units"
          value={(stats.totalUnits ?? 0).toLocaleString()}
          icon={TrendingUp}
          color="blue"
          delay={0.05}
        />
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockCount ?? 0}
          icon={AlertTriangle}
          color={(stats.lowStockCount ?? 0) > 0 ? "amber" : "emerald"}
          delay={0.1}
        />
        <StatCard
          label="Categories"
          value={stats.categoryBreakdown?.length ?? 0}
          icon={BarChart2}
          color="emerald"
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
          className="card p-5 lg:col-span-2"
        >
          <h2 className="text-sm font-semibold text-white mb-4">Products by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.categoryBreakdown ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(stats.categoryBreakdown ?? []).map((_, index) => (
                  <Cell key={index} fill={EMERALD_SHADES[index % EMERALD_SHADES.length]} />
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
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recently Updated</h2>
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          <div className="space-y-3">
            {(stats.recentlyUpdated ?? []).length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet</p>
            ) : (
              (stats.recentlyUpdated ?? []).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-start gap-3 group"
                >
                  <CategoryIcon category={product.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                      {product.product_name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {formatDateTime(product.updated_at)} · Qty: {product.quantity}
                    </p>
                  </div>
                  <StockBadge quantity={product.quantity} />
                </Link>
              ))
            )}
          </div>
          <Link href="/inventory" className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            View all inventory →
          </Link>
        </motion.div>
      </div>

      {/* Low stock warning */}
      {(stats.lowStockCount ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-400">
              {stats.lowStockCount ?? 0} product{(stats.lowStockCount ?? 0) !== 1 ? "s" : ""} running low on stock
            </p>
            <p className="text-xs text-amber-400/60 mt-0.5">
              Review and restock these items to avoid stockouts
            </p>
          </div>
          <Link href="/low-stock" className="text-xs text-amber-400 hover:text-amber-300 font-medium border border-amber-500/30 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0">
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
        <h2 className="text-sm font-semibold text-white mb-4">Inventory by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(stats.categoryBreakdown ?? []).map((item) => (
            <Link
              key={item.category}
              href={`/inventory?category=${encodeURIComponent(item.category)}`}
              className="flex flex-col items-center gap-2 p-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-xl transition-colors group"
            >
              <CategoryIcon category={item.category} size="sm" />
              <div className="text-center">
                <div className="text-sm font-bold text-white">{item.count}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{item.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
