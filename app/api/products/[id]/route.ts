import { NextRequest, NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

  try {
    const product = await getProductById(parseInt(params.id));
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {

  try {
    const body = await request.json();
    const { product_name, category, sku, quantity, price, cost, image_url, barcode, notes } = body;

    const updateData: Record<string, string | number | null> = {};
    if (product_name !== undefined) updateData.product_name = product_name;
    if (category !== undefined) updateData.category = category;
    if (sku !== undefined) updateData.sku = sku;
    if (quantity !== undefined) updateData.quantity = parseInt(String(quantity));
    if (price !== undefined) updateData.price = parseFloat(String(price));
    if (cost !== undefined) updateData.cost = parseFloat(String(cost));
    if (image_url !== undefined) updateData.image_url = image_url;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (notes !== undefined) updateData.notes = notes;

    const product = await updateProduct(parseInt(params.id), updateData);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {

  try {
    await deleteProduct(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
