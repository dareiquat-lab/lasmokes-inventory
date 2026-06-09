import { getOrderByNumber } from "@/lib/db";
import Link from "next/link";
import { CheckCircle, Package, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  let order = null;
  try {
    order = await getOrderByNumber(params.orderNumber);
  } catch {
    // ignore
  }

  const items = order?.items || [];
  const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className="max-w-lg mx-auto px-4 md:px-6 py-16">
      {/* Success icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff8812] border border-[#00ff8840] mb-4 clip-chamfer-md mx-auto">
          <CheckCircle className="w-8 h-8 text-[#00ff88] drop-shadow-[0_0_10px_#00ff88]" />
        </div>
        <h1 className="font-orbitron text-2xl font-black text-[#00ff88] tracking-wider glitch mb-2">
          ORDER SUBMITTED
        </h1>
        <p className="font-jetbrains text-sm text-[#4a4a6a]">
          We received your request and will contact you shortly.
        </p>
      </div>

      {/* Order card */}
      <div
        className="bg-[#0d0d17] border border-[#00ff8830] p-5 space-y-4 mb-6"
        style={{
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          boxShadow: "0 0 20px #00ff8810",
        }}
      >
        {/* Order number */}
        <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-3">
          <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">Order Number</div>
          <div className="font-jetbrains text-sm font-black text-[#00ff88]">{params.orderNumber}</div>
        </div>

        {order && (
          <>
            {/* Customer info */}
            <div className="space-y-2">
              <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">Contact</div>
              <div className="flex items-center gap-2 font-jetbrains text-xs text-[#c0c0d8]">
                <span className="font-bold">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[#4a4a6a]">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {order.customer_phone}
              </div>
              <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[#4a4a6a]">
                <Mail className="w-3 h-3 flex-shrink-0" />
                {order.customer_email}
              </div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="space-y-2 border-t border-[#1e1e2e] pt-3">
                <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">Items Requested</div>
                {items.map((item: { product_name: string; product_sku: string | null; quantity: number; price: number }, i: number) => (
                  <div key={i} className="flex justify-between font-jetbrains text-xs">
                    <span className="text-[#c0c0d8]">{item.product_name} ×{item.quantity}</span>
                    <span className="text-[#00ff88]">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-jetbrains text-xs font-bold border-t border-[#1e1e2e] pt-2">
                  <span className="text-[#e0e0f0]">Total</span>
                  <span className="text-[#00ff88]">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {!order && (
          <p className="font-jetbrains text-xs text-[#4a4a6a]">
            Your order has been received with number <strong className="text-[#00ff88]">{params.orderNumber}</strong>.
          </p>
        )}
      </div>

      {/* What happens next */}
      <div
        className="bg-[#0d0d17] border border-[#1e1e2e] p-4 space-y-2 mb-6"
        style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
      >
        <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] mb-2">What happens next?</div>
        {[
          "We review your order request",
          "We contact you by phone or email to confirm",
          "Your order is prepared for pickup",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-orbitron text-[8px] text-[#00ff88] w-4">{i + 1}.</span>
            <span className="font-jetbrains text-[10px] text-[#4a4a6a]">{step}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/" className="flex-1 btn-secondary flex items-center justify-center gap-2">
          ← Home
        </Link>
        <Link href="/products" className="flex-1 btn-primary flex items-center justify-center gap-2">
          <Package className="w-3.5 h-3.5" />
          Shop More
        </Link>
      </div>
    </div>
  );
}
