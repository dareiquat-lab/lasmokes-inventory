import Link from "next/link";
import { getStorefrontProducts } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CATEGORIES, CATEGORY_ICONS } from "@/types";
import { ShoppingCart, Package, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof getStorefrontProducts>>["products"] = [];
  let total = 0;

  try {
    const result = await getStorefrontProducts({ limit: 8, page: 1 });
    featured = result.products;
    total = result.total;
  } catch {
    // DB not connected
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[480px] flex items-center overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00ff88] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#00d4ff] opacity-[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="font-orbitron text-[10px] uppercase tracking-widest text-[#4a4a6a] mb-4">
            <span className="text-[#00ff8860]">//</span> Official Smoke Shop
          </div>
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-[#e0e0f0] leading-tight tracking-wider mb-3">
            <span className="text-[#00ff88] drop-shadow-[0_0_20px_#00ff88] glitch">LA SMOKES</span>
          </h1>
          <p className="font-jetbrains text-sm text-[#4a4a6a] max-w-md leading-relaxed mb-8">
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
                <div className="font-orbitron text-xl font-black text-[#00ff88]">{total}</div>
                <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a]">Products</div>
              </div>
              <div className="w-px h-8 bg-[#1e1e2e]" />
              <div>
                <div className="font-orbitron text-xl font-black text-[#00d4ff]">{CATEGORIES.length}</div>
                <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a]">Categories</div>
              </div>
              <div className="w-px h-8 bg-[#1e1e2e]" />
              <div>
                <div className="font-orbitron text-xl font-black text-[#ff00ff]">0%</div>
                <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a]">Tax Online</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[#1e1e2e] bg-[#0d0d17] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "🛒", title: "Browse & Select", desc: "Browse our full catalog and add items to your cart" },
              { icon: "📝", title: "Submit Request", desc: "Leave your name, phone, and email — no payment needed" },
              { icon: "📞", title: "We Contact You", desc: "We'll reach out to confirm your order for pickup" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-10 h-10 flex-shrink-0 bg-[#0a0a0f] border border-[#00ff8820] flex items-center justify-center text-lg"
                  style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
                >
                  {step.icon}
                </div>
                <div>
                  <div className="font-orbitron text-[10px] font-black uppercase tracking-wider text-[#e0e0f0]">{step.title}</div>
                  <p className="font-jetbrains text-[10px] text-[#4a4a6a] mt-0.5 leading-relaxed">{step.desc}</p>
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
                <h2 className="font-orbitron text-lg font-black text-[#e0e0f0] tracking-wider">
                  <span className="text-[#00ff8860]">&gt;</span> Featured Products
                </h2>
                <p className="font-jetbrains text-[10px] text-[#4a4a6a] mt-0.5">Latest additions to the catalog</p>
              </div>
              <Link href="/products" className="font-orbitron text-[9px] uppercase tracking-widest text-[#00ff88] hover:text-[#33ffaa] transition-colors">
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
      <section className="py-12 border-t border-[#1e1e2e]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h2 className="font-orbitron text-lg font-black text-[#e0e0f0] tracking-wider">
              <span className="text-[#ff00ff60]">&gt;</span> Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-3 bg-[#0d0d17] border border-[#1e1e2e] hover:border-[#00ff8840] hover:bg-[#00ff8808] transition-all clip-chamfer-sm group"
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                <div className="font-orbitron text-[8px] uppercase tracking-wider text-[#4a4a6a] group-hover:text-[#00ff88] text-center leading-tight transition-colors">
                  {cat}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA */}
      <section className="py-12 border-t border-[#1e1e2e]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <ShoppingCart className="w-10 h-10 text-[#00ff88] mx-auto mb-4 drop-shadow-[0_0_10px_#00ff88]" />
          <h2 className="font-orbitron text-xl font-black text-[#e0e0f0] tracking-wider mb-2">
            Ready to Order?
          </h2>
          <p className="font-jetbrains text-sm text-[#4a4a6a] mb-6 leading-relaxed">
            Add products to your cart and submit a request. No payment online — we'll contact you directly to arrange pickup.
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <Package className="w-3.5 h-3.5" />
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2e] py-6 bg-[#0d0d17]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-orbitron text-xs font-black text-[#00ff88] tracking-wider">
            LA SMOKES
          </div>
          <div className="font-jetbrains text-[9px] text-[#2e2e4a]">
            © 2025 LA Smokes. All rights reserved.
          </div>
          <Link href="/admin" className="font-jetbrains text-[9px] text-[#1e1e2e] hover:text-[#2e2e4a] transition-colors">
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
