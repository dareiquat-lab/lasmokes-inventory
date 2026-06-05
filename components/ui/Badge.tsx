import { cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const colorClass = CATEGORY_COLORS[category] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  return (
    <span className={cn("badge", colorClass)}>
      {category}
    </span>
  );
}

export function StockBadge({ quantity, threshold = 10 }: { quantity: number; threshold?: number }) {
  if (quantity === 0) {
    return <Badge variant="danger">Out of Stock</Badge>;
  }
  if (quantity <= threshold) {
    return <Badge variant="warning">Low Stock</Badge>;
  }
  return <Badge variant="success">In Stock</Badge>;
}
