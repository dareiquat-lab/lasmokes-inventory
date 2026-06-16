"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
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
          "bg-[#e0e5ec] rounded-2xl transition-all duration-300",
          outOfStock
            ? "opacity-65"
            : "hover:-translate-y-1"
        )}
        style={{
          boxShadow: outOfStock
            ? "4px 4px 10px #babecc, -4px -4px 10px #ffffff"
            : "8px 8px 16px #babecc, -8px -8px 16px #ffffff",
        }}
      >
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-[#d1d9e6] rounded-t-2xl relative"
          style={{ borderBottom: "1px solid #babecc" }}
        >
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
            <div className="absolute inset-0 bg-[#e0e5ec]/70 flex items-center justify-center">
              <span className="font-jetbrains text-[10px] font-black text-[#c0392b] uppercase tracking-widest px-3 py-1.5 bg-[#e0e5ec] rounded-lg"
                style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
              >
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock indicator */}
          {!outOfStock && product.quantity <= 10 && (
            <div className="absolute top-2 right-2">
              <span className="font-jetbrains text-[8px] font-black text-[#c0602a] uppercase tracking-wider px-1.5 py-0.5 bg-[#e0e5ec] rounded-md"
                style={{ boxShadow: "2px 2px 4px #babecc, -1px -1px 2px #ffffff" }}
              >
                Low Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div className="font-jetbrains text-[8px] uppercase tracking-widest text-[#4a5568]">
            {product.category}
          </div>
          <h3 className="font-sans text-xs font-bold text-[#2d3436] line-clamp-2 leading-tight group-hover:text-[#ff4757] transition-colors">
            {product.product_name}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <span className="font-jetbrains text-sm font-bold text-[#ff4757]">
              ${Number(product.price).toFixed(2)}
            </span>
            <button
              onClick={e => { e.preventDefault(); handleAdd(e); }}
              disabled={outOfStock}
              className={cn(
                "flex items-center gap-1 font-jetbrains text-[8px] uppercase tracking-wider px-2 py-1.5 rounded-lg transition-all",
                outOfStock
                  ? "text-[#babecc] cursor-not-allowed opacity-40"
                  : "text-white bg-[#ff4757] active:translate-y-px"
              )}
              style={!outOfStock ? {
                boxShadow: "3px 3px 6px rgba(166,50,60,0.3), -2px -2px 4px rgba(255,100,110,0.2)"
              } : undefined}
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
