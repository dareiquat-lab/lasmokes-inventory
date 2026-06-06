import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, mimeType } = body;

    if (!data || !data.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // If Vercel Blob is configured, store there instead of DB
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const base64 = data.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const ext = (mimeType || "image/jpeg").split("/")[1] || "jpg";
      const filename = `products/${Date.now()}.${ext}`;
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: mimeType || "image/jpeg",
      });
      return NextResponse.json({ url: blob.url });
    }

    // Default: return the compressed data URL to store directly in the database
    return NextResponse.json({ url: data });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
