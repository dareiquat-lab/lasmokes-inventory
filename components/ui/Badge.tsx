import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-[#1e1e2e] text-[#4a4a6a] border-[#2e2e4a]",
    success: "bg-[#00ff8810] text-[#00ff88] border-[#00ff8830]",
    warning: "bg-[#ffff0010] text-[#cccc00] border-[#ffff0030]",
    danger:  "bg-[#ff336610] text-[#ff3366] border-[#ff336630]",
    info:    "bg-[#00d4ff10] text-[#00d4ff] border-[#00d4ff30]",
  };

  return (
    <span className={cn("badge font-orbitron", variantClasses[variant], className)}>
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="badge font-orbitron bg-[#00d4ff08] text-[#00d4ff] border-[#00d4ff20]">
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
