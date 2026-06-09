"use client";

import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";
import { useCart } from "./CartContext";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

interface ProductCardProps {
  product: {
    id: number;
    product_name: string;
    category: string;
    sku: string;
    quantity: number;
    price: number;
    image_url: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const outOfStock = product.quantity === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    const cartItem: Omit<CartItem, "quantity"> = {
      id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      price: Number(product.price),
      image_url: product.image_url,
      category: product.category,
      stock: product.quantity,
    };
    addItem(cartItem);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div
        className={cn(
          "bg-[#0d0d17] border transition-all duration-200",
          outOfStock
            ? "border-[#1e1e2e] opacity-60"
            : "border-[#1e1e2e] hover:border-[#00ff8840] hover:shadow-[0_0_20px_#00ff8810]"
        )}
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-[#0a0a0f] border-b border-[#1e1e2e] relative">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CategoryIcon category={product.category} size="lg" />
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span
                className="font-orbitron text-[10px] font-black text-[#ff3366] uppercase tracking-widest border border-[#ff336640] px-3 py-1.5 bg-[#ff336610]"
                style={{ clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}
              >
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock indicator */}
          {!outOfStock && product.quantity <= 10 && (
            <div className="absolute top-2 right-2">
              <span
                className="font-orbitron text-[8px] font-black text-[#cccc00] uppercase tracking-wider border border-[#ffff0030] px-1.5 py-0.5 bg-[#ffff0010]"
                style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
              >
                Low Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="font-orbitron text-[8px] uppercase tracking-widest text-[#4a4a6a]">
            {product.category}
          </div>
          <h3 className="font-orbitron text-xs font-black text-[#e0e0f0] line-clamp-2 leading-tight group-hover:text-[#00ff88] transition-colors">
            {product.product_name}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <span className="font-jetbrains text-sm font-bold text-[#00ff88]">
              ${Number(product.price).toFixed(2)}
            </span>
            <button
              onClick={e => { e.preventDefault(); handleAdd(e); }}
              disabled={outOfStock}
              className={cn(
                "flex items-center gap-1 font-orbitron text-[8px] uppercase tracking-wider px-2 py-1.5 transition-all",
                outOfStock
                  ? "text-[#2e2e4a] border border-[#1e1e2e] cursor-not-allowed opacity-40"
                  : "text-black bg-[#00ff88] hover:bg-[#33ffaa] shadow-[0_0_8px_#00ff8840] hover:shadow-[0_0_12px_#00ff8880]"
              )}
              style={{ clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))" }}
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
