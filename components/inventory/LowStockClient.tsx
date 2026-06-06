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
          <div key={i} className="card p-4 animate-pulse flex gap-3">
            <div className="w-10 h-10 bg-[#0d0d17] clip-chamfer-sm" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#0d0d17] rounded w-48" />
              <div className="h-3 bg-[#0a0a0f] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card p-12 text-center border-[#00ff8820]">
        <TrendingUp className="w-12 h-12 text-[#00ff88] mx-auto mb-3 drop-shadow-[0_0_10px_#00ff88]" />
        <p className="font-orbitron text-sm font-black text-[#00ff88] uppercase tracking-widest mb-1">
          All Stocked Up
        </p>
        <p className="font-jetbrains text-[#4a4a6a] text-sm">No products are running low on stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div
        className="border border-[#ffff0030] bg-[#ffff0008] px-4 py-3 flex items-center gap-2 clip-chamfer-md"
        style={{ boxShadow: "0 0 15px #ffff0010" }}
      >
        <AlertTriangle className="w-4 h-4 text-[#cccc00] flex-shrink-0 drop-shadow-[0_0_6px_#cccc00]" />
        <p className="font-orbitron text-[10px] font-black text-[#cccc00] uppercase tracking-widest">
          {products.length} item{products.length !== 1 ? "s" : ""} at or below low stock threshold
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
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
                  className="border-b border-[#0d0d17] hover:bg-[#ffff0004] transition-colors"
                >
                  <td className="table-cell">
                    {product.image_url ? (
                      <div
                        className="w-8 h-8 overflow-hidden border border-[#ffff0020]"
                        style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
                      >
                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <CategoryIcon category={product.category} size="sm" />
                    )}
                  </td>
                  <td className="table-cell">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-jetbrains text-[#c0c0d8] hover:text-[#00ff88] font-bold transition-colors text-sm"
                    >
                      {product.product_name}
                    </Link>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <CategoryBadge category={product.category} />
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="font-jetbrains text-xs text-[#4a4a6a]">{product.sku}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-jetbrains text-lg font-black",
                        product.quantity === 0 ? "text-[#ff3366] drop-shadow-[0_0_6px_#ff3366]" : "text-[#cccc00]"
                      )}>
                        {product.quantity}
                      </span>
                      {product.quantity === 0 && (
                        <span className="badge font-orbitron bg-[#ff336610] text-[#ff3366] border-[#ff336630]">
                          OUT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell font-jetbrains text-[#4a4a6a]">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openQuickEdit(product)}
                        className="font-orbitron text-[9px] text-[#00ff88] font-black bg-[#00ff8810] border border-[#00ff8830] hover:bg-[#00ff8820] px-2 py-1 clip-chamfer-sm transition-all uppercase tracking-wider"
                      >
                        Restock
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-[#2e2e4a] hover:text-[#00ff88] hover:bg-[#00ff8810] clip-chamfer-sm transition-colors"
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
              <p className="font-orbitron text-xs font-black uppercase tracking-wider text-[#00ff88]">
                {quickEditProduct.product_name}
              </p>
              <p className="font-jetbrains text-[#4a4a6a] text-xs mt-0.5">
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
