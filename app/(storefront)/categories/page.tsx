import { sql } from "@/lib/db";
import Link from "next/link";
import { CATEGORIES, CATEGORY_ICONS } from "@/types";

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
  const counts = await getCategoryCounts();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider">
          <span className="text-[#ff00ff60]">&gt;</span> CATEGORIES
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1">
          Browse by product type
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => {
          const count = counts[cat] || 0;
          return (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className="group flex flex-col items-center gap-3 p-6 bg-[#0d0d17] border border-[#1e1e2e] hover:border-[#00ff8840] hover:bg-[#00ff8808] transition-all"
              style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat]}
              </span>
              <div className="text-center">
                <div className="font-orbitron text-[10px] font-black uppercase tracking-wider text-[#e0e0f0] group-hover:text-[#00ff88] transition-colors">
                  {cat}
                </div>
                <div className="font-jetbrains text-[9px] text-[#4a4a6a] mt-1">
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
