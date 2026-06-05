import { Bell } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 bg-[#111111] border-b border-[#1f1f1f] flex items-center justify-end px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="text-gray-500 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#1f1f1f]">
          <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-400">LA</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-white leading-tight">LA Smokes</div>
            <div className="text-[10px] text-gray-500 leading-tight">Inventory</div>
          </div>
        </div>
      </div>
    </header>
  );
}
