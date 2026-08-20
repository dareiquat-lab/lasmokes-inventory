import { getProductById } from "@/lib/db";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  let product: Product | null = null;
  try {
    product = await getProductById(parseInt(params.id)) as Product;
  } catch {
    product = null;
  }

  if (!product) notFound();

  const outOfStock = product.quantity === 0;
  const lowStock = !outOfStock && product.quantity <= 10;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/products" className="flex items-center gap-1.5 font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[#ff4757] transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Products
        </Link>
        <span className="text-[var(--text-dim)] font-jetbrains text-[9px]">/</span>
        <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-dim)]">
          {product.category}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div
          className="aspect-square bg-[var(--muted)] rounded-2xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon category={product.category} size="lg" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Category */}
          <div>
            <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-sans text-xl font-black text-[var(--text)] tracking-tight leading-tight">
            {product.product_name}
          </h1>

          {/* SKU */}
          <div className="font-jetbrains text-[10px] text-[var(--text-dim)]">
            SKU: <span className="text-[var(--text-muted)]">{product.sku}</span>
          </div>

          {/* Price */}
          <div
            className="inline-block bg-[var(--background)] px-4 py-2 rounded-xl"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <span className="font-jetbrains text-2xl font-black text-[#ff4757]">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${outOfStock ? "bg-[#c0392b]" : lowStock ? "bg-[#e17055] animate-pulse" : "bg-green-500 animate-pulse"}`}
              style={{
                boxShadow: outOfStock
                  ? "0 0 6px rgba(192,57,43,0.7)"
                  : lowStock
                  ? "0 0 6px rgba(225,112,85,0.7)"
                  : "0 0 6px rgba(34,197,94,0.7)"
              }}
            />
            <span className={`font-jetbrains text-[9px] uppercase tracking-widest ${
              outOfStock ? "text-[#c0392b]" : lowStock ? "text-[#c0602a]" : "text-[#00856f]"
            }`}>
              {outOfStock ? "Out of Stock" : lowStock ? `Low Stock — ${product.quantity} left` : "In Stock"}
            </span>
          </div>

          {/* Notes */}
          {product.notes && (
            <div
              className="bg-[var(--background)] rounded-xl p-3"
              style={{ boxShadow: "var(--shadow-recessed)" }}
            >
              <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Notes</div>
              <p className="font-jetbrains text-xs text-[var(--text-muted)] leading-relaxed">{product.notes}</p>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* How ordering works */}
          <div
            className="bg-[var(--background)] rounded-xl p-4 space-y-1.5"
            style={{ boxShadow: "var(--shadow-recessed)" }}
          >
            <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[var(--text-muted)] mb-2">How it works</div>
            {["Add to cart", "Submit your request with name + phone", "We contact you to confirm"].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-jetbrains text-[8px] text-[#ff4757] font-bold w-4">{i + 1}.</span>
                <span className="font-jetbrains text-[10px] text-[var(--text-muted)]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-shadow)" }}>
        <Link href="/products" className="font-jetbrains text-[9px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[#ff4757] transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all products
        </Link>
      </div>
    </div>
  );
}
