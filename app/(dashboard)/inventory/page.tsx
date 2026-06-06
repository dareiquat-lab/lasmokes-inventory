import { InventoryClient } from "@/components/inventory/InventoryClient";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider glitch">
          INVENTORY
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
          <span className="text-[#00ff8860]">//</span> Manage all products and stock levels
        </p>
      </div>
      <InventoryClient />
    </div>
  );
}
