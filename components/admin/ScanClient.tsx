"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Send,
  Package,
} from "lucide-react";
import type { Product, Client } from "@/types";
import { ClientPicker } from "@/components/admin/ClientPicker";

interface OrderItem {
  product: Product;
  quantity: number;
}

type ScanStatus = "idle" | "loading" | "found" | "not_found" | "duplicate";

function formatMoney(n: number) {
  return "$" + Number(n).toFixed(2);
}

function QuantityStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-8 h-8 flex items-center justify-center rounded-l-lg font-bold text-[var(--text-muted)] hover:text-[#ff4757] transition-colors"
        style={{ boxShadow: "var(--shadow-sm)", background: "var(--background)" }}
      >
        <Minus className="w-3 h-3" />
      </button>
      <div
        className="w-10 h-8 flex items-center justify-center font-jetbrains text-sm font-black text-[var(--text)]"
        style={{ background: "var(--background)", boxShadow: "var(--shadow-inner-sm)" }}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-r-lg font-bold text-[var(--text-muted)] hover:text-[#ff4757] transition-colors"
        style={{ boxShadow: "var(--shadow-sm)", background: "var(--background)" }}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}

export function ScanClient() {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanQty, setScanQty] = useState(1);
  const [lastCode, setLastCode] = useState("");

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tobaccoLicense, setTobaccoLicense] = useState("");
  const [sellersPermit, setSellersPermit] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  const orderTotal = orderItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const processBarcode = useCallback(async (code: string) => {
    if (!code || code.length < 2) return;
    setLastCode(code);
    setScanStatus("loading");
    setScannedProduct(null);
    setScanQty(1);

    try {
      const res = await fetch(
        `/api/admin/products/barcode/${encodeURIComponent(code)}`
      );
      if (!res.ok) {
        setScanStatus("not_found");
        return;
      }
      const product: Product = await res.json();
      setScannedProduct(product);
      setScanStatus("found");
    } catch {
      setScanStatus("not_found");
    }
  }, []);

  // Global keyboard listener — detects scanner input pattern
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();

      // Don't intercept typing in customer form fields
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If gap > 300ms, treat as start of new scan sequence
      if (timeSinceLast > 300 && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        clearTimeout(timeoutRef.current);
        if (code.length >= 2) processBarcode(code);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        bufferRef.current += e.key;

        // Auto-process after 150ms pause (scanners that don't send Enter)
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          const code = bufferRef.current.trim();
          bufferRef.current = "";
          if (code.length >= 2) processBarcode(code);
        }, 150);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [processBarcode]);

  const addToOrder = useCallback(() => {
    if (!scannedProduct) return;

    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === scannedProduct.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === scannedProduct.id
            ? { ...i, quantity: i.quantity + scanQty }
            : i
        );
      }
      return [...prev, { product: scannedProduct, quantity: scanQty }];
    });

    setScanStatus("idle");
    setScannedProduct(null);
    setScanQty(1);
  }, [scannedProduct, scanQty]);

  // Auto-add when a product is scanned if it's already in the order
  const removeItem = (productId: number) => {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateItemQty = (productId: number, qty: number) => {
    if (qty < 1) {
      removeItem(productId);
    } else {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
    setSelectedClient(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setBusinessName("");
    setTobaccoLicense("");
    setSellersPermit("");
    setNotes("");
    setSubmitSuccess(null);
    setSubmitError("");
    setScanStatus("idle");
    setScannedProduct(null);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    if (client.contact_name) setCustomerName(client.contact_name);
    if (client.phone) setCustomerPhone(client.phone);
    if (client.email) setCustomerEmail(client.email);
    if (client.business_name) setBusinessName(client.business_name);
    if (client.tobacco_license_number) setTobaccoLicense(client.tobacco_license_number);
    if (client.sellers_permit_number) setSellersPermit(client.sellers_permit_number);
  };

  const submitOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setSubmitError("Name, phone, and email are required.");
      return;
    }
    if (orderItems.length === 0) {
      setSubmitError("Add at least one item.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim(),
          notes: notes.trim() || undefined,
          business_name: businessName.trim() || null,
          tobacco_license_number: tobaccoLicense.trim() || null,
          sellers_permit_number: sellersPermit.trim() || null,
          client_id: selectedClient?.id ?? undefined,
          items: orderItems.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.product_name,
            product_sku: i.product.sku,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit order");

      setSubmitSuccess(data.orderNumber);
      clearOrder();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    idle: {
      dot: "bg-green-400",
      glow: "rgba(74,222,128,0.8)",
      label: "Ready to scan",
      pulse: true,
    },
    loading: {
      dot: "bg-[#fdcb6e]",
      glow: "rgba(253,203,110,0.8)",
      label: "Looking up...",
      pulse: true,
    },
    found: {
      dot: "bg-[#00b894]",
      glow: "rgba(0,184,148,0.8)",
      label: "Product found",
      pulse: false,
    },
    not_found: {
      dot: "bg-[#ff4757]",
      glow: "rgba(255,71,87,0.8)",
      label: `No match for "${lastCode}"`,
      pulse: false,
    },
    duplicate: {
      dot: "bg-[#0984e3]",
      glow: "rgba(9,132,227,0.8)",
      label: "Added to order",
      pulse: false,
    },
  };

  const sc = statusConfig[scanStatus];

  return (
    <div className="space-y-6">
      {/* Scanner status bar */}
      <div
        className="bg-[var(--background)] rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative flex-shrink-0">
          <span
            className={`w-3 h-3 rounded-full ${sc.dot} block`}
            style={{ boxShadow: `0 0 8px ${sc.glow}` }}
          />
          {sc.pulse && (
            <span
              className={`absolute inset-0 w-3 h-3 rounded-full ${sc.dot} animate-ping opacity-60`}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Scanner Status
          </div>
          <div className="font-jetbrains text-xs text-[var(--text)] mt-0.5">{sc.label}</div>
        </div>
        <Scan className="w-5 h-5 text-[var(--text-dim)]" />
        <div className="font-jetbrains text-[9px] text-[var(--text-dim)] hidden sm:block">
          Point scanner anywhere on this page and scan
        </div>
      </div>

      {/* Success banner */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-[var(--background)] rounded-2xl px-5 py-4 flex items-center gap-3"
            style={{
              boxShadow: "var(--shadow-card)",
              border: "1px solid rgba(0,184,148,0.3)",
            }}
          >
            <CheckCircle className="w-5 h-5 text-[#00b894] flex-shrink-0" />
            <div>
              <div className="font-jetbrains text-xs font-black text-[#00b894] uppercase tracking-wider">
                Order placed — {submitSuccess}
              </div>
              <div className="font-jetbrains text-[10px] text-[var(--text-muted)] mt-0.5">
                Scan the next order or view it in Orders
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Scan result ── */}
        <div className="space-y-4">
          {/* Scan result card */}
          <div
            className="bg-[var(--background)] rounded-2xl p-5 min-h-[200px] flex flex-col"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Last Scan
            </div>

            <AnimatePresence mode="wait">
              {scanStatus === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 py-6"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ boxShadow: "var(--shadow-recessed)" }}
                  >
                    <Scan className="w-7 h-7 text-[var(--text-dim)]" />
                  </div>
                  <p className="font-jetbrains text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
                    Waiting for scan
                  </p>
                </motion.div>
              )}

              {scanStatus === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 py-6"
                >
                  <div className="w-8 h-8 border-2 border-[var(--border-shadow)] border-t-[#ff4757] rounded-full animate-spin" />
                  <p className="font-jetbrains text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
                    Looking up {lastCode}
                  </p>
                </motion.div>
              )}

              {scanStatus === "not_found" && (
                <motion.div
                  key="not_found"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 py-6"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ boxShadow: "var(--shadow-recessed)" }}
                  >
                    <XCircle className="w-7 h-7 text-[#ff4757]" />
                  </div>
                  <div className="text-center">
                    <p className="font-jetbrains text-xs font-black text-[#ff4757] uppercase tracking-wider">
                      No product found
                    </p>
                    <p className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-1">
                      Barcode: {lastCode}
                    </p>
                    <p className="font-jetbrains text-[9px] text-[var(--text-dim)]">
                      Make sure the product has a barcode or SKU set in Inventory
                    </p>
                  </div>
                </motion.div>
              )}

              {scanStatus === "found" && scannedProduct && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col gap-4"
                >
                  {/* Product info */}
                  <div className="flex gap-3 items-start">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ boxShadow: "var(--shadow-inner-md)" }}
                    >
                      {scannedProduct.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={scannedProduct.image_url}
                          alt={scannedProduct.product_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-[var(--text-dim)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans text-sm font-black text-[var(--text)] leading-tight">
                        {scannedProduct.product_name}
                      </div>
                      <div className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-0.5">
                        {scannedProduct.sku} · {scannedProduct.category}
                      </div>
                      <div className="font-jetbrains text-lg font-black text-[#ff4757] mt-1">
                        {formatMoney(scannedProduct.price)}
                      </div>
                    </div>
                  </div>

                  {/* Stock warning */}
                  {scannedProduct.quantity <= 10 && (
                    <div
                      className="rounded-lg px-3 py-2 font-jetbrains text-[10px]"
                      style={{
                        background: scannedProduct.quantity === 0
                          ? "rgba(192,57,43,0.08)"
                          : "rgba(225,112,85,0.08)",
                        color: scannedProduct.quantity === 0 ? "#c0392b" : "#e17055",
                      }}
                    >
                      {scannedProduct.quantity === 0
                        ? "Out of stock"
                        : `Low stock — only ${scannedProduct.quantity} left`}
                    </div>
                  )}

                  {/* Qty + Add */}
                  <div className="flex items-center gap-3 mt-auto">
                    <QuantityStepper
                      value={scanQty}
                      onChange={setScanQty}
                      max={scannedProduct.quantity > 0 ? scannedProduct.quantity : undefined}
                    />
                    <button
                      onClick={addToOrder}
                      disabled={scannedProduct.quantity === 0}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan hint */}
          <div
            className="bg-[var(--background)] rounded-xl px-4 py-3"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-dim)] mb-1">
              How it works
            </div>
            <ul className="font-jetbrains text-[10px] text-[var(--text-muted)] space-y-0.5">
              <li>· USB or Bluetooth scanners work automatically — no setup needed</li>
              <li>· Matches product barcode first, then SKU as fallback</li>
              <li>· Scanning the same item again increases quantity in the order</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Order builder ── */}
        <div
          className="bg-[var(--background)] rounded-2xl p-5 flex flex-col gap-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5" />
              Current Order
            </div>
            {orderItems.length > 0 && (
              <button
                onClick={clearOrder}
                className="font-jetbrains text-[9px] text-[var(--text-dim)] hover:text-[#ff4757] transition-colors uppercase tracking-widest"
              >
                Clear
              </button>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 min-h-[140px]">
            <AnimatePresence>
              {orderItems.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-32 gap-2"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ boxShadow: "var(--shadow-inner-md)" }}
                  >
                    <ShoppingCart className="w-4 h-4 text-[var(--text-dim)]" />
                  </div>
                  <p className="font-jetbrains text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
                    No items yet
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="flex items-center gap-3 py-2"
                      style={{ borderBottom: "1px solid #e8ecf1" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-xs font-bold text-[var(--text)] truncate">
                          {item.product.product_name}
                        </div>
                        <div className="font-jetbrains text-[9px] text-[var(--text-dim)]">
                          {item.product.sku} · {formatMoney(item.product.price)} ea
                        </div>
                      </div>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateItemQty(item.product.id, q)}
                      />
                      <div className="font-jetbrains text-xs font-black text-[#ff4757] w-16 text-right">
                        {formatMoney(Number(item.product.price) * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-[var(--text-dim)] hover:text-[#ff4757] transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Total */}
          {orderItems.length > 0 && (
            <div
              className="flex items-center justify-between py-2 rounded-xl px-3"
              style={{ boxShadow: "var(--shadow-inner-md)" }}
            >
              <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                Order Total
              </span>
              <span className="font-jetbrains text-lg font-black text-[#ff4757]">
                {formatMoney(orderTotal)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-shadow)" }} />

          {/* Customer info */}
          <div className="space-y-3">
            <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Customer Info
            </div>
            <ClientPicker
              selectedClient={selectedClient}
              onSelect={handleClientSelect}
              onClear={() => setSelectedClient(null)}
              label="Assign to Client"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Email address"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          {submitError && (
            <div
              className="font-jetbrains text-[10px] text-[#c0392b] rounded-lg px-3 py-2"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {submitError}
            </div>
          )}

          <button
            onClick={submitOrder}
            disabled={submitting || orderItems.length === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Place Order
                {orderItems.length > 0 && ` · ${formatMoney(orderTotal)}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
