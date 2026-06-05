import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getStockStatus(quantity: number, threshold = 10) {
  if (quantity === 0) return "out";
  if (quantity <= threshold) return "low";
  return "ok";
}

export function getStockBadgeClass(quantity: number, threshold = 10) {
  const status = getStockStatus(quantity, threshold);
  if (status === "out") return "bg-red-500/10 text-red-400 border-red-500/20";
  if (status === "low") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
}

export function getStockLabel(quantity: number, threshold = 10) {
  const status = getStockStatus(quantity, threshold);
  if (status === "out") return "Out of Stock";
  if (status === "low") return "Low Stock";
  return "In Stock";
}

export function generateSKUFromName(name: string, category: string, index: number): string {
  const prefixMap: Record<string, string> = {
    Cigarettes: "CIG",
    Cigars: "CGR",
    Wraps: "WRP",
    "Rolling Papers": "PPR",
    Lighters: "LTR",
    Batteries: "BAT",
    Butane: "BUT",
    Incense: "INC",
    Medication: "MED",
    Accessories: "ACC",
    "Eye Care": "EYE",
    Condoms: "CON",
  };
  const prefix = prefixMap[category] || "GEN";
  return `${prefix}-${String(index).padStart(3, "0")}`;
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
