import { LowStockClient } from "@/components/inventory/LowStockClient";

export const dynamic = "force-dynamic";

export default function LowStockPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Low Stock</h1>
        <p className="text-gray-500 text-sm mt-1">Products at or below the stock threshold</p>
      </div>
      <LowStockClient />
    </div>
  );
}
