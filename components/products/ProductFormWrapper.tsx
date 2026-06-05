"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "./ImageUpload";
import { ConfirmModal } from "@/components/ui/Modal";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";

const productSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(200),
  category: z.string().min(1, "Category is required"),
  sku: z.string().min(1, "SKU is required").max(50),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  barcode: z.string().optional(),
  notes: z.string().optional(),
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: product?.product_name || "",
      category: product?.category || "",
      sku: product?.sku || "",
      quantity: product?.quantity ?? 0,
      price: product?.price ?? 0,
      barcode: product?.barcode || "",
      notes: product?.notes || "",
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
      const sku = `${prefix}-${String(next).padStart(3, "0")}`;
      setValue("sku", sku);
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

      router.push("/inventory");
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
      router.push("/inventory");
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
            <div className="card p-5 space-y-5">
              <h2 className="text-sm font-semibold text-white border-b border-[#1f1f1f] pb-3">
                Product Information
              </h2>

              <div>
                <label className="label">Product Name *</label>
                <input
                  {...register("product_name")}
                  type="text"
                  placeholder="e.g. Marlboro Red Pack"
                  className="input-field"
                />
                {errors.product_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.product_name.message}</p>
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
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && (
                    <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    SKU *
                    {skuSuggesting && <span className="text-emerald-400 ml-1 text-[10px]">Auto-generating...</span>}
                  </label>
                  <input
                    {...register("sku")}
                    type="text"
                    placeholder="e.g. CIG-044"
                    className="input-field font-mono"
                  />
                  {errors.sku && (
                    <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>
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
                    <p className="text-red-400 text-xs mt-1">{errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      {...register("price")}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="input-field pl-6"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Barcode (Optional)</label>
                <input
                  {...register("barcode")}
                  type="text"
                  placeholder="e.g. 012345678901"
                  className="input-field font-mono"
                />
                <p className="text-[10px] text-gray-600 mt-1">For future barcode scanner support</p>
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
            <div className="card p-5">
              <ImageUpload
                currentImageUrl={imageUrl}
                onImageChange={setImageUrl}
                category={watchedCategory}
              />
            </div>

            {/* Actions */}
            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white">Actions</h2>

              {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-2 text-xs">
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
                    <Save className="w-4 h-4" />
                    {isEditing ? "Save Changes" : "Add Product"}
                  </>
                )}
              </button>

              <Link
                href="/inventory"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Inventory
              </Link>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full btn-danger flex items-center justify-center gap-2 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Product
                </button>
              )}
            </div>

            {/* Product meta */}
            {isEditing && product && (
              <div className="card p-5 space-y-2">
                <h2 className="text-sm font-semibold text-white mb-3">Product Info</h2>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID</span>
                    <span className="text-gray-300 font-mono">#{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-300">{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Updated</span>
                    <span className="text-gray-300">{new Date(product.updated_at).toLocaleDateString()}</span>
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
        confirmLabel="Delete Product"
        isLoading={isDeleting}
        isDanger
      />
    </motion.div>
  );
}
