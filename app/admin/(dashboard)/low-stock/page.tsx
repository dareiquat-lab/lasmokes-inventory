import { LowStockClient } from "@/components/inventory/LowStockClient";

export const dynamic = "force-dynamic";

export default function LowStockPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Low Stock
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Products at or below the stock threshold
        </p>
      </div>
      <LowStockClient />
    </div>
  );
}
