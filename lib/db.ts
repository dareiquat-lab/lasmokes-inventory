import { neon } from "@neondatabase/serverless";

// Falls back to a placeholder URL so the module loads during `next build` without a live DB.
// At runtime, DATABASE_URL must be set or every query will throw.
export const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost/placeholder"
);

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

  let conditions = [];
  let params: (string | number | boolean)[] = [];
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
  const [totalProducts, totalUnits, lowStock, recentlyUpdated, categoryBreakdown] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM products`,
    sql`SELECT COALESCE(SUM(quantity), 0) as total FROM products`,
    sql`SELECT COUNT(*) as count FROM products WHERE quantity <= ${parseInt(process.env.LOW_STOCK_THRESHOLD || "10")}`,
    sql`SELECT * FROM products ORDER BY updated_at DESC LIMIT 5`,
    sql`SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC`,
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
  };
}

export async function getAllProductsForExport() {
  return sql`SELECT * FROM products ORDER BY category, product_name`;
}

export async function generateSKU(category: string, existingSkus: string[]) {
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
  const existing = existingSkus.filter(s => s.startsWith(prefix));
  const nums = existing.map(s => parseInt(s.split("-")[1] || "0")).filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}
