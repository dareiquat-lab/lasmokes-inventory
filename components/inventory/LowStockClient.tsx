"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Edit2, TrendingUp } from "lucide-react";
import Link from "next/link";

import { CategoryBadge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product } from "@/types";

export function LowStockClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?lowStock=true&limit=100&sortBy=quantity&sortOrder=asc");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLowStock(); }, []);

  const handleQuickUpdate = async () => {
    if (!quickEditProduct || !newQuantity) return;
    setIsSaving(true);
    try {
      await fetch(`/api/products/${quickEditProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseInt(newQuantity) }),
      });
      setQuickEditProduct(null);
      setNewQuantity("");
      fetchLowStock();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const openQuickEdit = (product: Product) => {
    setQuickEditProduct(product);
    setNewQuantity(String(product.quantity));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--background)] rounded-xl p-4 animate-pulse flex gap-3"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 bg-[var(--muted)] rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--muted)] rounded w-48" />
              <div className="h-3 bg-[var(--muted)] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="bg-[var(--background)] rounded-2xl p-12 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--background)] mb-3"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
        <p className="font-sans text-sm font-black text-[#00856f] uppercase tracking-widest mb-1">
          All Stocked Up
        </p>
        <p className="font-jetbrains text-[var(--text-muted)] text-sm">No products are running low on stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div
        className="bg-[var(--background)] rounded-xl px-4 py-3 flex items-center gap-2"
        style={{
          boxShadow: "var(--shadow-sm)",
          border: "1px solid rgba(225,112,85,0.3)",
        }}
      >
        <AlertTriangle className="w-4 h-4 text-[#e17055] flex-shrink-0" />
        <p className="font-jetbrains text-[10px] font-black text-[#c0602a] uppercase tracking-widest">
          {products.length} item{products.length !== 1 ? "s" : ""} at or below low stock threshold
        </p>
      </div>

      <div
        className="bg-[var(--background)] rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-shadow)" }}>
                <th className="table-header w-10">IMG</th>
                <th className="table-header">Product</th>
                <th className="table-header hidden sm:table-cell">Category</th>
                <th className="table-header hidden md:table-cell">SKU</th>
                <th className="table-header">Qty</th>
                <th className="table-header hidden lg:table-cell">Price</th>
                <th className="table-header">OPS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-[#e1705508]"
                  style={{ borderBottom: "1px solid #f0f2f5" }}
                >
                  <td className="table-cell">
                    {product.image_url ? (
                      <div
                        className="w-8 h-8 overflow-hidden rounded-lg"
                        style={{ boxShadow: "var(--shadow-sm)" }}
                      >
                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <CategoryIcon category={product.category} size="sm" />
                    )}
                  </td>
                  <td className="table-cell">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-sans text-[var(--text)] hover:text-[#ff4757] font-bold transition-colors text-sm"
                    >
                      {product.product_name}
                    </Link>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <CategoryBadge category={product.category} />
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="font-jetbrains text-xs text-[var(--text-muted)]">{product.sku}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-jetbrains text-lg font-black",
                        product.quantity === 0 ? "text-[#c0392b]" : "text-[#c0602a]"
                      )}>
                        {product.quantity}
                      </span>
                      {product.quantity === 0 && (
                        <span
                          className="badge text-[#c0392b] border-[#c0392b30] bg-[#c0392b10]"
                        >
                          OUT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell font-jetbrains text-[var(--text-muted)]">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openQuickEdit(product)}
                        className="font-jetbrains text-[9px] text-white font-black bg-[#ff4757] px-2 py-1 rounded-lg transition-all uppercase tracking-wider hover:brightness-110 active:translate-y-px"
                        style={{ boxShadow: "2px 2px 6px rgba(166,50,60,0.3), -1px -1px 3px rgba(255,100,110,0.2)" }}
                      >
                        Restock
                      </button>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 text-[var(--text-dim)] hover:text-[#ff4757] rounded-lg transition-colors hover:bg-[#ff475710]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick restock modal */}
      <Modal
        isOpen={!!quickEditProduct}
        onClose={() => { setQuickEditProduct(null); setNewQuantity(""); }}
        title="Quick Restock"
      >
        {quickEditProduct && (
          <div className="space-y-4">
            <div>
              <p className="font-sans text-xs font-black uppercase tracking-wider text-[#ff4757]">
                {quickEditProduct.product_name}
              </p>
              <p className="font-jetbrains text-[var(--text-muted)] text-xs mt-0.5">
                Current: {quickEditProduct.quantity} units
              </p>
            </div>
            <div>
              <label className="label">New Quantity</label>
              <input
                type="number"
                min="0"
                value={newQuantity}
                onChange={e => setNewQuantity(e.target.value)}
                className="input-field"
                placeholder="Enter new quantity"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setQuickEditProduct(null); setNewQuantity(""); }} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleQuickUpdate} disabled={isSaving || !newQuantity} className="btn-primary">
                {isSaving ? "Saving..." : "Update Stock"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
