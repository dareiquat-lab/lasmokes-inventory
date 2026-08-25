"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Filter, X, ChevronDown, ChevronUp, Printer, Mail, Trash2, Plus, Minus, PlusCircle, Pencil, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/types";
import type { Order, OrderStatus, InvoiceActivity, Product, Client } from "@/types";
import { EmailInvoiceModal } from "@/components/admin/EmailInvoiceModal";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { ClientPicker } from "@/components/admin/ClientPicker";

interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUSES.find(o => o.value === status);
  if (!s) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.color, color: "#ffffff" }}
    >
      {s.label}
    </span>
  );
}

function StatusSelector({ orderId, current, onChange }: {
  orderId: number;
  current: OrderStatus;
  onChange: (id: number, status: OrderStatus) => void;
}) {
  const s = ORDER_STATUSES.find(o => o.value === current);
  const color = s?.color ?? "#1565C0";
  return (
    <select
      value={current}
      onChange={e => onChange(orderId, e.target.value as OrderStatus)}
      className="font-jetbrains text-[9px] uppercase tracking-wider cursor-pointer focus:outline-none rounded-lg font-bold"
      style={{
        background: color,
        border: "none",
        color: "#ffffff",
        padding: "5px 10px",
        minWidth: "110px",
      }}
    >
      {ORDER_STATUSES.map(st => (
        <option key={st.value} value={st.value} style={{ background: st.color, color: "#ffffff" }}>
          {st.label}
        </option>
      ))}
    </select>
  );
}

function OrderRow({
  order,
  onStatusChange,
  onEmail,
  onDelete,
  onEdit,
}: {
  order: Order;
  onStatusChange: (id: number, status: OrderStatus) => void;
  onEmail: (order: Order) => void;
  onDelete: (order: Order) => void;
  onEdit: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activity, setActivity] = useState<InvoiceActivity[] | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const items = order.items || [];

  const handleExpand = useCallback(() => {
    setExpanded((e) => {
      const next = !e;
      if (next && activity === null) {
        setActivityLoading(true);
        fetch(`/api/admin/orders/${order.id}/activity`)
          .then((r) => r.json())
          .then((d) => setActivity(d.activity || []))
          .catch(() => setActivity([]))
          .finally(() => setActivityLoading(false));
      }
      return next;
    });
  }, [order.id, activity]);

  const handlePrint = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(`/admin/orders/${order.id}/invoice`, "_blank");
      fetch(`/api/admin/orders/${order.id}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: "printed" }),
      })
        .then((r) => r.json())
        .then((entry) => {
          if (activity !== null) {
            setActivity((prev) => (prev ? [entry, ...prev] : [entry]));
          }
        })
        .catch(() => {});
    },
    [order.id, activity]
  );

  const handleEmailClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onEmail(order); },
    [onEmail, order]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onDelete(order); },
    [onDelete, order]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onEdit(order); },
    [onEdit, order]
  );

  return (
    <>
      <tr
        className={cn(
          "transition-colors cursor-pointer",
          expanded ? "bg-[#ff475706]" : "hover:bg-[#ff475704]"
        )}
        style={{ borderBottom: "1px solid #f0f2f5" }}
        onClick={handleExpand}
      >
        <td className="table-cell">
          <span className="font-jetbrains text-[#ff4757] text-xs font-bold">{order.order_number}</span>
        </td>
        <td className="table-cell">
          <div>
            <div className="font-sans text-xs text-[var(--text)] font-bold">{order.customer_name}</div>
            <div className="font-jetbrains text-[10px] text-[var(--text-muted)] mt-0.5">{order.customer_phone}</div>
          </div>
        </td>
        <td className="table-cell hidden sm:table-cell">
          <span className="font-jetbrains text-xs text-[var(--text-muted)]">{order.customer_email}</span>
        </td>
        <td className="table-cell hidden md:table-cell">
          <span className="font-jetbrains text-xs text-[var(--text-muted)]">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </td>
        <td className="table-cell hidden lg:table-cell">
          <span className="font-jetbrains text-[10px] text-[var(--text-dim)]">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="table-cell">
          <StatusBadge status={order.status} />
        </td>
        <td className="table-cell" onClick={(e) => e.stopPropagation()}>
          <StatusSelector orderId={order.id} current={order.status} onChange={onStatusChange} />
        </td>
        <td className="table-cell" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Print invoice"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--nm-dark)/20] transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleEditClick}
              title="Edit order"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#0984e3] hover:bg-[#0984e310] transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleEmailClick}
              title="Email invoice"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#ff4757] hover:bg-[#ff475710] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteClick}
              title="Delete order"
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#c0392b] hover:bg-[#c0392b10] transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleExpand} className="p-1.5">
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)]" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#ff475706]">
          <td colSpan={8} className="px-4 py-3">
            <div className="space-y-2">
              {items.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">
                    Items Ordered
                  </div>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 font-jetbrains text-xs">
                      <span className="text-[var(--text-dim)] w-16">{item.product_sku || "—"}</span>
                      <span className="text-[var(--text)] flex-1">{item.product_name}</span>
                      <span className="text-[#ff4757] font-bold">×{item.quantity}</span>
                      <span className="text-[var(--text-muted)]">${Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-jetbrains text-xs text-[var(--text-dim)]">No items recorded</p>
              )}
              {order.notes && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border-shadow)" }}>
                  <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Customer Notes
                  </div>
                  <p className="font-jetbrains text-xs text-[var(--text-muted)]">{order.notes}</p>
                </div>
              )}
              <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border-shadow)" }}>
                <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Invoice Activity
                </div>
                {activityLoading ? (
                  <div className="font-jetbrains text-[10px] text-[var(--text-dim)] animate-pulse">Loading...</div>
                ) : activity && activity.length > 0 ? (
                  <div className="space-y-1">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 font-jetbrains text-[10px]">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wide"
                          style={{
                            fontSize: 8,
                            background: a.action_type === "emailed" ? "#6A1B9A" : "#374151",
                          }}
                        >
                          {a.action_type === "emailed" ? (
                            <Mail className="w-2.5 h-2.5" />
                          ) : (
                            <Printer className="w-2.5 h-2.5" />
                          )}
                          {a.action_type}
                        </span>
                        {a.recipient_email && (
                          <span className="text-[var(--text-muted)]">{a.recipient_email}</span>
                        )}
                        <span className="text-[var(--text-dim)] ml-auto">
                          {new Date(a.performed_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-jetbrains text-[10px] text-[var(--text-dim)]">No activity yet</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface NewItem {
  product_id: number | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  price: number;
}

// ─── ItemsEditor ──────────────────────────────────────────────────────────────

function ItemsEditor({
  items,
  setItems,
}: {
  items: NewItem[];
  setItems: React.Dispatch<React.SetStateAction<NewItem[]>>;
}) {
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customSku, setCustomSku] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [saveToCatalog, setSaveToCatalog] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customError, setCustomError] = useState("");

  useEffect(() => {
    fetch("/api/products?limit=500")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (!saveToCatalog || categories.length > 0) return;
    setLoadingCats(true);
    fetch("/api/admin/categories")
      .then(r => r.json())
      .then(d => setCategories((d.categories || []).map((c: { name: string }) => c.name)))
      .catch(() => {})
      .finally(() => setLoadingCats(false));
  }, [saveToCatalog, categories.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = productSearch.trim()
    ? products
        .filter(
          p =>
            p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearch.toLowerCase())
        )
        .slice(0, 8)
    : products.slice(0, 8);

  const addCatalogProduct = (p: Product) => {
    setItems(prev => {
      const exists = prev.find(i => i.product_id === p.id);
      if (exists) return prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: p.id, product_name: p.product_name, product_sku: p.sku, quantity: 1, price: Number(p.price) }];
    });
    setProductSearch("");
    setShowDropdown(false);
  };

  const resetCustomForm = () => {
    setCustomName("");
    setCustomSku("");
    setCustomPrice("");
    setSaveToCatalog(false);
    setCustomCategory("");
    setCustomError("");
    setShowCustom(false);
  };

  const addCustomItem = async () => {
    const name = customName.trim();
    const price = parseFloat(customPrice);
    if (!name) { setCustomError("Item name is required."); return; }
    if (!customPrice || isNaN(price)) { setCustomError("Price is required."); return; }
    if (saveToCatalog && !customSku.trim()) { setCustomError("SKU is required to save to catalog."); return; }
    if (saveToCatalog && !customCategory) { setCustomError("Category is required to save to catalog."); return; }

    setAddingCustom(true);
    setCustomError("");

    let productId: number | null = null;

    if (saveToCatalog) {
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: name,
            category: customCategory,
            sku: customSku.trim(),
            quantity: 0,
            price,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product");
        productId = data.id;
        setProducts(prev => [...prev, data]);
      } catch (err) {
        setCustomError(err instanceof Error ? err.message : "Failed to save to catalog");
        setAddingCustom(false);
        return;
      }
    }

    setItems(prev => [
      ...prev,
      {
        product_id: productId,
        product_name: name,
        product_sku: customSku.trim() || null,
        quantity: 1,
        price,
      },
    ]);
    resetCustomForm();
    setAddingCustom(false);
  };

  const updateQty = (i: number, qty: number) => {
    if (qty < 1) return setItems(prev => prev.filter((_, idx) => idx !== i));
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, quantity: qty } : item));
  };

  const updatePrice = (i: number, price: number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, price } : item));
  };

  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
        Items
      </div>

      {/* Catalog search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
        <input
          ref={searchRef}
          className="input-field pl-9"
          value={productSearch}
          onChange={e => { setProductSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder={loadingProducts ? "Loading products…" : "Search catalog…"}
        />
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-1 bg-[var(--background)] rounded-xl overflow-hidden z-20"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-3 font-jetbrains text-[10px] text-[var(--text-dim)]">No products found</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  onMouseDown={() => addCatalogProduct(p)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#ff475708] transition-colors"
                  style={{ borderBottom: "1px solid #f0f2f5" }}
                >
                  <div>
                    <div className="font-sans text-xs font-bold text-[var(--text)]">{p.product_name}</div>
                    <div className="font-jetbrains text-[9px] text-[var(--text-dim)]">{p.sku} · {p.category}</div>
                  </div>
                  <div className="font-jetbrains text-xs font-black text-[#ff4757]">
                    ${Number(p.price).toFixed(2)}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Custom item toggle */}
      {!showCustom && (
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className="mt-2 flex items-center gap-1.5 font-jetbrains text-[10px] text-[var(--text-muted)] hover:text-[#ff4757] transition-colors"
        >
          <PackagePlus className="w-3.5 h-3.5" />
          Add custom item
        </button>
      )}

      {/* Custom item inline form */}
      {showCustom && (
        <div
          className="mt-3 rounded-xl p-3 space-y-3"
          style={{ border: "1px solid var(--border-shadow)", background: "var(--background)" }}
        >
          <div className="font-jetbrains text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Custom Item
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="sm:col-span-2">
              <label className="label">Name *</label>
              <input
                className="input-field"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Item name"
                autoFocus
              />
            </div>
            <div>
              <label className="label">SKU {saveToCatalog && "*"}</label>
              <input
                className="input-field font-jetbrains"
                value={customSku}
                onChange={e => setCustomSku(e.target.value)}
                placeholder={saveToCatalog ? "Required for catalog" : "Optional"}
              />
            </div>
            <div>
              <label className="label">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jetbrains text-xs text-[var(--text-dim)]">$</span>
                <input
                  className="input-field pl-6"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Save to catalog toggle */}
          <button
            type="button"
            onClick={() => setSaveToCatalog(v => !v)}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div
              className={cn(
                "w-8 h-4 rounded-full relative transition-colors",
                saveToCatalog ? "bg-[#ff4757]" : "bg-[var(--muted)]"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  saveToCatalog ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
            <span className="font-jetbrains text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
              Also add to product catalog
            </span>
          </button>

          {saveToCatalog && (
            <div>
              <label className="label">Category *</label>
              <select
                className="input-field"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
              >
                <option value="">{loadingCats ? "Loading…" : "Select category"}</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {customError && (
            <p className="font-jetbrains text-[10px] text-[#c0392b]">{customError}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={resetCustomForm} className="btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={addCustomItem}
              disabled={addingCustom}
              className="btn-primary flex items-center gap-2 disabled:opacity-40"
            >
              {addingCustom ? (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      {items.length > 0 && (
        <div className="space-y-2 mt-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-2"
              style={{ borderBottom: "1px solid #f0f2f5" }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-sans text-xs font-bold text-[var(--text)] truncate">{item.product_name}</div>
                <div className="font-jetbrains text-[9px] text-[var(--text-dim)]">
                  {item.product_sku
                    ? item.product_sku
                    : item.product_id === null
                    ? "custom"
                    : "—"}
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => updateQty(i, item.quantity - 1)}
                  className="w-7 h-8 flex items-center justify-center rounded-l-lg text-[var(--text-muted)] hover:text-[#ff4757]"
                  style={{ boxShadow: "var(--shadow-sm)", background: "var(--background)" }}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <div
                  className="w-9 h-8 flex items-center justify-center font-jetbrains text-sm font-black text-[var(--text)]"
                  style={{ background: "var(--background)", boxShadow: "var(--shadow-inner-sm)" }}
                >
                  {item.quantity}
                </div>
                <button
                  type="button"
                  onClick={() => updateQty(i, item.quantity + 1)}
                  className="w-7 h-8 flex items-center justify-center rounded-r-lg text-[var(--text-muted)] hover:text-[#ff4757]"
                  style={{ boxShadow: "var(--shadow-sm)", background: "var(--background)" }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="relative flex-shrink-0 w-24">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jetbrains text-xs text-[var(--text-dim)]">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field pl-6 pr-2 text-right"
                  value={item.price}
                  onChange={e => updatePrice(i, parseFloat(e.target.value) || 0)}
                />
              </div>
              <button
                onClick={() => removeItem(i)}
                className="text-[var(--text-dim)] hover:text-[#ff4757] transition-colors p-1 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div
            className="flex items-center justify-between px-3 py-2 rounded-xl mt-2"
            style={{ boxShadow: "var(--shadow-inner-md)" }}
          >
            <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Order Total</span>
            <span className="font-jetbrains text-sm font-black text-[#ff4757]">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Order Modal ───────────────────────────────────────────────────────

export interface CreateOrderPrefill {
  name?: string;
  phone?: string;
  email?: string;
  businessName?: string;
  tobaccoLicense?: string;
  sellersPermit?: string;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onCreated,
  prefill,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  prefill?: CreateOrderPrefill;
}) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [notes, setNotes] = useState("");
  const [businessName, setBusinessName] = useState(prefill?.businessName ?? "");
  const [tobaccoLicense, setTobaccoLicense] = useState(prefill?.tobaccoLicense ?? "");
  const [sellersPermit, setSellersPermit] = useState(prefill?.sellersPermit ?? "");
  const [items, setItems] = useState<NewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedClient(null);
      setName(prefill?.name ?? "");
      setPhone(prefill?.phone ?? "");
      setEmail(prefill?.email ?? "");
      setNotes("");
      setBusinessName(prefill?.businessName ?? "");
      setTobaccoLicense(prefill?.tobaccoLicense ?? "");
      setSellersPermit(prefill?.sellersPermit ?? "");
      setItems([]);
      setError("");
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    if (client.contact_name) setName(client.contact_name);
    if (client.phone) setPhone(client.phone);
    if (client.email) setEmail(client.email);
    if (client.business_name) setBusinessName(client.business_name);
    if (client.tobacco_license_number) setTobaccoLicense(client.tobacco_license_number);
    if (client.sellers_permit_number) setSellersPermit(client.sellers_permit_number);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Customer name is required."); return; }
    if (!phone.trim()) { setError("Phone is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!items.length) { setError("Add at least one item."); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim(),
          notes: notes.trim() || undefined,
          business_name: businessName.trim() || null,
          tobacco_license_number: tobaccoLicense.trim() || null,
          sellers_permit_number: sellersPermit.trim() || null,
          client_id: selectedClient?.id ?? undefined,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Order" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <ClientPicker
          selectedClient={selectedClient}
          onSelect={handleClientSelect}
          onClear={() => setSelectedClient(null)}
          label="Assign to Client"
        />

        <div>
          <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Customer
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Contact / owner name" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email *</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pickup, delivery, or other notes…" />
            </div>
          </div>
        </div>

        <div>
          <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Business &amp; Compliance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Business Name</label>
              <input className="input-field" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Store / company name" />
            </div>
            <div>
              <label className="label">Tobacco License #</label>
              <input className="input-field font-jetbrains" value={tobaccoLicense} onChange={e => setTobaccoLicense(e.target.value)} placeholder="License number" />
            </div>
            <div>
              <label className="label">Sellers Permit #</label>
              <input className="input-field font-jetbrains" value={sellersPermit} onChange={e => setSellersPermit(e.target.value)} placeholder="Permit number" />
            </div>
          </div>
        </div>

        <ItemsEditor key={isOpen ? "open" : "closed"} items={items} setItems={setItems} />

        {error && (
          <div
            className="rounded-lg px-3 py-2 font-jetbrains text-xs text-[#c0392b]"
            style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-40">
            {submitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                Create Order
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Edit Order Modal ─────────────────────────────────────────────────────────

function EditOrderModal({
  order,
  isOpen,
  onClose,
  onSaved,
}: {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tobaccoLicense, setTobaccoLicense] = useState("");
  const [sellersPermit, setSellersPermit] = useState("");
  const [items, setItems] = useState<NewItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && order) {
      setSelectedClient(null);
      setName(order.customer_name);
      setPhone(order.customer_phone);
      setEmail(order.customer_email);
      setNotes(order.notes || "");
      setBusinessName("");
      setTobaccoLicense("");
      setSellersPermit("");
      setItems(
        (order.items || []).map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          product_sku: i.product_sku,
          quantity: i.quantity,
          price: Number(i.price),
        }))
      );
      setError("");

      if (order.client_id) {
        fetch(`/api/admin/clients/${order.client_id}`)
          .then(r => r.json())
          .then(c => {
            if (!c || c.error) return;
            setSelectedClient(c as Client);
            if (c.business_name) setBusinessName(c.business_name);
            if (c.tobacco_license_number) setTobaccoLicense(c.tobacco_license_number);
            if (c.sellers_permit_number) setSellersPermit(c.sellers_permit_number);
          })
          .catch(() => {});
      }
    }
  }, [isOpen, order]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    if (client.contact_name) setName(client.contact_name);
    if (client.phone) setPhone(client.phone);
    if (client.email) setEmail(client.email);
    if (client.business_name) setBusinessName(client.business_name);
    if (client.tobacco_license_number) setTobaccoLicense(client.tobacco_license_number);
    if (client.sellers_permit_number) setSellersPermit(client.sellers_permit_number);
  };

  const handleSubmit = async () => {
    if (!order) return;
    if (!name.trim()) { setError("Customer name is required."); return; }
    if (!phone.trim()) { setError("Phone is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (!items.length) { setError("Add at least one item."); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim(),
          notes: notes.trim() || undefined,
          business_name: businessName.trim() || null,
          tobacco_license_number: tobaccoLicense.trim() || null,
          sellers_permit_number: sellersPermit.trim() || null,
          client_id: selectedClient ? selectedClient.id : null,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Order ${order?.order_number ?? ""}`} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <ClientPicker
          selectedClient={selectedClient}
          onSelect={handleClientSelect}
          onClear={() => setSelectedClient(null)}
          label="Client"
        />

        <div>
          <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Customer
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Contact / owner name" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email *</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pickup, delivery, or other notes…" />
            </div>
          </div>
        </div>

        <div>
          <div className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Business &amp; Compliance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Business Name</label>
              <input className="input-field" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Store / company name" />
            </div>
            <div>
              <label className="label">Tobacco License #</label>
              <input className="input-field font-jetbrains" value={tobaccoLicense} onChange={e => setTobaccoLicense(e.target.value)} placeholder="License number" />
            </div>
            <div>
              <label className="label">Sellers Permit #</label>
              <input className="input-field font-jetbrains" value={sellersPermit} onChange={e => setSellersPermit(e.target.value)} placeholder="Permit number" />
            </div>
          </div>
        </div>

        <ItemsEditor key={order?.id ?? "edit"} items={items} setItems={setItems} />

        {error && (
          <div
            className="rounded-lg px-3 py-2 font-jetbrains text-xs text-[#c0392b]"
            style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-40">
            {submitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── OrdersClient ─────────────────────────────────────────────────────────────

export function OrdersClient() {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout>();
  const pendingIds = useRef<Set<number>>(new Set());
  const [emailModalOrder, setEmailModalOrder] = useState<Order | null>(null);
  const [deleteModalOrder, setDeleteModalOrder] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOrder, setEditModalOrder] = useState<Order | null>(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        page: String(page),
        limit: "25",
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const json: PaginatedOrders = await res.json();
      setData(prev => {
        if (!prev || pendingIds.current.size === 0) return json;
        return {
          ...json,
          orders: json.orders.map(fresh =>
            pendingIds.current.has(fresh.id)
              ? (prev.orders.find(o => o.id === fresh.id) ?? fresh)
              : fresh
          ),
        };
      });
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const id = setInterval(() => fetchOrders(true), 10_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const handleStatusChange = useCallback(async (orderId: number, status: OrderStatus) => {
    const originalStatus = data?.orders.find(o => o.id === orderId)?.status;
    pendingIds.current.add(orderId);
    setData(d => d
      ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status } : o) }
      : d
    );
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Status update failed:", err?.error ?? res.status);
        if (originalStatus) {
          setData(d => d
            ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status: originalStatus } : o) }
            : d
          );
        }
      }
    } catch (e) {
      console.error(e);
      if (originalStatus) {
        setData(d => d
          ? { ...d, orders: d.orders.map(o => o.id === orderId ? { ...o, status: originalStatus } : o) }
          : d
        );
      }
    } finally {
      pendingIds.current.delete(orderId);
    }
  }, [data]);

  const handleDeleteOrder = useCallback(async () => {
    if (!deleteModalOrder) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/admin/orders/${deleteModalOrder.id}`, { method: "DELETE" });
      setDeleteModalOrder(null);
      fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteModalOrder, fetchOrders]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2 flex-shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          New Order
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, name, email, phone..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[#ff4757]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field pl-9 pr-8 min-w-[160px] cursor-pointer"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="font-jetbrains text-[10px] text-[var(--text-dim)]">
          {data.total.toLocaleString()} order{data.total !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
          {statusFilter && ` · status: ${statusFilter}`}
        </div>
      )}

      {/* Table */}
      <div
        className="bg-[var(--background)] rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-shadow)" }}>
                <th className="table-header">Order #</th>
                <th className="table-header">Customer</th>
                <th className="table-header hidden sm:table-cell">Email</th>
                <th className="table-header hidden md:table-cell">Items</th>
                <th className="table-header hidden lg:table-cell">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Update</th>
                <th className="table-header w-8"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-[var(--muted)] rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.orders.length ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center"
                        style={{ boxShadow: "var(--shadow-inner-md)" }}
                      >
                        <Search className="w-5 h-5 text-[var(--text-dim)]" />
                      </div>
                      <p className="font-jetbrains text-xs text-[var(--text-dim)] uppercase tracking-widest">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.orders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onEmail={setEmailModalOrder}
                    onDelete={setDeleteModalOrder}
                    onEdit={setEditModalOrder}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border-shadow)" }}>
            <span className="font-jetbrains text-[10px] text-[var(--text-dim)]">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 font-jetbrains text-[9px] text-[var(--text-muted)] hover:text-[#ff4757] disabled:opacity-30 rounded-lg transition-all"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-3 py-1 font-jetbrains text-[9px] text-[var(--text-muted)] hover:text-[#ff4757] disabled:opacity-30 rounded-lg transition-all"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchOrders()}
      />

      <EditOrderModal
        order={editModalOrder}
        isOpen={!!editModalOrder}
        onClose={() => setEditModalOrder(null)}
        onSaved={() => fetchOrders()}
      />

      {emailModalOrder && (
        <EmailInvoiceModal
          order={emailModalOrder}
          isOpen={!!emailModalOrder}
          onClose={() => setEmailModalOrder(null)}
          onSent={() => setEmailModalOrder(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteModalOrder}
        onClose={() => setDeleteModalOrder(null)}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message={`Permanently delete order ${deleteModalOrder?.order_number} for ${deleteModalOrder?.customer_name}? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        isDanger
      />
    </div>
  );
}
