import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const ORDER_PROMPT = `You are parsing a screenshot of a chat that may contain ONE OR MORE customer
orders (WhatsApp, iMessage, SMS, Telegram, Instagram DM, etc.).

CRITICAL — extract EVERY separate order visible in the screenshot as its own entry.

CRITICAL — client name rules:
- The contact name or phone number shown at the TOP of the screenshot (the
  sender/channel header) is NOT a client name. IGNORE IT.
- Employee tags like "@Stephen", "@~Stephen", "~Dr.B" are staff names — NOT
  client names. IGNORE THEM.
- The client's name is only what a customer writes about THEMSELVES in the
  message body (e.g. "This is Maria", "It's Jake", "My name is Lisa").
- If no name is stated inside the message body, leave first_name and last_name
  as empty strings.
- Never use a phone number as a name.

Return ONLY valid JSON with no extra text:
{
  "orders": [
    {
      "client": {
        "first_name": "string — from message body only, or empty string",
        "last_name": "string — from message body only, or empty string",
        "phone": "string — only if stated inside the message body, otherwise null"
      },
      "items": [
        {
          "product_name": "string — as written in the message",
          "quantity": number,
          "unit_price": number or 0 if not stated
        }
      ],
      "notes": "any pickup/delivery/other notes or null",
      "ordered_at": "ISO date string if mentioned, otherwise null",
      "message_fingerprint": "short string: clientname-item1qty-item2qty etc"
    }
  ]
}

Additional rules:
- Quantity defaults to 1 if not stated.
- unit_price defaults to 0 if not stated.
- Each distinct customer message block = one order entry.
- Return ONLY the JSON object, no markdown fences, no explanation.`;

const INVOICE_PROMPT = `You are parsing an invoice image or PDF for a product supplier.

Extract every line item and return ONLY valid JSON with no extra text:
{
  "supplier": "supplier/vendor name or null",
  "items": [
    {
      "name": "clean product name",
      "category": "best guess at category",
      "quantity": number,
      "unit_cost": number
    }
  ]
}

Rules:
- "name" should be a clean, readable product name (title case, no invoice codes).
- unit_cost = the Rate/Unit Price column (cost per item to the store).
- quantity = the Qty column.
- Skip subtotal, tax, and total rows.
- Return ONLY the JSON object, no markdown, no explanation.`;

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const mode = formData.get("mode") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!mode || !["order", "invoice"].includes(mode)) {
    return NextResponse.json({ error: "mode must be 'order' or 'invoice'" }, { status: 400 });
  }

  const rawType = file.type || "image/jpeg";
  const imageType = SUPPORTED_TYPES.includes(rawType) ? rawType : "image/jpeg";
  const isPdf = rawType === "application/pdf";

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const client = new Anthropic({ apiKey });
  const prompt = mode === "order" ? ORDER_PROMPT : INVOICE_PROMPT;

  try {
    let message;

    if (isPdf) {
      message = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });
    } else {
      message = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: imageType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: base64,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });
    }

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first === -1 || last === -1) {
      return NextResponse.json({ error: "Claude returned no JSON" }, { status: 500 });
    }
    const parsed = JSON.parse(text.slice(first, last + 1));

    return NextResponse.json({ mode, data: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI parse error:", msg);

    if (msg.toLowerCase().includes("credit balance")) {
      return NextResponse.json(
        { error: "Anthropic account has no credits. Top up at console.anthropic.com." },
        { status: 402 }
      );
    }
    if (msg.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "Invalid ANTHROPIC_API_KEY. Check your environment variable." },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: msg || "Failed to parse image" }, { status: 500 });
  }
}
