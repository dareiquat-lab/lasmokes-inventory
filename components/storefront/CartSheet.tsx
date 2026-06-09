"use client";

import { useCart } from "./CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { OrderForm } from "./OrderForm";
import { cn } from "@/lib/utils";

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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a0f] border-l border-[#00ff8830] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00ff8820]">
              <div>
                <h2 className="font-orbitron text-sm font-black text-[#00ff88] tracking-wider">
                  ORDER CART
                </h2>
                <p className="font-orbitron text-[8px] text-[#4a4a6a] uppercase tracking-widest mt-0.5">
                  {count} item{count !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="text-[#2e2e4a] hover:text-[#ff3366] transition-colors"
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
                      <ShoppingCart className="w-10 h-10 text-[#1e1e2e]" />
                      <p className="font-orbitron text-[9px] text-[#2e2e4a] uppercase tracking-widest">
                        Cart is empty
                      </p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div
                        key={item.id}
                        className="flex gap-3 bg-[#0d0d17] border border-[#1e1e2e] p-3"
                        style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-12 h-12 flex-shrink-0 bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden"
                          style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
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
                          <p className="font-orbitron text-[9px] font-black text-[#e0e0f0] leading-tight truncate">
                            {item.product_name}
                          </p>
                          <p className="font-jetbrains text-[9px] text-[#4a4a6a] mt-0.5">{item.sku}</p>
                          <p className="font-jetbrains text-xs text-[#00ff88] font-bold mt-1">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#2e2e4a] hover:text-[#ff3366] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-[#4a4a6a] hover:text-[#00ff88] bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#00ff8840] clip-chamfer-sm transition-all"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-jetbrains text-xs text-[#e0e0f0] w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-5 h-5 flex items-center justify-center text-[#4a4a6a] hover:text-[#00ff88] bg-[#0a0a0f] border border-[#1e1e2e] hover:border-[#00ff8040] clip-chamfer-sm transition-all disabled:opacity-30"
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
                  <div className="px-5 py-4 border-t border-[#00ff8820] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron text-[9px] uppercase tracking-widest text-[#4a4a6a]">
                        Subtotal
                      </span>
                      <span className="font-jetbrains text-sm font-bold text-[#00ff88]">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <p className="font-jetbrains text-[9px] text-[#2e2e4a] leading-relaxed">
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
                      className="w-full font-orbitron text-[9px] uppercase tracking-wider text-[#2e2e4a] hover:text-[#ff3366] transition-colors py-1"
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
