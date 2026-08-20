import { neon } from "@neondatabase/serverless";
import type { Order, OrderItem, OrderStatus } from "@/types";

// Falls back to a placeholder URL so the module loads during `next build` without a live DB.
// fetchOptions: no-store prevents Next.js from caching the underlying fetch() calls the driver makes.
export const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost/placeholder",
  { fetchOptions: { cache: "no-store" } }
);

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(filters: {
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
  lowStock?: boolean;
}) {
  const {
    search = "",
    category = "",
    sortBy = "created_at",
    sortOrder = "desc",
    page = 1,
    limit = 25,
    lowStock = false,
  } = filters;

  const offset = (page - 1) * limit;
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "10");

  const validSortColumns = ["product_name", "category", "sku", "quantity", "price", "created_at", "updated_at"];
  const validSortOrders = ["asc", "desc"];
  const safeSort = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const safeOrder = validSortOrders.includes(sortOrder) ? sortOrder : "desc";

  const conditions = [];
  const params: (string | number | boolean)[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(product_name ILIKE $${paramIdx} OR category ILIKE $${paramIdx + 1} OR sku ILIKE $${paramIdx + 2} OR COALESCE(barcode, '') ILIKE $${paramIdx + 3})`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    paramIdx += 4;
  }

  if (category) {
    conditions.push(`category = $${paramIdx}`);
    params.push(category);
    paramIdx++;
  }

  if (lowStock) {
    conditions.push(`quantity <= $${paramIdx}`);
    params.push(threshold);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  const dataQuery = `SELECT * FROM products ${whereClause} ORDER BY ${safeSort} ${safeOrder.toUpperCase()} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;

  params.push(limit, offset);

  const [countResult, products] = await Promise.all([
    sql(countQuery, params.slice(0, paramIdx - 1)),
    sql(dataQuery, params),
  ]);

  return {
    products,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function getProductById(id: number) {
  const result = await sql`SELECT * FROM products WHERE id = ${id}`;
  return result[0] || null;
}

export async function getProductByBarcode(code: string) {
  // Try exact barcode match first, then SKU
  const result = await sql`
    SELECT * FROM products
    WHERE barcode = ${code} OR sku = ${code}
    ORDER BY (barcode = ${code}) DESC
    LIMIT 1
  `;
  return result[0] || null;
}

export async function getStorefrontProducts(filters: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", category = "", page = 1, limit = 24 } = filters;
  const offset = (page - 1) * limit;

  const conditions = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(product_name ILIKE $${paramIdx} OR category ILIKE $${paramIdx + 1})`);
    params.push(`%${search}%`, `%${search}%`);
    paramIdx += 2;
  }

  if (category) {
    conditions.push(`category = $${paramIdx}`);
    params.push(category);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  const dataQuery = `SELECT id, product_name, category, sku, quantity, price, image_url FROM products ${whereClause} ORDER BY product_name ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;

  params.push(limit, offset);

  const [countResult, products] = await Promise.all([
    sql(countQuery, params.slice(0, paramIdx - 1)),
    sql(dataQuery, params),
  ]);

  return {
    products,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function createProduct(data: {
  product_name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  cost?: number;
  image_url?: string | null;
  barcode?: string | null;
  notes?: string | null;
}) {
  await ensureProductCostColumn();
  const result = await sql`
    INSERT INTO products (product_name, category, sku, quantity, price, cost, image_url, barcode, notes)
    VALUES (${data.product_name}, ${data.category}, ${data.sku}, ${data.quantity}, ${data.price}, ${data.cost ?? 0}, ${data.image_url || null}, ${data.barcode || null}, ${data.notes || null})
    RETURNING *
  `;
  return result[0];
}

export async function updateProduct(id: number, data: Partial<{
  product_name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
  image_url: string | null;
  barcode: string | null;
  notes: string | null;
}>) {
  const fields = Object.keys(data).filter(k => data[k as keyof typeof data] !== undefined);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
  const values = [id, ...fields.map(f => data[f as keyof typeof data])];

  const result = await sql(`UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, values);
  return result[0] || null;
}

export async function deleteProduct(id: number) {
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function bulkDeleteProducts(ids: number[]) {
  await sql`DELETE FROM products WHERE id = ANY(${ids})`;
}

export async function ensureProductCostColumn() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS cost NUMERIC(10,2) NOT NULL DEFAULT 0`;
}

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  await ensureProductCostColumn();

  const [totalProducts, totalUnits, lowStock, recentlyUpdated, categoryBreakdown, totalCategories, newOrders, monthlyProfit] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM products`,
    sql`SELECT COALESCE(SUM(quantity), 0) as total FROM products`,
    sql`SELECT COUNT(*) as count FROM products WHERE quantity <= ${parseInt(process.env.LOW_STOCK_THRESHOLD || "10")}`,
    sql`SELECT * FROM products ORDER BY updated_at DESC LIMIT 5`,
    sql`SELECT c.name as category, c.icon, COUNT(p.id) as count FROM categories c LEFT JOIN products p ON p.category = c.name GROUP BY c.id, c.name, c.icon ORDER BY count DESC, c.name ASC`.catch(() => []),
    sql`SELECT COUNT(*) as count FROM categories`.catch(() => [{ count: 0 }]),
    sql`SELECT COUNT(*) as count FROM orders WHERE status = 'new'`.catch(() => [{ count: 0 }]),
    sql`
      SELECT
        COALESCE(SUM((oi.price - COALESCE(p.cost, 0)) * oi.quantity), 0) as total_profit,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'completed'
        AND o.created_at >= ${monthStart}
        AND o.created_at < ${nextMonthStart}
    `.catch(() => [{ total_profit: 0, total_revenue: 0 }]),
  ]);

  return {
    totalProducts: parseInt(totalProducts[0].count),
    totalUnits: parseInt(totalUnits[0].total),
    lowStockCount: parseInt(lowStock[0].count),
    recentlyUpdated: recentlyUpdated as unknown as import("@/types").Product[],
    categoryBreakdown: (categoryBreakdown as Record<string, unknown>[]).map((r) => ({
      category: r.category as string,
      icon: (r.icon as string) || "📦",
      count: parseInt(String(r.count)),
    })),
    totalCategories: parseInt(String(totalCategories[0]?.count ?? 0)),
    newOrdersCount: parseInt(String(newOrders[0]?.count ?? 0)),
    monthlyProfit: parseFloat(String(monthlyProfit[0]?.total_profit ?? 0)),
    monthlyRevenue: parseFloat(String(monthlyProfit[0]?.total_revenue ?? 0)),
  };
}

export async function getAllProductsForExport() {
  return sql`SELECT * FROM products ORDER BY category, product_name`;
}

export async function getMonthlyReportData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "10");

  const [monthlyOrders, statusBreakdown, allProducts, categoryTotals] = await Promise.all([
    sql`
      SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_name', oi.product_name,
              'product_sku',  oi.product_sku,
              'quantity',     oi.quantity,
              'price',        oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items,
        COALESCE((
          SELECT SUM(oi2.price * oi2.quantity)
          FROM order_items oi2
          WHERE oi2.order_id = o.id
        ), 0) as order_total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.created_at >= ${monthStart} AND o.created_at < ${nextMonthStart}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `,
    sql`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= ${monthStart} AND created_at < ${nextMonthStart}
      GROUP BY status
      ORDER BY status
    `,
    sql`SELECT * FROM products ORDER BY category, product_name`,
    sql`
      SELECT category, COUNT(*) as product_count, SUM(quantity) as total_units,
             SUM(quantity * price) as stock_value
      FROM products
      GROUP BY category
      ORDER BY category
    `,
  ]);

  const totalOrderValue = (monthlyOrders as Record<string, unknown>[])
    .reduce((sum, o) => sum + parseFloat(String(o.order_total || 0)), 0);

  return {
    month: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
    generatedAt: now.toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    monthlyOrders: monthlyOrders as Record<string, unknown>[],
    statusBreakdown: statusBreakdown as { status: string; count: string }[],
    totalOrderValue,
    allProducts: allProducts as Record<string, unknown>[],
    categoryTotals: categoryTotals as Record<string, unknown>[],
    lowStockThreshold: threshold,
  };
}

export async function generateSKU(category: string, existingSkus: string[]) {
  const prefixMap: Record<string, string> = {
    Cigarettes: "CIG", Cigars: "CGR", Wraps: "WRP",
    "Rolling Papers": "PPR", Lighters: "LTR", Batteries: "BAT",
    Butane: "BUT", Incense: "INC", Medication: "MED",
    Accessories: "ACC", "Eye Care": "EYE", Condoms: "CON",
  };

  const prefix = prefixMap[category] || "GEN";
  const existing = existingSkus.filter(s => s.startsWith(prefix));
  const nums = existing.map(s => parseInt(s.split("-")[1] || "0")).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LS-${date}-${rand}`;
}

export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
  business_name?: string | null;
  tobacco_license_number?: string | null;
  sellers_permit_number?: string | null;
  items: { product_id: number; product_name: string; product_sku: string; quantity: number; price: number }[];
}) {
  await ensureOrderClientColumn();
  const orderNumber = generateOrderNumber();

  const clientId = await upsertClientFromOrder({
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    business_name: data.business_name,
    tobacco_license_number: data.tobacco_license_number,
    sellers_permit_number: data.sellers_permit_number,
  }).catch(() => null);

  const orderResult = await sql`
    INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, notes, status, client_id)
    VALUES (${orderNumber}, ${data.customer_name}, ${data.customer_phone}, ${data.customer_email}, ${data.notes || null}, 'new', ${clientId})
    RETURNING *
  `;
  const order = orderResult[0] as Order;

  if (data.items.length > 0) {
    for (const item of data.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price)
        VALUES (${order.id}, ${item.product_id}, ${item.product_name}, ${item.product_sku}, ${item.quantity}, ${item.price})
      `;
    }
  }

  return order;
}

export async function updateOrder(id: number, data: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes?: string;
  business_name?: string | null;
  tobacco_license_number?: string | null;
  sellers_permit_number?: string | null;
  items: { product_id: number | null; product_name: string; product_sku: string | null; quantity: number; price: number }[];
}) {
  await ensureOrderClientColumn();

  const clientId = await upsertClientFromOrder({
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email,
    business_name: data.business_name,
    tobacco_license_number: data.tobacco_license_number,
    sellers_permit_number: data.sellers_permit_number,
  }).catch(() => null);

  const orderResult = await sql`
    UPDATE orders
    SET customer_name = ${data.customer_name},
        customer_phone = ${data.customer_phone},
        customer_email = ${data.customer_email},
        notes = ${data.notes || null},
        client_id = COALESCE(${clientId}, client_id),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!orderResult[0]) return null;

  await sql`DELETE FROM order_items WHERE order_id = ${id}`;

  for (const item of data.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price)
      VALUES (${id}, ${item.product_id}, ${item.product_name}, ${item.product_sku}, ${item.quantity}, ${item.price})
    `;
  }

  return getOrderById(id);
}

export async function getOrders(filters: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { search = "", status = "", page = 1, limit = 25 } = filters;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(o.order_number ILIKE $${paramIdx} OR o.customer_name ILIKE $${paramIdx + 1} OR o.customer_email ILIKE $${paramIdx + 2} OR o.customer_phone ILIKE $${paramIdx + 3})`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    paramIdx += 4;
  }

  if (status) {
    conditions.push(`o.status = $${paramIdx}`);
    params.push(status);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
  const dataQuery = `
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_sku', oi.product_sku,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  params.push(limit, offset);

  const [countResult, orders] = await Promise.all([
    sql(countQuery, params.slice(0, paramIdx - 1)),
    sql(dataQuery, params),
  ]);

  return {
    orders: orders as unknown as Order[],
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const result = await sql`
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_sku', oi.product_sku,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.order_number = ${orderNumber}
    GROUP BY o.id
  `;
  return (result[0] as unknown as Order) || null;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const result = await sql`
    UPDATE orders SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  return result[0] || null;
}

export async function deleteOrder(id: number) {
  await sql`DELETE FROM order_items WHERE order_id = ${id}`;
  await sql`DELETE FROM orders WHERE id = ${id}`;
}

export async function getProfitData(filters?: { startDate?: string; endDate?: string }) {
  await ensureProductCostColumn();
  const products = await sql`
    SELECT
      id, product_name, category, sku, quantity, price, cost,
      (price - cost) AS margin_amount,
      CASE WHEN price > 0
        THEN ROUND(((price - cost) / price * 100)::numeric, 1)
        ELSE 0
      END AS margin_pct,
      (price - cost) * quantity AS potential_profit,
      price * quantity AS stock_value,
      cost * quantity AS cost_basis
    FROM products
    ORDER BY potential_profit DESC
  `;

  // Date range — defaults to all time
  const startDate = filters?.startDate || "2000-01-01";
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const endDate = filters?.endDate || tomorrow;

  const [salesStats, allTimeStats, categoryBreakdown] = await Promise.all([
    // Stats for the selected date range
    sql`
      SELECT
        COALESCE(SUM((oi.price - COALESCE(p.cost, 0)) * oi.quantity), 0) AS total_profit,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue,
        COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
        COUNT(DISTINCT o.id) AS total_orders
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'completed'
        AND o.created_at::date >= ${startDate}::date
        AND o.created_at::date <= ${endDate}::date
    `,
    // All-time totals (always shown regardless of filter)
    sql`
      SELECT
        COALESCE(SUM((oi.price - COALESCE(p.cost, 0)) * oi.quantity), 0) AS total_profit,
        COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue,
        COUNT(DISTINCT o.id) AS total_orders
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'completed'
    `,
    sql`
      SELECT
        c.name AS category,
        c.icon,
        COUNT(p.id) AS product_count,
        COALESCE(SUM((p.price - p.cost) * p.quantity), 0) AS potential_profit,
        COALESCE(SUM(p.price * p.quantity), 0) AS stock_value,
        CASE WHEN SUM(p.price * p.quantity) > 0
          THEN ROUND((SUM((p.price - p.cost) * p.quantity) / SUM(p.price * p.quantity) * 100)::numeric, 1)
          ELSE 0
        END AS avg_margin_pct
      FROM categories c
      LEFT JOIN products p ON p.category = c.name
      GROUP BY c.id, c.name, c.icon
      ORDER BY potential_profit DESC
    `.catch(() => []),
  ]);

  const productsWithCost = (products as Record<string, unknown>[]).filter(p => parseFloat(String(p.cost)) > 0).length;
  const totalPotentialProfit = (products as Record<string, unknown>[]).reduce((s, p) => s + parseFloat(String(p.potential_profit || 0)), 0);
  const totalStockValue = (products as Record<string, unknown>[]).reduce((s, p) => s + parseFloat(String(p.stock_value || 0)), 0);
  const avgMarginPct = totalStockValue > 0 ? (totalPotentialProfit / totalStockValue) * 100 : 0;

  return {
    products: products as Record<string, unknown>[],
    // Selected-range stats
    actualProfit: parseFloat(String(salesStats[0]?.total_profit ?? 0)),
    totalRevenue: parseFloat(String(salesStats[0]?.total_revenue ?? 0)),
    unitsSold: parseInt(String(salesStats[0]?.total_units_sold ?? 0)),
    totalOrders: parseInt(String(salesStats[0]?.total_orders ?? 0)),
    // All-time stats
    allTimeProfit: parseFloat(String(allTimeStats[0]?.total_profit ?? 0)),
    allTimeRevenue: parseFloat(String(allTimeStats[0]?.total_revenue ?? 0)),
    allTimeOrders: parseInt(String(allTimeStats[0]?.total_orders ?? 0)),
    // Inventory
    totalPotentialProfit,
    totalStockValue,
    avgMarginPct,
    productsWithCost,
    totalProducts: products.length,
    categoryBreakdown: (categoryBreakdown as Record<string, unknown>[]).map(r => ({
      category: String(r.category),
      icon: String(r.icon || "📦"),
      productCount: parseInt(String(r.product_count || 0)),
      potentialProfit: parseFloat(String(r.potential_profit || 0)),
      stockValue: parseFloat(String(r.stock_value || 0)),
      avgMarginPct: parseFloat(String(r.avg_margin_pct || 0)),
    })),
    // Legacy aliases for dashboard backward compat
    monthlyActualProfit: parseFloat(String(salesStats[0]?.total_profit ?? 0)),
    monthlyRevenue: parseFloat(String(salesStats[0]?.total_revenue ?? 0)),
    monthlyUnitsSold: parseInt(String(salesStats[0]?.total_units_sold ?? 0)),
  };
}

// ─── Categories ───────────────────────────────────────────────────────────────

const SEED_CATEGORIES: { name: string; icon: string }[] = [
  { name: "Cigarettes",     icon: "🚬" },
  { name: "Cigars",         icon: "🍫" },
  { name: "Wraps",          icon: "📜" },
  { name: "Rolling Papers", icon: "📄" },
  { name: "Lighters",       icon: "🔥" },
  { name: "Batteries",      icon: "🔋" },
  { name: "Butane",         icon: "💨" },
  { name: "Incense",        icon: "🕯️" },
  { name: "Medication",     icon: "💊" },
  { name: "Accessories",    icon: "⚙️" },
  { name: "Eye Care",       icon: "👁️" },
  { name: "Condoms",        icon: "🛡️" },
];

export async function ensureCategoriesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT NOT NULL DEFAULT '📦',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Add icon column to existing tables that pre-date this migration
  await sql`
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '📦'
  `;
  // Seed with existing categories if empty
  const existing = await sql`SELECT COUNT(*) as count FROM categories`;
  if (parseInt(existing[0].count) === 0) {
    for (const cat of SEED_CATEGORIES) {
      await sql`INSERT INTO categories (name, icon) VALUES (${cat.name}, ${cat.icon}) ON CONFLICT (name) DO NOTHING`;
    }
  } else {
    // Backfill icons for the 12 original categories that were seeded without icons
    for (const cat of SEED_CATEGORIES) {
      await sql`UPDATE categories SET icon=${cat.icon} WHERE name=${cat.name} AND icon='📦'`;
    }
  }
}

export async function getCategories() {
  await ensureCategoriesTable();
  return sql`SELECT * FROM categories ORDER BY name ASC`;
}

export async function createCategory(name: string, description?: string, icon?: string) {
  await ensureCategoriesTable();
  const result = await sql`
    INSERT INTO categories (name, description, icon)
    VALUES (${name}, ${description || null}, ${icon || "📦"})
    RETURNING *
  `;
  return result[0];
}

export async function updateCategory(id: number, name: string, description?: string, icon?: string) {
  await ensureCategoriesTable();
  const existing = await sql`SELECT name FROM categories WHERE id = ${id}`;
  if (!existing[0]) return null;
  const oldName = existing[0].name;
  const result = await sql`
    UPDATE categories SET name=${name}, description=${description || null}, icon=${icon || "📦"}, updated_at=NOW()
    WHERE id=${id} RETURNING *
  `;
  if (oldName !== name) {
    await sql`UPDATE products SET category=${name}, updated_at=NOW() WHERE category=${oldName}`;
  }
  return result[0];
}

export async function deleteCategory(id: number, reassignTo?: string) {
  await ensureCategoriesTable();
  const existing = await sql`SELECT name FROM categories WHERE id=${id}`;
  if (!existing[0]) return false;
  const categoryName = existing[0].name;
  if (reassignTo) {
    await sql`UPDATE products SET category=${reassignTo}, updated_at=NOW() WHERE category=${categoryName}`;
  }
  await sql`DELETE FROM categories WHERE id=${id}`;
  return true;
}

export async function getCategoryProductCount(id: number) {
  await ensureCategoriesTable();
  const cat = await sql`SELECT name FROM categories WHERE id=${id}`;
  if (!cat[0]) return 0;
  const result = await sql`SELECT COUNT(*) as count FROM products WHERE category=${cat[0].name}`;
  return parseInt(result[0].count);
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function ensureClientsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      business_name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      tobacco_license_number TEXT,
      sellers_permit_number TEXT,
      client_type TEXT NOT NULL DEFAULT 'Store Owner',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_type TEXT NOT NULL DEFAULT 'Store Owner'`;
}

export async function ensureOrderClientColumn() {
  await ensureClientsTable();
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL`;
}

export async function upsertClientFromOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  business_name?: string | null;
  tobacco_license_number?: string | null;
  sellers_permit_number?: string | null;
}): Promise<number | null> {
  await ensureClientsTable();

  // business_name overrides customer_name; if both given, customer_name becomes contact_name
  const businessName = data.business_name?.trim() || data.customer_name?.trim();
  const contactName = data.business_name?.trim() ? (data.customer_name?.trim() || null) : null;
  const phone = data.customer_phone?.trim();
  const email = data.customer_email?.trim();
  const tobaccoLicense = data.tobacco_license_number?.trim() || null;
  const sellersPermit = data.sellers_permit_number?.trim() || null;

  if (!businessName || businessName === "Unknown Customer") return null;

  const cleanPhone = phone && phone !== "N/A" ? phone : null;
  const cleanEmail = email && email !== "N/A" ? email : null;

  // After matching, update license numbers if provided (never overwrite with null)
  const updateLicenses = async (id: number) => {
    if (tobaccoLicense || sellersPermit) {
      await sql`
        UPDATE clients SET
          tobacco_license_number = COALESCE(${tobaccoLicense}, tobacco_license_number),
          sellers_permit_number  = COALESCE(${sellersPermit},  sellers_permit_number),
          updated_at = NOW()
        WHERE id = ${id}
      `;
    }
    return id;
  };

  // Match by phone first
  if (cleanPhone) {
    const byPhone = await sql`SELECT id FROM clients WHERE phone = ${cleanPhone} LIMIT 1`;
    if (byPhone[0]) return updateLicenses(byPhone[0].id as number);
  }

  // Match by business_name (case-insensitive)
  const byName = await sql`SELECT id FROM clients WHERE LOWER(business_name) = LOWER(${businessName}) LIMIT 1`;
  if (byName[0]) return updateLicenses(byName[0].id as number);

  // Create new
  const result = await sql`
    INSERT INTO clients (business_name, contact_name, phone, email, client_type, tobacco_license_number, sellers_permit_number)
    VALUES (${businessName}, ${contactName}, ${cleanPhone}, ${cleanEmail}, 'Store Owner', ${tobaccoLicense}, ${sellersPermit})
    RETURNING id
  `;
  return result[0].id as number;
}

export async function getClients(filters: {
  search?: string;
  page?: number;
  limit?: number;
  type?: string;
}) {
  await ensureClientsTable();
  const { search = "", page = 1, limit = 25, type = "" } = filters;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(business_name ILIKE $${paramIdx} OR contact_name ILIKE $${paramIdx + 1} OR phone ILIKE $${paramIdx + 2} OR tobacco_license_number ILIKE $${paramIdx + 3} OR sellers_permit_number ILIKE $${paramIdx + 4})`
    );
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
    paramIdx += 5;
  }

  if (type) {
    conditions.push(`client_type = $${paramIdx}`);
    params.push(type);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const countQuery = `SELECT COUNT(*) as total FROM clients ${whereClause}`;
  const dataQuery = `SELECT * FROM clients ${whereClause} ORDER BY business_name ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
  params.push(limit, offset);

  const [countResult, clients] = await Promise.all([
    sql(countQuery, params.slice(0, paramIdx - 1)),
    sql(dataQuery, params),
  ]);

  return {
    clients,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function getClientById(id: number) {
  await ensureClientsTable();
  const result = await sql`SELECT * FROM clients WHERE id = ${id}`;
  return result[0] || null;
}

export async function createClient(data: {
  business_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  tobacco_license_number?: string | null;
  sellers_permit_number?: string | null;
  client_type?: string | null;
  notes?: string | null;
}) {
  await ensureClientsTable();
  const result = await sql`
    INSERT INTO clients (business_name, contact_name, phone, email, address, city, state, zip, tobacco_license_number, sellers_permit_number, client_type, notes)
    VALUES (
      ${data.business_name},
      ${data.contact_name || null},
      ${data.phone || null},
      ${data.email || null},
      ${data.address || null},
      ${data.city || null},
      ${data.state || null},
      ${data.zip || null},
      ${data.tobacco_license_number || null},
      ${data.sellers_permit_number || null},
      ${data.client_type || 'Store Owner'},
      ${data.notes || null}
    )
    RETURNING *
  `;
  return result[0];
}

export async function updateClient(id: number, data: {
  business_name?: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  tobacco_license_number?: string | null;
  sellers_permit_number?: string | null;
  client_type?: string | null;
  notes?: string | null;
}) {
  await ensureClientsTable();
  const result = await sql`
    UPDATE clients SET
      business_name = COALESCE(${data.business_name ?? null}, business_name),
      contact_name = ${data.contact_name ?? null},
      phone = ${data.phone ?? null},
      email = ${data.email ?? null},
      address = ${data.address ?? null},
      city = ${data.city ?? null},
      state = ${data.state ?? null},
      zip = ${data.zip ?? null},
      tobacco_license_number = ${data.tobacco_license_number ?? null},
      sellers_permit_number = ${data.sellers_permit_number ?? null},
      client_type = COALESCE(${data.client_type ?? null}, client_type),
      notes = ${data.notes ?? null},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] || null;
}

export async function deleteClient(id: number) {
  await ensureClientsTable();
  await sql`DELETE FROM clients WHERE id = ${id}`;
}

// ─── Invoice Activity ─────────────────────────────────────────────────────────

export async function ensureInvoiceActivityTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS invoice_activity (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      action_type TEXT NOT NULL CHECK (action_type IN ('printed','emailed')),
      performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      recipient_email TEXT,
      notes TEXT
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoice_activity_order_id ON invoice_activity(order_id)`;
}

export async function logInvoiceActivity(data: {
  order_id: number;
  action_type: "printed" | "emailed";
  recipient_email?: string;
  notes?: string;
}) {
  await ensureInvoiceActivityTable();
  const result = await sql`
    INSERT INTO invoice_activity (order_id, action_type, recipient_email, notes)
    VALUES (${data.order_id}, ${data.action_type}, ${data.recipient_email || null}, ${data.notes || null})
    RETURNING *
  `;
  return result[0];
}

export async function getOrderActivity(order_id: number) {
  await ensureInvoiceActivityTable();
  return sql`
    SELECT * FROM invoice_activity WHERE order_id=${order_id} ORDER BY performed_at DESC
  `;
}

export async function getOrderById(id: number) {
  const result = await sql`
    SELECT o.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_sku', oi.product_sku,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.id=${id}
    GROUP BY o.id
  `;
  return (result[0] as unknown as import("@/types").Order) || null;
}
