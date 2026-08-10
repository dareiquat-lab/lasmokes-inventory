import { NextRequest, NextResponse } from "next/server";
import { sql, createProduct } from "@/lib/db";

export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const lowStock = searchParams.get("lowStock") === "true";

    const offset = (page - 1) * limit;
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || "10");

    const validSortColumns = ["product_name", "category", "sku", "quantity", "price", "created_at", "updated_at"];
    const safeSort = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const safeOrder = sortOrder === "asc" ? "ASC" : "DESC";

    let conditions: string[] = [];
    let params: (string | number)[] = [];
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

    const countParams = [...params];
    const dataParams = [...params, limit, offset];

    const [countResult, products] = await Promise.all([
      sql(`SELECT COUNT(*) as total FROM products ${whereClause}`, countParams),
      sql(`SELECT * FROM products ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`, dataParams),
    ]);

    const total = parseInt(countResult[0].total);

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { product_name, category, sku, quantity, price, cost, image_url, barcode, notes } = body;

    if (!product_name || !category || !sku) {
      return NextResponse.json({ error: "product_name, category, and sku are required" }, { status: 400 });
    }

    const product = await createProduct({
      product_name,
      category,
      sku,
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price) || 0,
      cost: cost !== undefined ? parseFloat(cost) : 0,
      image_url: image_url || null,
      barcode: barcode || null,
      notes: notes || null,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
