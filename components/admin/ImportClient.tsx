"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  FileImage,
  FileText,
  X,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Loader2,
  ShoppingCart,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractedItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface ExtractedClient {
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface ExtractedOrder {
  client: ExtractedClient;
  items: ExtractedItem[];
  notes: string | null;
  ordered_at: string | null;
  message_fingerprint: string;
}

interface ReviewOrder {
  client: ExtractedClient;
  items: ExtractedItem[];
  notes: string;
  duplicateWarning: string | null;
  warnDismissed: boolean;
}

interface InvoiceItem {
  name: string;
  category: string;
  quantity: number;
  unit_cost: number;
}

type Mode = "order" | "invoice";
type Step = "upload" | "review" | "done";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(n: number) {
  return "$" + Number(n).toFixed(2);
}

function orderTotal(items: ExtractedItem[]) {
  return items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
}

function fuzzyMatch(needle: string, haystack: string) {
  const n = needle.toLowerCase().replace(/[^a-z0-9]/g, "");
  const h = haystack.toLowerCase().replace(/[^a-z0-9]/g, "");
  return h.includes(n) || n.includes(h);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 text-left rounded-2xl p-5 transition-all duration-150 border-2",
        selected
          ? "border-[#ff4757] bg-[#e0e5ec]"
          : "border-transparent bg-[#e0e5ec]"
      )}
      style={{
        boxShadow: selected
          ? "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff, 0 0 0 2px #ff4757"
          : "8px 8px 16px #babecc, -8px -8px 16px #ffffff",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            selected ? "bg-[#ff4757]" : "bg-[#e0e5ec]"
          )}
          style={
            selected
              ? {}
              : { boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }
          }
        >
          <Icon className={cn("w-5 h-5", selected ? "text-white" : "text-[#babecc]")} />
        </div>
        <div>
          <div className="font-jetbrains text-xs font-black uppercase tracking-wider text-[#2d3436]">
            {title}
          </div>
          <div className="font-jetbrains text-[10px] text-[#4a5568] mt-1 leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

function Thumbnail({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="relative rounded-xl overflow-hidden flex items-center justify-center bg-[#e0e5ec]"
      style={{
        width: 80,
        height: 80,
        boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff",
      }}
    >
      {isPdf ? (
        <div className="flex flex-col items-center gap-1">
          <FileText className="w-6 h-6 text-[#4a5568]" />
          <span className="font-jetbrains text-[8px] text-[#4a5568]">PDF</span>
        </div>
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.name} className="w-full h-full object-cover" />
      ) : null}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#ff4757] flex items-center justify-center text-white"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Order Review Card ─────────────────────────────────────────────────────────

function OrderCard({
  order,
  index,
  total,
  onChange,
  onRemove,
}: {
  order: ReviewOrder;
  index: number;
  total: number;
  onChange: (updated: ReviewOrder) => void;
  onRemove: () => void;
}) {
  const setClient = (patch: Partial<ExtractedClient>) =>
    onChange({ ...order, client: { ...order.client, ...patch } });

  const setItemQty = (i: number, qty: number) => {
    const items = order.items.map((item, idx) =>
      idx === i ? { ...item, quantity: Math.max(1, qty) } : item
    );
    onChange({ ...order, items });
  };

  const setItemPrice = (i: number, price: number) => {
    const items = order.items.map((item, idx) =>
      idx === i ? { ...item, unit_price: price } : item
    );
    onChange({ ...order, items });
  };

  const setItemName = (i: number, name: string) => {
    const items = order.items.map((item, idx) =>
      idx === i ? { ...item, product_name: name } : item
    );
    onChange({ ...order, items });
  };

  const noName = !order.client.first_name.trim() && !order.client.last_name.trim();

  return (
    <div
      className="bg-[#e0e5ec] rounded-2xl p-5 space-y-4"
      style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[#4a5568]">
          Order {index + 1}
        </div>
        {total > 1 && (
          <button
            onClick={onRemove}
            className="font-jetbrains text-[9px] text-[#babecc] hover:text-[#c0392b] transition-colors uppercase tracking-widest"
          >
            Remove this order
          </button>
        )}
      </div>

      {/* Warnings */}
      {order.duplicateWarning && !order.warnDismissed && (
        <div
          className="rounded-lg px-3 py-2.5 flex items-start gap-2"
          style={{ background: "rgba(253,203,110,0.15)", border: "1px solid rgba(253,203,110,0.4)" }}
        >
          <AlertTriangle className="w-4 h-4 text-[#fdcb6e] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-wider text-[#636e72]">
              Possible Duplicate
            </div>
            <div className="font-jetbrains text-[10px] text-[#636e72] mt-0.5">
              {order.duplicateWarning}
            </div>
          </div>
          <button
            onClick={() => onChange({ ...order, warnDismissed: true })}
            className="text-[#babecc] hover:text-[#636e72]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {noName && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{ background: "rgba(255,71,87,0.07)", border: "1px solid rgba(255,71,87,0.2)" }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#ff4757] flex-shrink-0" />
          <span className="font-jetbrains text-[10px] text-[#ff4757]">
            No client name found — please fill in below
          </span>
        </div>
      )}

      {/* Client fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">First Name</label>
            <input
              className="input-field"
              value={order.client.first_name}
              onChange={(e) => setClient({ first_name: e.target.value })}
              placeholder="First"
            />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input
              className="input-field"
              value={order.client.last_name}
              onChange={(e) => setClient({ last_name: e.target.value })}
              placeholder="Last"
            />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            className="input-field"
            value={order.client.phone ?? ""}
            onChange={(e) => setClient({ phone: e.target.value || null })}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <input
          className="input-field"
          value={order.notes}
          onChange={(e) => onChange({ ...order, notes: e.target.value })}
          placeholder="Pickup/delivery notes…"
        />
      </div>

      {/* Items */}
      <div>
        <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[#4a5568] mb-3">
          Items
        </div>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="space-y-2 pb-3"
              style={{ borderBottom: "1px solid #e8ecf1" }}
            >
              {/* Product name — full width */}
              <input
                className="input-field w-full"
                value={item.product_name}
                onChange={(e) => setItemName(i, e.target.value)}
                placeholder="Product name"
              />
              {/* Qty + Price on one row */}
              <div className="flex items-center gap-2">
                <label className="label mb-0 flex-shrink-0 w-8">Qty</label>
                <div className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => setItemQty(i, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-l-lg text-[#4a5568] hover:text-[#ff4757]"
                    style={{ boxShadow: "2px 2px 4px #babecc, -2px -2px 4px #ffffff", background: "#e0e5ec" }}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div
                    className="w-10 h-8 flex items-center justify-center font-jetbrains text-sm font-black text-[#2d3436]"
                    style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #babecc, inset -2px -2px 4px #ffffff" }}
                  >
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => setItemQty(i, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-r-lg text-[#4a5568] hover:text-[#ff4757]"
                    style={{ boxShadow: "2px 2px 4px #babecc, -2px -2px 4px #ffffff", background: "#e0e5ec" }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jetbrains text-xs text-[#babecc]">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field pl-6 pr-2 text-right w-full"
                    value={item.unit_price}
                    onChange={(e) => setItemPrice(i, parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Running total */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
      >
        <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568]">
          Order Total
        </span>
        <span className="font-jetbrains text-sm font-black text-[#ff4757]">
          {formatMoney(orderTotal(order.items))}
        </span>
      </div>
    </div>
  );
}

// ─── Invoice Review Cards ─────────────────────────────────────────────────────

function InvoiceTable({
  items,
  onChange,
}: {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
}) {
  const update = (i: number, patch: Partial<InvoiceItem>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-[#e0e5ec] rounded-2xl p-4 space-y-3"
          style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
        >
          {/* Row number */}
          <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#babecc]">
            Item {i + 1}
          </div>

          {/* Product name — full width */}
          <div>
            <label className="label">Product Name</label>
            <input
              className="input-field"
              value={item.name}
              onChange={(e) => update(i, { name: e.target.value })}
            />
          </div>

          {/* Category — full width */}
          <div>
            <label className="label">Category</label>
            <input
              className="input-field"
              value={item.category}
              onChange={(e) => update(i, { category: e.target.value })}
            />
          </div>

          {/* Qty + Unit Cost side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Qty</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={item.quantity}
                onChange={(e) => update(i, { quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="label">Unit Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jetbrains text-xs text-[#babecc]">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field pl-6"
                  value={item.unit_cost}
                  onChange={(e) => update(i, { unit_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ImportClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);
  const [mode, setMode] = useState<Mode>("order");
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // Order review state
  const [reviewOrders, setReviewOrders] = useState<ReviewOrder[]>([]);

  // Invoice review state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Committing state
  const [committing, setCommitting] = useState(false);
  const [commitError, setCommitError] = useState("");

  useEffect(() => {
    fetch("/api/ai-parse/status")
      .then((r) => r.json())
      .then((d) => setApiConfigured(d.configured))
      .catch(() => setApiConfigured(false));
  }, []);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...arr.filter((f) => !existing.has(f.name + f.size))];
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  // ─── Parse ──────────────────────────────────────────────────────────────────

  const handleExtract = async () => {
    if (!files.length) return;
    setParsing(true);
    setParseError("");

    try {
      if (mode === "order") {
        const allOrders: ExtractedOrder[] = [];
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("mode", "order");
          const res = await fetch("/api/ai-parse", { method: "POST", body: fd });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          const json = await res.json();
          allOrders.push(...(json.data.orders || []));
        }

        // Duplicate check: search recent orders by name/phone
        const processed: ReviewOrder[] = [];
        for (const o of allOrders) {
          const fullName = [o.client.first_name, o.client.last_name].filter(Boolean).join(" ");
          let duplicateWarning: string | null = null;

          if (fullName || o.client.phone) {
            const searchTerm = fullName || o.client.phone || "";
            const res = await fetch(
              `/api/admin/orders?search=${encodeURIComponent(searchTerm)}&limit=5`
            );
            const data = await res.json();
            if (data.orders?.length) {
              const match = data.orders[0];
              duplicateWarning = `Possible duplicate: order ${match.order_number} for "${match.customer_name}" already exists.`;
            }
          }

          processed.push({
            client: o.client,
            items: o.items,
            notes: o.notes || "",
            duplicateWarning,
            warnDismissed: false,
          });
        }

        setReviewOrders(processed);
      } else {
        const allItems: InvoiceItem[] = [];
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("mode", "invoice");
          const res = await fetch("/api/ai-parse", { method: "POST", body: fd });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }
          const json = await res.json();
          allItems.push(...(json.data.items || []));
        }
        setInvoiceItems(allItems);
      }

      setStep("review");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setParsing(false);
    }
  };

  // ─── Commit orders ──────────────────────────────────────────────────────────

  const commitOrders = async () => {
    setCommitting(true);
    setCommitError("");

    try {
      // Fetch all products once for fuzzy cost lookup
      const prodRes = await fetch("/api/products?limit=500");
      const prodData = await prodRes.json();
      const allProducts: Array<{ id: number; product_name: string; sku: string; price: number; cost: number }> =
        prodData.products || [];

      const createdIds: number[] = [];

      for (const order of reviewOrders) {
        const firstName = order.client.first_name.trim();
        const lastName = order.client.last_name.trim();
        const customerName = [firstName, lastName].filter(Boolean).join(" ") || "Unknown Customer";
        const customerPhone = order.client.phone?.trim() || "N/A";
        const customerEmail = "N/A";

        // Map items — fuzzy-match product name to get cost/sku
        const items = order.items.map((item) => {
          const matched = allProducts.find((p) => fuzzyMatch(item.product_name, p.product_name));
          return {
            product_id: matched?.id ?? null,
            product_name: item.product_name,
            product_sku: matched?.sku ?? null,
            quantity: item.quantity,
            price: item.unit_price > 0 ? item.unit_price : (matched?.price ?? 0),
          };
        });

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            notes: order.notes || undefined,
            items,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to create order");
        }

        const created = await res.json();
        createdIds.push(created.orderId);
      }

      setStep("done");

      // Redirect after brief delay
      setTimeout(() => {
        if (createdIds.length === 1) {
          router.push(`/admin/orders`);
        } else {
          router.push("/admin/orders");
        }
      }, 1500);
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCommitting(false);
    }
  };

  // ─── Commit invoice ──────────────────────────────────────────────────────────

  const commitInvoice = async () => {
    setCommitting(true);
    setCommitError("");

    try {
      // Fetch existing products + categories
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products?limit=500"),
        fetch("/api/admin/categories"),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      const allProducts: Array<{ id: number; product_name: string; quantity: number; sku: string }> =
        prodData.products || [];
      const allCategories: Array<{ name: string }> = catData.categories || [];
      const knownCategoryNames = new Set(allCategories.map((c: { name: string }) => c.name));

      for (const item of invoiceItems) {
        // Exact name match (case-insensitive)
        const existing = allProducts.find(
          (p) => p.product_name.toLowerCase() === item.name.toLowerCase()
        );

        if (existing) {
          // Increment stock
          await fetch(`/api/products/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quantity: existing.quantity + item.quantity,
              cost: item.unit_cost,
            }),
          });
        } else {
          // Ensure category exists
          if (!knownCategoryNames.has(item.category)) {
            await fetch("/api/admin/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: item.category }),
            });
            knownCategoryNames.add(item.category);
          }

          // Generate a temporary SKU
          const prefix = item.category.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
          const sku = `${prefix}-${Date.now().toString().slice(-5)}`;

          await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_name: item.name,
              category: item.category,
              sku,
              quantity: item.quantity,
              price: 0,
              cost: item.unit_cost,
            }),
          });
        }
      }

      setStep("done");
      setTimeout(() => router.push("/admin/inventory"), 1500);
    } catch (err) {
      setCommitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCommitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl">
      {/* API key warning */}
      {apiConfigured === false && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)" }}
        >
          <AlertTriangle className="w-4 h-4 text-[#ff4757] flex-shrink-0" />
          <div>
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-wider text-[#ff4757]">
              ANTHROPIC_API_KEY not configured
            </div>
            <div className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5">
              Add ANTHROPIC_API_KEY to your .env.local file to enable AI parsing.
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: UPLOAD ─────────────────────────────────────────────────────── */}
      {step === "upload" && (
        <>
          {/* Mode selector */}
          <div>
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[#4a5568] mb-3">
              Import Mode
            </div>
            <div className="flex gap-4">
              <ModeCard
                icon={ShoppingCart}
                title="Order Screenshot"
                description="WhatsApp, iMessage, Instagram DM — Claude reads each customer order from the chat"
                selected={mode === "order"}
                onClick={() => setMode("order")}
              />
              <ModeCard
                icon={Package}
                title="Supplier Invoice"
                description="PDF or photo of an invoice — Claude extracts product names, quantities, and costs"
                selected={mode === "invoice"}
                onClick={() => setMode("invoice")}
              />
            </div>
          </div>

          {/* Drop zone */}
          <div>
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[#4a5568] mb-3">
              Upload Files
            </div>

            <input
              ref={fileInputRef}
              id="file-upload-input"
              type="file"
              multiple
              accept={mode === "invoice" ? "image/*,application/pdf" : "image/*"}
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {files.length === 0 ? (
              <label
                htmlFor="file-upload-input"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all duration-150 py-12 px-6"
                style={{ boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ boxShadow: "4px 4px 8px #babecc, -4px -4px 8px #ffffff" }}
                >
                  <Upload className="w-6 h-6 text-[#babecc]" />
                </div>
                <div className="text-center">
                  <div className="font-jetbrains text-xs font-black text-[#2d3436] uppercase tracking-wider">
                    Tap to select files
                  </div>
                  <div className="font-jetbrains text-[10px] text-[#babecc] mt-1">
                    or drag and drop — {mode === "invoice" ? "images or PDFs" : "images"}
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                {/* Thumbnails grid */}
                <div className="flex flex-wrap gap-3">
                  {files.map((file, i) => (
                    <Thumbnail key={i} file={file} onRemove={() => removeFile(i)} />
                  ))}
                  {/* Add more tile */}
                  <label
                    htmlFor="file-upload-input"
                    className="cursor-pointer rounded-xl flex flex-col items-center justify-center gap-1 text-[#babecc] hover:text-[#4a5568] transition-colors"
                    style={{
                      width: 80,
                      height: 80,
                      boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff",
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-jetbrains text-[8px] uppercase tracking-widest">Add more</span>
                  </label>
                </div>

                <div className="font-jetbrains text-[10px] text-[#babecc]">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </div>
              </div>
            )}
          </div>

          {parseError && (
            <div
              className="rounded-xl px-4 py-3 font-jetbrains text-xs text-[#c0392b]"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {parseError}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!files.length || parsing || apiConfigured === false}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {parsing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Extracting data…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Extract Data
                {files.length > 0 && ` · ${files.length} file${files.length !== 1 ? "s" : ""}`}
              </>
            )}
          </button>
        </>
      )}

      {/* ── STEP: REVIEW ─────────────────────────────────────────────────────── */}
      {step === "review" && mode === "order" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-sans text-lg font-black text-[#2d3436]">
                {reviewOrders.length} order{reviewOrders.length !== 1 ? "s" : ""} extracted
              </div>
              <div className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5">
                Review and edit before saving
              </div>
            </div>
            <button
              onClick={() => { setStep("upload"); setReviewOrders([]); }}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              Back
            </button>
          </div>

          {reviewOrders.length === 0 ? (
            <div
              className="bg-[#e0e5ec] rounded-2xl p-8 flex flex-col items-center gap-3"
              style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
            >
              <FileImage className="w-8 h-8 text-[#babecc]" />
              <p className="font-jetbrains text-xs text-[#babecc] uppercase tracking-widest">
                No orders found in these screenshots
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewOrders.map((order, i) => (
                <OrderCard
                  key={i}
                  order={order}
                  index={i}
                  total={reviewOrders.length}
                  onChange={(updated) =>
                    setReviewOrders((prev) => prev.map((o, idx) => (idx === i ? updated : o)))
                  }
                  onRemove={() =>
                    setReviewOrders((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
          )}

          {commitError && (
            <div
              className="rounded-xl px-4 py-3 font-jetbrains text-xs text-[#c0392b]"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {commitError}
            </div>
          )}

          {reviewOrders.length > 0 && (
            <button
              onClick={commitOrders}
              disabled={committing}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              {committing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating orders…
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Create {reviewOrders.length} Order{reviewOrders.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </>
      )}

      {step === "review" && mode === "invoice" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-sans text-lg font-black text-[#2d3436]">
                {invoiceItems.length} line item{invoiceItems.length !== 1 ? "s" : ""} extracted
              </div>
              <div className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5">
                Review before importing to inventory
              </div>
            </div>
            <button
              onClick={() => { setStep("upload"); setInvoiceItems([]); }}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              Back
            </button>
          </div>

          <InvoiceTable items={invoiceItems} onChange={setInvoiceItems} />

          {commitError && (
            <div
              className="rounded-xl px-4 py-3 font-jetbrains text-xs text-[#c0392b]"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {commitError}
            </div>
          )}

          <button
            onClick={commitInvoice}
            disabled={committing || !invoiceItems.length}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {committing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Importing…
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" />
                Import to Inventory
              </>
            )}
          </button>
        </>
      )}

      {/* ── STEP: DONE ───────────────────────────────────────────────────────── */}
      {step === "done" && (
        <div
          className="bg-[#e0e5ec] rounded-2xl p-10 flex flex-col items-center gap-4"
          style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}
          >
            <CheckCircle className="w-8 h-8 text-[#00b894]" />
          </div>
          <div className="text-center">
            <div className="font-sans text-lg font-black text-[#2d3436]">
              {mode === "order" ? "Orders created!" : "Inventory updated!"}
            </div>
            <div className="font-jetbrains text-[10px] text-[#4a5568] mt-1 flex items-center gap-2 justify-center">
              <Loader2 className="w-3 h-3 animate-spin" />
              Redirecting…
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
