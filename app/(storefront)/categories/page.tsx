import { sql, getCategories } from "@/lib/db";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/types";

export const dynamic = "force-dynamic";

async function getCategoryCounts(): Promise<Record<string, number>> {
  try {
    const rows = await sql`SELECT category, COUNT(*) as count FROM products GROUP BY category`;
    return Object.fromEntries(rows.map(r => [r.category as string, parseInt(r.count as string)]));
  } catch {
    return {};
  }
}

export default async function CategoriesPage() {
  const [counts, categories] = await Promise.all([
    getCategoryCounts(),
    getCategories().catch(() => [] as { name: string }[]),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight">
          Categories
        </h1>
        <p className="font-jetbrains text-xs text-[#4a5568] mt-1">
          Browse by product type
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(cat => {
          const count = counts[cat.name] || 0;
          return (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center gap-3 p-6 bg-[#e0e5ec] rounded-2xl transition-all duration-200 hover:-translate-y-1"
              style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {CATEGORY_ICONS[cat.name] || "📦"}
              </span>
              <div className="text-center">
                <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#2d3436] group-hover:text-[#ff4757] transition-colors">
                  {cat.name}
                </div>
                <div className="font-jetbrains text-[9px] text-[#4a5568] mt-1">
                  {count} product{count !== 1 ? "s" : ""}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
