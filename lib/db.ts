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
  image_url?: string | null;
  barcode?: string | null;
  notes?: string | null;
}) {
  const result = await sql`
    INSERT INTO products (product_name, category, sku, quantity, price, image_url, barcode, notes)
    VALUES (${data.product_name}, ${data.category}, ${data.sku}, ${data.quantity}, ${data.price}, ${data.image_url || null}, ${data.barcode || null}, ${data.notes || null})
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

export async function getDashboardStats() {
  const [totalProducts, totalUnits, lowStock, recentlyUpdated, categoryBreakdown, newOrders] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM products`,
    sql`SELECT COALESCE(SUM(quantity), 0) as total FROM products`,
    sql`SELECT COUNT(*) as count FROM products WHERE quantity <= ${parseInt(process.env.LOW_STOCK_THRESHOLD || "10")}`,
    sql`SELECT * FROM products ORDER BY updated_at DESC LIMIT 5`,
    sql`SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC`,
    sql`SELECT COUNT(*) as count FROM orders WHERE status = 'new'`.catch(() => [{ count: 0 }]),
  ]);

  return {
    totalProducts: parseInt(totalProducts[0].count),
    totalUnits: parseInt(totalUnits[0].total),
    lowStockCount: parseInt(lowStock[0].count),
    recentlyUpdated: recentlyUpdated as unknown as import("@/types").Product[],
    categoryBreakdown: (categoryBreakdown as Record<string, unknown>[]).map((r) => ({
      category: r.category as string,
      count: parseInt(String(r.count)),
    })),
    newOrdersCount: parseInt(String(newOrders[0]?.count ?? 0)),
  };
}

export async function getAllProductsForExport() {
  return sql`SELECT * FROM products ORDER BY category, product_name`;
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
  items: { product_id: number; product_name: string; product_sku: string; quantity: number; price: number }[];
}) {
  const orderNumber = generateOrderNumber();

  const orderResult = await sql`
    INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, notes, status)
    VALUES (${orderNumber}, ${data.customer_name}, ${data.customer_phone}, ${data.customer_email}, ${data.notes || null}, 'new')
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

// ─── Categories ───────────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  "Cigarettes", "Cigars", "Wraps", "Rolling Papers", "Lighters",
  "Batteries", "Butane", "Incense", "Medication", "Accessories", "Eye Care", "Condoms",
];

export async function ensureCategoriesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Seed with existing categories if empty
  const existing = await sql`SELECT COUNT(*) as count FROM categories`;
  if (parseInt(existing[0].count) === 0) {
    for (const name of SEED_CATEGORIES) {
      await sql`INSERT INTO categories (name) VALUES (${name}) ON CONFLICT (name) DO NOTHING`;
    }
  }
}

export async function getCategories() {
  await ensureCategoriesTable();
  return sql`SELECT * FROM categories ORDER BY name ASC`;
}

export async function createCategory(name: string, description?: string) {
  await ensureCategoriesTable();
  const result = await sql`
    INSERT INTO categories (name, description) VALUES (${name}, ${description || null})
    RETURNING *
  `;
  return result[0];
}

export async function updateCategory(id: number, name: string, description?: string) {
  await ensureCategoriesTable();
  const existing = await sql`SELECT name FROM categories WHERE id = ${id}`;
  if (!existing[0]) return null;
  const oldName = existing[0].name;
  const result = await sql`
    UPDATE categories SET name=${name}, description=${description || null}, updated_at=NOW()
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
