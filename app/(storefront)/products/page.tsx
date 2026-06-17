import { getStorefrontProducts, getCategories } from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { search?: string; category?: string; page?: string };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const page = parseInt(searchParams.page || "1");

  let data: Awaited<ReturnType<typeof getStorefrontProducts>> = {
    products: [], total: 0, page: 1, limit: 24, totalPages: 0,
  };
  let categoryNames: string[] = [];

  try {
    [data, categoryNames] = await Promise.all([
      getStorefrontProducts({ search, category, page, limit: 24 }),
      getCategories().then(cats => (cats as { name: string }[]).map(c => c.name)),
    ]);
  } catch {
    // DB not connected
  }

  const buildUrl = (params: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (search && !("search" in params)) p.set("search", search);
    if (category && !("category" in params)) p.set("category", category);
    if (page > 1 && !("page" in params)) p.set("page", String(page));
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, String(v)); });
    const str = p.toString();
    return `/products${str ? `?${str}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight">
          All Products
        </h1>
        <p className="font-jetbrains text-xs text-[#4a5568] mt-1">
          {data.total.toLocaleString()} product{data.total !== 1 ? "s" : ""} available
          {category && ` in ${category}`}
          {search && ` matching "${search}"`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form className="relative flex-1" action="/products" method="GET">
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babecc] pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="input-field pl-9"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ category: "", page: 1 })}
            className={`font-jetbrains text-[8px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
              !category
                ? "text-[#ff4757] font-bold"
                : "text-[#4a5568]"
            }`}
            style={!category
              ? { boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }
              : { boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }
            }
          >
            All
          </Link>
          {categoryNames.map(cat => (
            <Link
              key={cat}
              href={buildUrl({ category: cat, page: 1 })}
              className={`font-jetbrains text-[8px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all ${
                category === cat
                  ? "text-[#ff4757] font-bold"
                  : "text-[#4a5568]"
              }`}
              style={category === cat
                ? { boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }
                : { boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }
              }
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      {data.products.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#e0e5ec] mb-4"
            style={{ boxShadow: "inset 4px 4px 10px #babecc, inset -4px -4px 10px #ffffff" }}
          >
            <Search className="w-7 h-7 text-[#babecc]" />
          </div>
          <p className="font-sans text-sm font-bold text-[#4a5568] uppercase tracking-widest">No products found</p>
          {(search || category) && (
            <Link href="/products" className="font-jetbrains text-[9px] text-[#ff4757] hover:text-[#ff6b7a] mt-3 inline-block uppercase tracking-widest font-bold">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.products.map(p => (
            <ProductCard key={p.id} product={p as Parameters<typeof ProductCard>[0]["product"]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={buildUrl({ page: page - 1 })} className="btn-secondary px-4 py-2">
              ← Prev
            </Link>
          )}
          <span className="font-jetbrains text-xs text-[#4a5568]">
            {page} / {data.totalPages}
          </span>
          {page < data.totalPages && (
            <Link href={buildUrl({ page: page + 1 })} className="btn-secondary px-4 py-2">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
