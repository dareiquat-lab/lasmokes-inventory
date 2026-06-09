import { OrdersClient } from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-orbitron text-2xl font-black text-[#e0e0f0] tracking-wider">
          ORDERS
        </h1>
        <p className="font-jetbrains text-xs text-[#4a4a6a] mt-1 tracking-wider">
          <span className="text-[#00d4ff60]">//</span> Customer order requests
        </p>
      </div>
      <OrdersClient />
    </div>
  );
}
