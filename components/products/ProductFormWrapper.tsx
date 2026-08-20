"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "./ImageUpload";
import { ConfirmModal } from "@/components/ui/Modal";
import type { Product } from "@/types";

const productSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200),
  category:     z.string().min(1, "Category is required"),
  sku:          z.string().min(1, "SKU is required").max(50),
  quantity:     z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  price:        z.coerce.number().min(0, "Price must be 0 or more"),
  cost:         z.coerce.number().min(0, "Cost must be 0 or more").optional(),
  barcode:      z.string().optional(),
  notes:        z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormWrapperProps {
  product?: Product;
}

export function ProductFormWrapper({ product }: ProductFormWrapperProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [skuSuggesting, setSkuSuggesting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) =>
        setCategories((data.categories || []).map((c: { name: string }) => c.name))
      )
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: product?.product_name || "",
      category:     product?.category || "",
      sku:          product?.sku || "",
      quantity:     product?.quantity ?? 0,
      price:        product?.price ?? 0,
      cost:         product?.cost ?? 0,
      barcode:      product?.barcode || "",
      notes:        product?.notes || "",
    },
  });

  const watchedCategory = watch("category");

  const autoSuggestSKU = async (category: string) => {
    if (!category || isEditing) return;
    setSkuSuggesting(true);
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=200`);
      const data = await res.json();
      const existingSkus = (data.products || []).map((p: Product) => p.sku);

      const prefixMap: Record<string, string> = {
        Cigarettes: "CIG", Cigars: "CGR", Wraps: "WRP",
        "Rolling Papers": "PPR", Lighters: "LTR", Batteries: "BAT",
        Butane: "BUT", Incense: "INC", Medication: "MED",
        Accessories: "ACC", "Eye Care": "EYE", Condoms: "CON",
      };
      const prefix = prefixMap[category] || "GEN";
      const nums = existingSkus
        .filter((s: string) => s.startsWith(prefix))
        .map((s: string) => parseInt(s.split("-")[1] || "0"))
        .filter((n: number) => !isNaN(n));
      const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
      setValue("sku", `${prefix}-${String(next).padStart(3, "0")}`);
    } catch {
      // ignore
    } finally {
      setSkuSuggesting(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    setSaveError("");
    try {
      const payload = { ...data, image_url: imageUrl };
      const url = isEditing ? `/api/products/${product!.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      router.push("/admin/inventory");
      router.refresh();
    } catch {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            <div
              className="bg-[var(--background)] rounded-2xl p-5 space-y-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Section heading */}
              <div className="pb-3" style={{ borderBottom: "1px solid var(--border-shadow)" }}>
                <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Product Information
                </h2>
              </div>

              <div>
                <label className="label">Product Name *</label>
                <input
                  {...register("product_name")}
                  type="text"
                  placeholder="e.g. Marlboro Red Pack"
                  className="input-field"
                />
                {errors.product_name && (
                  <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.product_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category *</label>
                  <select
                    {...register("category", {
                      onChange: (e) => autoSuggestSKU(e.target.value),
                    })}
                    className="input-field appearance-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    SKU *
                    {skuSuggesting && (
                      <span className="text-[#ff4757] ml-2 text-[9px] animate-pulse">Auto-generating...</span>
                    )}
                  </label>
                  <input
                    {...register("sku")}
                    type="text"
                    placeholder="e.g. CIG-044"
                    className="input-field"
                  />
                  {errors.sku && (
                    <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.sku.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity *</label>
                  <input
                    {...register("quantity")}
                    type="number"
                    min="0"
                    placeholder="0"
                    className="input-field"
                  />
                  {errors.quantity && (
                    <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jetbrains text-[var(--text-dim)] text-sm">$</span>
                    <input
                      {...register("price")}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="input-field pl-7"
                    />
                  </div>
                  {errors.price && (
                    <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.price.message}</p>
                  )}
                </div>
              </div>

              {/* Cost — admin-only, never shown on storefront */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: "rgba(255,71,87,0.04)", border: "1px solid rgba(255,71,87,0.15)" }}
              >
                <div className="flex items-center gap-2">
                  <label className="label mb-0">Your Cost (Admin Only)</label>
                  <span
                    className="font-jetbrains text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold"
                    style={{ background: "rgba(255,71,87,0.12)", color: "#ff4757" }}
                  >
                    Private
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jetbrains text-[var(--text-dim)] text-sm">$</span>
                  <input
                    {...register("cost")}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="input-field pl-7"
                  />
                </div>
                <p className="font-jetbrains text-[9px] text-[var(--text-dim)]">
                  Used for margin and profit calculations. Not visible to customers.
                </p>
                {errors.cost && (
                  <p className="font-jetbrains text-[#c0392b] text-xs mt-1">{errors.cost.message}</p>
                )}
              </div>

              <div>
                <label className="label">Barcode (Optional)</label>
                <input
                  {...register("barcode")}
                  type="text"
                  placeholder="e.g. 012345678901"
                  className="input-field"
                />
                <p className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-1">
                  For barcode scanner support
                </p>
              </div>

              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="Internal notes about this product..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Image upload */}
            <div
              className="bg-[var(--background)] rounded-2xl p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageChange={setImageUrl}
                category={watchedCategory}
              />
            </div>

            {/* Actions */}
            <div
              className="bg-[var(--background)] rounded-2xl p-5 space-y-3"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Actions
              </h2>

              {saveError && (
                <div
                  className="font-jetbrains text-[#c0392b] rounded-lg px-3 py-2 text-xs"
                  style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
                >
                  {saveError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {isEditing ? "Save Changes" : "Add Product"}
                  </>
                )}
              </button>

              <Link
                href="/admin/inventory"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Inventory
              </Link>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full btn-danger flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Product
                </button>
              )}
            </div>

            {/* Product meta */}
            {isEditing && product && (
              <div
                className="bg-[var(--background)] rounded-2xl p-5 space-y-2"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="font-jetbrains text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
                  Record Info
                </h2>
                <div className="font-jetbrains text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">ID</span>
                    <span className="text-[#0984e3] font-bold">#{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Created</span>
                    <span className="text-[var(--text-muted)]">{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Updated</span>
                    <span className="text-[var(--text-muted)]">{new Date(product.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.product_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        isDanger
      />
    </motion.div>
  );
}
