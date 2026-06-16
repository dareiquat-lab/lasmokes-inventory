import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory, getCategoryProductCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    const { name, description } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    const category = await updateCategory(id, name.trim(), description?.trim());
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    const { reassignTo } = await request.json().catch(() => ({}));
    const count = await getCategoryProductCount(id);
    if (count > 0 && !reassignTo) {
      return NextResponse.json({ error: "Category has products", productCount: count }, { status: 409 });
    }
    const ok = await deleteCategory(id, reassignTo);
    if (!ok) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
