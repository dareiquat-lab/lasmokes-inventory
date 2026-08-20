import { OrdersClient } from "@/components/admin/OrdersClient";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Orders
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Customer order requests
        </p>
      </div>
      <OrdersClient />
    </div>
  );
}
