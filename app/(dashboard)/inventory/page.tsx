import { InventoryClient } from "@/components/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all products and stock levels</p>
      </div>
      <InventoryClient />
    </div>
  );
}
