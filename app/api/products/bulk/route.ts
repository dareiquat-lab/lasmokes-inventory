import { NextRequest, NextResponse } from "next/server";
import { sql, bulkDeleteProducts } from "@/lib/db";

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();
    const { action, ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }

    switch (action) {
      case "delete":
        await bulkDeleteProducts(ids);
        return NextResponse.json({ success: true, affected: ids.length });

      case "update_quantity":
        if (data?.quantity === undefined) {
          return NextResponse.json({ error: "quantity is required for update_quantity action" }, { status: 400 });
        }
        await sql(`UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = ANY($2)`, [parseInt(data.quantity), ids]);
        return NextResponse.json({ success: true, affected: ids.length });

      case "update_category":
        if (!data?.category) {
          return NextResponse.json({ error: "category is required for update_category action" }, { status: 400 });
        }
        await sql(`UPDATE products SET category = $1, updated_at = NOW() WHERE id = ANY($2)`, [data.category, ids]);
        return NextResponse.json({ success: true, affected: ids.length });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("POST /api/products/bulk error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
