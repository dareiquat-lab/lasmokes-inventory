import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateClient, deleteClient } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await getClientById(parseInt(params.id));
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(client);
  } catch (error) {
    console.error("GET /api/admin/clients/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (body.business_name !== undefined && !body.business_name?.trim()) {
      return NextResponse.json({ error: "business_name cannot be empty" }, { status: 400 });
    }
    const updated = await updateClient(parseInt(params.id), body);
    if (!updated) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/clients/[id] error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteClient(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/clients/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
