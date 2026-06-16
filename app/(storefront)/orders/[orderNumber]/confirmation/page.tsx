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
        <div
          className="inline-flex items-center justify-center w-16 h-16 bg-[#e0e5ec] rounded-2xl mb-4"
          style={{ boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff" }}
        >
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight mb-2">
          Order Submitted
        </h1>
        <p className="font-jetbrains text-sm text-[#4a5568]">
          We received your request and will contact you shortly.
        </p>
      </div>

      {/* Order card */}
      <div
        className="bg-[#e0e5ec] rounded-2xl p-5 space-y-4 mb-6"
        style={{ boxShadow: "8px 8px 20px #babecc, -8px -8px 20px #ffffff" }}
      >
        {/* Order number */}
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid #babecc" }}>
          <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568]">Order Number</div>
          <div className="font-jetbrains text-sm font-black text-[#ff4757]">{params.orderNumber}</div>
        </div>

        {order && (
          <>
            {/* Customer info */}
            <div className="space-y-2">
              <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568]">Contact</div>
              <div className="flex items-center gap-2 font-jetbrains text-xs text-[#2d3436]">
                <span className="font-bold">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[#4a5568]">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {order.customer_phone}
              </div>
              <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[#4a5568]">
                <Mail className="w-3 h-3 flex-shrink-0" />
                {order.customer_email}
              </div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="space-y-2 pt-3" style={{ borderTop: "1px solid #babecc" }}>
                <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568]">Items Requested</div>
                {items.map((item: { product_name: string; product_sku: string | null; quantity: number; price: number }, i: number) => (
                  <div key={i} className="flex justify-between font-jetbrains text-xs">
                    <span className="text-[#4a5568]">{item.product_name} ×{item.quantity}</span>
                    <span className="text-[#ff4757] font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-jetbrains text-xs font-bold pt-2" style={{ borderTop: "1px solid #babecc" }}>
                  <span className="text-[#2d3436]">Total</span>
                  <span className="text-[#ff4757]">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {!order && (
          <p className="font-jetbrains text-xs text-[#4a5568]">
            Your order has been received with number <strong className="text-[#ff4757]">{params.orderNumber}</strong>.
          </p>
        )}
      </div>

      {/* What happens next */}
      <div
        className="bg-[#e0e5ec] rounded-xl p-4 space-y-2 mb-6"
        style={{ boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}
      >
        <div className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568] mb-2">What happens next?</div>
        {[
          "We review your order request",
          "We contact you by phone or email to confirm",
          "Your order is prepared for pickup",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="font-jetbrains text-[8px] text-[#ff4757] font-bold w-4">{i + 1}.</span>
            <span className="font-jetbrains text-[10px] text-[#4a5568]">{step}</span>
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
