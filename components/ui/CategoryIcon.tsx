import { CATEGORY_ICONS } from "@/types";

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-14 h-14 text-3xl",
};

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const icon = CATEGORY_ICONS[category] || "📦";
  const sizeClass = sizeMap[size];

  return (
    <div
      className={`${sizeClass} bg-[#0d0d17] border border-[#00ff8820] flex items-center justify-center flex-shrink-0 ${className || ""}`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
      }}
    >
      <span>{icon}</span>
    </div>
  );
}
