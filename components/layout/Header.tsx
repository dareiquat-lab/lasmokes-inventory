import { Bell, Settings } from "lucide-react";

export function Header() {
  return (
    <header
      className="h-14 bg-[#e0e5ec] flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative"
      style={{ boxShadow: "0 2px 8px #babecc, 0 -1px 0 #ffffff" }}
    >
      {/* Left — system label */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
        <span className="font-jetbrains text-[10px] text-[#4a5568] tracking-wider uppercase">
          System Online
        </span>
      </div>

      <div className="md:hidden" />

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#babecc] hover:text-[#ff4757] transition-colors"
          style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
        >
          <Bell className="w-4 h-4" />
        </button>

        <div
          className="flex items-center gap-2.5 pl-3"
          style={{ borderLeft: "1px solid #babecc" }}
        >
          <div
            className="w-7 h-7 bg-[#ff4757] rounded-lg flex items-center justify-center"
            style={{ boxShadow: "3px 3px 6px rgba(166,50,60,0.3), -2px -2px 4px rgba(255,100,110,0.2)" }}
          >
            <span className="font-jetbrains text-[9px] font-black text-white">LA</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-jetbrains text-[10px] font-black text-[#2d3436] leading-tight tracking-wider uppercase">
              LA SMOKES
            </div>
            <div className="font-jetbrains text-[7px] text-[#4a5568] leading-tight tracking-widest uppercase">
              Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
