import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-[#e0e5ec] text-[#4a5568] border border-[#babecc]",
    success: "bg-[#00b89415] text-[#00856f] border border-[#00b89440]",
    warning: "bg-[#e1705515] text-[#c0602a] border border-[#e1705540]",
    danger:  "bg-[#ff475715] text-[#c0392b] border border-[#ff475740]",
    info:    "bg-[#0984e315] text-[#0773c5] border border-[#0984e340]",
  };

  return (
    <span className={cn("badge", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="badge bg-[#0984e310] text-[#0773c5] border border-[#0984e330]">
      {category}
    </span>
  );
}

export function StockBadge({ quantity, threshold = 10 }: { quantity: number; threshold?: number }) {
  if (quantity === 0) {
    return <Badge variant="danger">Out</Badge>;
  }
  if (quantity <= threshold) {
    return <Badge variant="warning">Low</Badge>;
  }
  return <Badge variant="success">OK</Badge>;
}
