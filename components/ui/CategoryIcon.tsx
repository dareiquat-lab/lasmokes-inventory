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
      className={`${sizeClass} bg-[#e0e5ec] rounded-lg flex items-center justify-center flex-shrink-0 ${className || ""}`}
      style={{ boxShadow: "4px 4px 8px #babecc, -4px -4px 8px #ffffff" }}
    >
      <span>{icon}</span>
    </div>
  );
}
