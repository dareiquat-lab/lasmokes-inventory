"use client";

import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";
import type { Product } from "@/types";
import type { CartItem } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const outOfStock = product.quantity === 0;

  const handleAdd = () => {
    if (outOfStock) return;
    const item: Omit<CartItem, "quantity"> = {
      id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      price: Number(product.price),
      image_url: product.image_url,
      category: product.category,
      stock: product.quantity,
    };
    addItem({ ...item, quantity: qty });
  };

  if (outOfStock) {
    return (
      <div
        className="w-full text-center font-orbitron text-xs font-black uppercase tracking-widest text-[#ff3366] border border-[#ff336630] bg-[#ff336608] py-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))" }}
      >
        Out of Stock
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Qty selector */}
      <div
        className="flex items-center gap-2 border border-[#1e1e2e] bg-[#0d0d17] px-3"
        style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
      >
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          className="text-[#4a4a6a] hover:text-[#00ff88] transition-colors py-2"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="font-jetbrains text-sm text-[#e0e0f0] font-bold w-6 text-center">{qty}</span>
        <button
          onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
          className="text-[#4a4a6a] hover:text-[#00ff88] transition-colors py-2"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="flex-1 btn-primary flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Add to Cart
      </button>
    </div>
  );
}
