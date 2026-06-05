export interface Product {
  id: number;
  product_name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  image_url: string | null;
  barcode: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  lowStock?: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  recentlyUpdated: Product[];
  categoryBreakdown: { category: string; count: number }[];
}

export const CATEGORIES = [
  "Cigarettes",
  "Cigars",
  "Wraps",
  "Rolling Papers",
  "Lighters",
  "Batteries",
  "Butane",
  "Incense",
  "Medication",
  "Accessories",
  "Eye Care",
  "Condoms",
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_ICONS: Record<string, string> = {
  Cigarettes: "🚬",
  Cigars: "🍫",
  Wraps: "📜",
  "Rolling Papers": "📄",
  Lighters: "🔥",
  Batteries: "🔋",
  Butane: "💨",
  Incense: "🕯️",
  Medication: "💊",
  Accessories: "⚙️",
  "Eye Care": "👁️",
  Condoms: "🛡️",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Cigarettes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cigars: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Wraps: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Rolling Papers": "bg-lime-500/10 text-lime-400 border-lime-500/20",
  Lighters: "bg-red-500/10 text-red-400 border-red-500/20",
  Batteries: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Butane: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Incense: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Medication: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Accessories: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "Eye Care": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Condoms: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};
