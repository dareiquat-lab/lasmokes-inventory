import Link from "next/link";
import { getStorefrontProducts, getCategories } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CATEGORY_ICONS } from "@/types";
import { ShoppingCart, Package, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getStorefrontProducts>>["products"] = [];
  let total = 0;
  let categories: { name: string }[] = [];

  try {
    const [result, cats] = await Promise.all([
      getStorefrontProducts({ limit: 8, page: 1 }),
      getCategories(),
    ]);
    featured = result.products;
    total = result.total;
    categories = cats as { name: string }[];
  } catch {
    // DB not connected
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[480px] flex items-center overflow-hidden bg-[#e0e5ec]">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="font-jetbrains text-[10px] uppercase tracking-widest text-[#4a5568] mb-4 flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-green-500"
              style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }}
            />
            Official Smoke Shop
          </div>
          <h1 className="font-sans text-4xl md:text-6xl font-black text-[#2d3436] leading-tight tracking-tight mb-3">
            <span className="text-[#ff4757]">LA</span> SMOKES
          </h1>
          <p className="font-jetbrains text-sm text-[#4a5568] max-w-md leading-relaxed mb-8">
            Premium smoke shop. Browse our full catalog of cigarettes, cigars, wraps, accessories, and more.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              Browse All Products
            </Link>
            <Link href="/categories" className="btn-secondary flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Shop by Category
            </Link>
          </div>

          {total > 0 && (
            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="font-jetbrains text-xl font-black text-[#ff4757]">{total}</div>
                <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[#4a5568]">Products</div>
              </div>
              <div className="w-px h-8 bg-[#babecc]" />
              <div>
                <div className="font-jetbrains text-xl font-black text-[#0984e3]">{categories.length}</div>
                <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[#4a5568]">Categories</div>
              </div>
              <div className="w-px h-8 bg-[#babecc]" />
              <div>
                <div className="font-jetbrains text-xl font-black text-[#6c5ce7]">0%</div>
                <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[#4a5568]">Tax Online</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 bg-[#d1d9e6]" style={{ borderTop: "1px solid #babecc", borderBottom: "1px solid #babecc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🛒", title: "Browse & Select", desc: "Browse our full catalog and add items to your cart" },
              { icon: "📝", title: "Submit Request", desc: "Leave your name, phone, and email — no payment needed" },
              { icon: "📞", title: "We Contact You", desc: "We'll reach out to confirm your order for pickup" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-10 h-10 flex-shrink-0 bg-[#e0e5ec] rounded-xl flex items-center justify-center text-lg"
                  style={{ boxShadow: "4px 4px 8px #babecc, -4px -4px 8px #ffffff" }}
                >
                  {step.icon}
                </div>
                <div>
                  <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#2d3436]">{step.title}</div>
                  <p className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="font-sans text-lg font-black text-[#2d3436] tracking-tight">
                  Featured Products
                </h2>
                <p className="font-jetbrains text-[10px] text-[#4a5568] mt-0.5">Latest additions to the catalog</p>
              </div>
              <Link href="/products" className="font-jetbrains text-[9px] uppercase tracking-widest text-[#ff4757] hover:text-[#ff6b7a] transition-colors font-bold">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map(p => (
                <ProductCard key={p.id} product={p as Parameters<typeof ProductCard>[0]["product"]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category grid */}
      <section className="py-12" style={{ borderTop: "1px solid #babecc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h2 className="font-sans text-lg font-black text-[#2d3436] tracking-tight">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.name}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-3 bg-[#e0e5ec] rounded-xl transition-all duration-200 hover:-translate-y-0.5 group"
                style={{ boxShadow: "4px 4px 10px #babecc, -4px -4px 10px #ffffff" }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{CATEGORY_ICONS[cat.name] || "📦"}</span>
                <div className="font-jetbrains text-[8px] uppercase tracking-wider text-[#4a5568] group-hover:text-[#ff4757] text-center leading-tight transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA */}
      <section className="py-12" style={{ borderTop: "1px solid #babecc" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e0e5ec] mb-4"
            style={{ boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff" }}
          >
            <ShoppingCart className="w-8 h-8 text-[#ff4757]" />
          </div>
          <h2 className="font-sans text-xl font-black text-[#2d3436] tracking-tight mb-2">
            Ready to Order?
          </h2>
          <p className="font-jetbrains text-sm text-[#4a5568] mb-6 leading-relaxed">
            Add products to your cart and submit a request. No payment online — we'll contact you directly to arrange pickup.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-[#d1d9e6]" style={{ borderTop: "1px solid #babecc" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-jetbrains text-xs font-black text-[#2d3436] tracking-wider uppercase">
            LA SMOKES
          </div>
          <div className="font-jetbrains text-[9px] text-[#babecc]">
            © 2025 LA Smokes. All rights reserved.
          </div>
          <Link href="/admin" className="font-jetbrains text-[9px] text-[#babecc] hover:text-[#4a5568] transition-colors">
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
