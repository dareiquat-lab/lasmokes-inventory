import { Suspense } from "react";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight">Categories</h1>
        <p className="font-jetbrains text-xs text-[#4a5568] mt-1 tracking-wider">
          Manage product categories
        </p>
      </div>
      <Suspense
        fallback={
          <div
            className="bg-[#e0e5ec] rounded-2xl p-8 animate-pulse"
            style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
          />
        }
      >
        <CategoriesClient />
      </Suspense>
    </div>
  );
}
