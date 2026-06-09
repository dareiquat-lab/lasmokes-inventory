"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useCart } from "./CartContext";

interface OrderFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function OrderForm({ onBack, onSuccess }: OrderFormProps) {
  const { items } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim(),
        notes: form.notes.trim() || undefined,
        items: items.map(i => ({
          product_id: i.id,
          product_name: i.product_name,
          product_sku: i.sku,
          quantity: i.quantity,
          price: i.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error || "Submission failed" });
        return;
      }

      const { orderNumber } = await res.json();
      onSuccess();
      router.push(`/orders/${orderNumber}/confirmation`);
    } catch {
      setErrors({ form: "Submission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 py-4 space-y-4">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] hover:text-[#00ff88] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cart
        </button>

        <div>
          <h3 className="font-orbitron text-xs font-black text-[#00ff88] uppercase tracking-wider mb-1">
            Contact Details
          </h3>
          <p className="font-jetbrains text-[9px] text-[#2e2e4a] leading-relaxed">
            No payment required. We will contact you to confirm your order.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="Your full name"
            />
            {errors.name && <p className="font-jetbrains text-[#ff3366] text-[10px] mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="label">Phone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field"
              placeholder="Your phone number"
            />
            {errors.phone && <p className="font-jetbrains text-[#ff3366] text-[10px] mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="input-field"
              placeholder="your@email.com"
            />
            {errors.email && <p className="font-jetbrains text-[#ff3366] text-[10px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Notes (Optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input-field resize-none"
              rows={2}
              placeholder="Pickup preference, questions, etc."
            />
          </div>

          {/* Order summary */}
          <div
            className="bg-[#0a0a0f] border border-[#1e1e2e] p-3 space-y-1.5"
            style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
          >
            <div className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a] mb-2">
              Order Summary
            </div>
            {items.map(item => (
              <div key={item.id} className="flex justify-between font-jetbrains text-[10px]">
                <span className="text-[#4a4a6a] truncate">{item.product_name} ×{item.quantity}</span>
                <span className="text-[#00ff88] ml-2 flex-shrink-0">${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-jetbrains text-xs font-bold pt-1.5 border-t border-[#1e1e2e]">
              <span className="text-[#e0e0f0]">Total</span>
              <span className="text-[#00ff88]">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {errors.form && (
            <div className="font-jetbrains text-[#ff3366] text-xs bg-[#ff336610] border border-[#ff336630] px-3 py-2 clip-chamfer-sm">
              {errors.form}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
