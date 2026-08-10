import { NextRequest, NextResponse } from "next/server";
import { getProductByBarcode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  try {
    const code = decodeURIComponent(params.code).trim();
    if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

    const product = await getProductByBarcode(code);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/admin/products/barcode/[code] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
