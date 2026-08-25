export interface Product {
  id: number;
  product_name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  cost?: number;
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
  categoryBreakdown: { category: string; icon: string; count: number }[];
  totalCategories: number;
  newOrdersCount: number;
  monthlyProfit: number;
  monthlyRevenue: number;
}

export type OrderStatus = "new" | "contacted" | "ready" | "completed" | "cancelled";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  price: number;
  cost: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string | null;
  status: OrderStatus;
  client_id?: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CartItem {
  id: number;
  product_name: string;
  sku: string;
  price: number;
  image_url: string | null;
  category: string;
  quantity: number;
  stock: number;
}

export interface CategoryRecord {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

export const CLIENT_TYPES = [
  "Store Owner",
  "Retailer",
  "Distributor",
  "Supplier",
  "Chain Store",
  "Other",
] as const;

export type ClientType = typeof CLIENT_TYPES[number];

export interface Client {
  id: number;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  tobacco_license_number: string | null;
  sellers_permit_number: string | null;
  client_type: ClientType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceActivity {
  id: number;
  order_id: number;
  action_type: "printed" | "emailed";
  performed_at: string;
  recipient_email: string | null;
  notes: string | null;
}

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "new",       label: "New",       color: "#1565C0" },
  { value: "contacted", label: "Contacted", color: "#6A1B9A" },
  { value: "ready",     label: "Ready",     color: "#E65100" },
  { value: "completed", label: "Completed", color: "#2E7D32" },
  { value: "cancelled", label: "Cancelled", color: "#B71C1C" },
];

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
  Cigarettes: "bg-amber-100 text-amber-900 border border-amber-300",
  Cigars: "bg-orange-100 text-orange-900 border border-orange-300",
  Wraps: "bg-yellow-100 text-yellow-900 border border-yellow-400",
  "Rolling Papers": "bg-lime-100 text-lime-900 border border-lime-300",
  Lighters: "bg-red-100 text-red-900 border border-red-300",
  Batteries: "bg-blue-100 text-blue-900 border border-blue-300",
  Butane: "bg-cyan-100 text-cyan-900 border border-cyan-300",
  Incense: "bg-purple-100 text-purple-900 border border-purple-300",
  Medication: "bg-pink-100 text-pink-900 border border-pink-300",
  Accessories: "bg-indigo-100 text-indigo-900 border border-indigo-300",
  "Eye Care": "bg-teal-100 text-teal-900 border border-teal-300",
  Condoms: "bg-rose-100 text-rose-900 border border-rose-300",
};
