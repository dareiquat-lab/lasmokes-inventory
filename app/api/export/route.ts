import { NextRequest, NextResponse } from "next/server";
import { getAllProductsForExport } from "@/lib/db";

export async function GET(request: NextRequest) {

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const products = await getAllProductsForExport();

    if (format === "csv") {
      const headers = ["ID", "Product Name", "Category", "SKU", "Quantity", "Price", "Barcode", "Notes", "Created At", "Updated At"];
      const rows = products.map((p: Record<string, unknown>) => [
        p.id,
        p.product_name,
        p.category,
        p.sku,
        p.quantity,
        p.price,
        p.barcode || "",
        p.notes || "",
        p.created_at,
        p.updated_at,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => {
          const str = String(val || "");
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        }).join(",")),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="lasmokes-inventory-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "json") {
      return NextResponse.json(products, {
        headers: {
          "Content-Disposition": `attachment; filename="lasmokes-inventory-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
