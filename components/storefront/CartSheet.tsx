"use client";

import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { OrderForm } from "./OrderForm";

export function CartSheet() {
  const { items, removeItem, updateQty, isOpen, closeCart, count, clearCart } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-[#2d3436]/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#e0e5ec] flex flex-col"
            style={{ boxShadow: "-8px 0 24px #babecc" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #babecc" }}
            >
              <div>
                <h2 className="font-jetbrains text-sm font-black text-[#2d3436] tracking-wider uppercase">
                  Order Cart
                </h2>
                <p className="font-jetbrains text-[8px] text-[#4a5568] uppercase tracking-widest mt-0.5">
                  {count} item{count !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#babecc] hover:text-[#ff4757] transition-colors"
                style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkingOut ? (
              <OrderForm
                onBack={() => setCheckingOut(false)}
                onSuccess={() => { closeCart(); clearCart(); }}
              />
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center bg-[#e0e5ec]"
                        style={{ boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}
                      >
                        <ShoppingCart className="w-7 h-7 text-[#babecc]" />
                      </div>
                      <p className="font-jetbrains text-[9px] text-[#babecc] uppercase tracking-widest">
                        Cart is empty
                      </p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div
                        key={item.id}
                        className="flex gap-3 bg-[#e0e5ec] rounded-xl p-3"
                        style={{ boxShadow: "4px 4px 10px #babecc, -4px -4px 10px #ffffff" }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-12 h-12 flex-shrink-0 bg-[#d1d9e6] overflow-hidden rounded-lg"
                          style={{ boxShadow: "inset 2px 2px 4px #babecc, inset -2px -2px 4px #ffffff" }}
                        >
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[9px] font-bold text-[#2d3436] leading-tight truncate">
                            {item.product_name}
                          </p>
                          <p className="font-jetbrains text-[9px] text-[#4a5568] mt-0.5">{item.sku}</p>
                          <p className="font-jetbrains text-xs text-[#ff4757] font-bold mt-1">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#babecc] hover:text-[#c0392b] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-[#4a5568] hover:text-[#ff4757] bg-[#e0e5ec] rounded-md transition-all"
                              style={{ boxShadow: "2px 2px 4px #babecc, -2px -2px 4px #ffffff" }}
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-jetbrains text-xs text-[#2d3436] w-5 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-5 h-5 flex items-center justify-center text-[#4a5568] hover:text-[#ff4757] bg-[#e0e5ec] rounded-md transition-all disabled:opacity-30"
                              style={{ boxShadow: "2px 2px 4px #babecc, -2px -2px 4px #ffffff" }}
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                  <div className="px-5 py-4 space-y-3" style={{ borderTop: "1px solid #babecc" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-jetbrains text-[9px] uppercase tracking-widest text-[#4a5568]">
                        Subtotal
                      </span>
                      <span className="font-jetbrains text-sm font-bold text-[#ff4757]">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="font-jetbrains text-[9px] text-[#babecc] leading-relaxed">
                      No payment required. Submit your request and we will contact you.
                    </p>
                    <button
                      onClick={() => setCheckingOut(true)}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Submit Order Request
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full font-jetbrains text-[9px] uppercase tracking-wider text-[#babecc] hover:text-[#c0392b] transition-colors py-1"
                    >
                      Clear Cart
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
