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
        <Link href="/products" className="flex items-center gap-1.5 font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] hover:text-[#00ff88] transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Products
        </Link>
        <span className="text-[#1e1e2e] font-jetbrains text-[9px]">/</span>
        <span className="font-orbitron text-[9px] uppercase tracking-widest text-[#2e2e4a]">
          {product.category}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div
          className="aspect-square bg-[#0d0d17] border border-[#1e1e2e] overflow-hidden"
          style={{ clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))" }}
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
            <span className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">
              {product.category}
            </span>
          </div>

          {/* Name */}
          <h1 className="font-orbitron text-xl font-black text-[#e0e0f0] tracking-wide leading-tight">
            {product.product_name}
          </h1>

          {/* SKU */}
          <div className="font-jetbrains text-[10px] text-[#2e2e4a]">
            SKU: <span className="text-[#4a4a6a]">{product.sku}</span>
          </div>

          {/* Price */}
          <div
            className="inline-block border border-[#00ff8830] bg-[#00ff8808] px-4 py-2"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <span className="font-jetbrains text-2xl font-black text-[#00ff88]">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${outOfStock ? "bg-[#ff3366]" : lowStock ? "bg-[#cccc00]" : "bg-[#00ff88] animate-pulse"}`}
              style={{ boxShadow: outOfStock ? "0 0 6px #ff3366" : lowStock ? "0 0 6px #cccc00" : "0 0 6px #00ff88" }}
            />
            <span className={`font-orbitron text-[9px] uppercase tracking-widest ${
              outOfStock ? "text-[#ff3366]" : lowStock ? "text-[#cccc00]" : "text-[#00ff88]"
            }`}>
              {outOfStock ? "Out of Stock" : lowStock ? `Low Stock — ${product.quantity} left` : `In Stock`}
            </span>
          </div>

          {/* Notes */}
          {product.notes && (
            <div
              className="bg-[#0d0d17] border border-[#1e1e2e] p-3"
              style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
            >
              <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a] mb-1">Notes</div>
              <p className="font-jetbrains text-xs text-[#4a4a6a] leading-relaxed">{product.notes}</p>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* How ordering works */}
          <div
            className="bg-[#0d0d17] border border-[#1e1e2e] p-4 space-y-1.5"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a] mb-2">How it works</div>
            {["Add to cart", "Submit your request with name + phone", "We contact you to confirm"].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-orbitron text-[8px] text-[#00ff88] w-4">{i + 1}.</span>
                <span className="font-jetbrains text-[10px] text-[#4a4a6a]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-[#1e1e2e]">
        <Link href="/products" className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] hover:text-[#00ff88] transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all products
        </Link>
      </div>
    </div>
  );
}
