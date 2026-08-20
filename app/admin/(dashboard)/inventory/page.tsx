import { InventoryClient } from "@/components/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Inventory
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Manage all products and stock levels
        </p>
      </div>
      <InventoryClient />
    </div>
  );
}
