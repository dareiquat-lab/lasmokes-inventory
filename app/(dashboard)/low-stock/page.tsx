import { LowStockClient } from "@/components/inventory/LowStockClient";

export const dynamic = "force-dynamic";

export default function LowStockPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider">
          LOW STOCK
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
          <span className="text-[#ffff0060]">//</span> Products at or below the stock threshold
        </p>
      </div>
      <LowStockClient />
    </div>
  );
}
