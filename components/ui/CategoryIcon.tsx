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

const bgMap: Record<string, string> = {
  Cigarettes: "bg-amber-500/10",
  Cigars: "bg-orange-500/10",
  Wraps: "bg-yellow-500/10",
  "Rolling Papers": "bg-lime-500/10",
  Lighters: "bg-red-500/10",
  Batteries: "bg-blue-500/10",
  Butane: "bg-cyan-500/10",
  Incense: "bg-purple-500/10",
  Medication: "bg-pink-500/10",
  Accessories: "bg-indigo-500/10",
  "Eye Care": "bg-teal-500/10",
  Condoms: "bg-rose-500/10",
};

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const icon = CATEGORY_ICONS[category] || "📦";
  const bg = bgMap[category] || "bg-gray-500/10";
  const sizeClass = sizeMap[size];

  return (
    <div className={`${sizeClass} ${bg} rounded-lg flex items-center justify-center flex-shrink-0 ${className || ""}`}>
      <span>{icon}</span>
    </div>
  );
}
