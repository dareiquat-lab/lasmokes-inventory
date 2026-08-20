"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  order: {
    id: number;
    order_number: string;
    customer_email: string;
    customer_name: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export function EmailInvoiceModal({ order, isOpen, onClose, onSent }: Props) {
  const [to, setTo] = useState(order.customer_email);
  const [subject, setSubject] = useState(`Order Invoice - ${order.order_number}`);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!to.trim()) return;
    setLoading(true);
    setStatus("idle");
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: to.trim(), subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus("success");
      setTimeout(() => {
        onSent();
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send email");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStatus("idle");
      setError("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Email Invoice">
      <div className="space-y-4">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle className="w-10 h-10 text-[#2E7D32]" />
            <p className="font-sans font-bold text-[#2E7D32] text-sm">Invoice sent successfully!</p>
          </div>
        ) : (
          <>
            <div className="font-jetbrains text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
              Sending invoice for{" "}
              <span className="text-[#ff4757] font-bold">{order.order_number}</span>
            </div>

            <div>
              <label className="label">Recipient Email *</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input-field"
                placeholder="customer@example.com"
              />
            </div>
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Add a personal note to this invoice..."
              />
            </div>

            {status === "error" && (
              <div
                className="flex items-center gap-2 font-jetbrains text-xs text-[#c0392b]"
                style={{
                  background: "rgba(192,57,43,0.08)",
                  border: "1px solid rgba(192,57,43,0.2)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <button onClick={handleClose} disabled={loading} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !to.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    Send Invoice
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
