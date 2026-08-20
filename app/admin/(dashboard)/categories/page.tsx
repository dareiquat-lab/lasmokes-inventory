import { Suspense } from "react";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">Categories</h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Manage product categories
        </p>
      </div>
      <Suspense
        fallback={
          <div
            className="bg-[var(--background)] rounded-2xl p-8 animate-pulse"
            style={{ boxShadow: "var(--shadow-card)" }}
          />
        }
      >
        <CategoriesClient />
      </Suspense>
    </div>
  );
}
