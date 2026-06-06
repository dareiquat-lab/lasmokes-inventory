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
            <div className="w-10 h-10 bg-[#222] rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#222] rounded w-48" />
              <div className="h-3 bg-[#1a1a1a] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card p-12 text-center">
        <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">All stocked up!</p>
        <p className="text-gray-500 text-sm">No products are running low on stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-amber-400 text-sm font-medium">
          {products.length} product{products.length !== 1 ? "s" : ""} at or below the low stock threshold
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                <th className="table-header w-10">Image</th>
                <th className="table-header">Product</th>
                <th className="table-header hidden sm:table-cell">Category</th>
                <th className="table-header hidden md:table-cell">SKU</th>
                <th className="table-header">Qty</th>
                <th className="table-header hidden lg:table-cell">Price</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors"
                >
                  <td className="table-cell">
                    {product.image_url ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2a2a2a]">
                        <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <CategoryIcon category={product.category} size="sm" />
                    )}
                  </td>
                  <td className="table-cell">
                    <Link href={`/products/${product.id}`} className="text-white hover:text-emerald-400 font-medium transition-colors text-sm">
                      {product.product_name}
                    </Link>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <CategoryBadge category={product.category} />
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="font-mono text-xs text-gray-400">{product.sku}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-lg font-bold",
                        product.quantity === 0 ? "text-red-400" : "text-amber-400"
                      )}>
                        {product.quantity}
                      </span>
                      {product.quantity === 0 && (
                        <span className="badge bg-red-500/10 text-red-400 border-red-500/20">Out</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell hidden lg:table-cell text-gray-300">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openQuickEdit(product)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 transition-colors"
                      >
                        Restock
                      </button>
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-md transition-colors"
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
              <p className="text-white font-medium">{quickEditProduct.product_name}</p>
              <p className="text-gray-500 text-xs mt-0.5">Current: {quickEditProduct.quantity} units</p>
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
              <button onClick={() => { setQuickEditProduct(null); setNewQuantity(""); }} className="btn-secondary">Cancel</button>
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
