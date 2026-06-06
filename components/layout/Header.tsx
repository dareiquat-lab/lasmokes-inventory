import { Bell, Terminal } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 bg-[#0a0a0f] border-b border-[#00ff8818] flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative">
      {/* Left — terminal prompt */}
      <div className="hidden md:flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-[#00ff8860]" />
        <span className="font-jetbrains text-[10px] text-[#2e2e4a] tracking-wider">
          <span className="text-[#00ff8870]">root@lasmokes</span>
          <span className="text-[#1e1e2e]">:</span>
          <span className="text-[#00d4ff70]">~/inventory</span>
          <span className="text-[#2e2e4a]"> $</span>
          <span className="ml-1 text-[#4a4a6a] cursor-blink">_</span>
        </span>
      </div>

      <div className="md:hidden" />

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="text-[#2e2e4a] hover:text-[#00ff88] transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-[#00ff8818]">
          <div className="w-7 h-7 bg-[#00ff8812] border border-[#00ff8840] flex items-center justify-center clip-chamfer-sm">
            <span className="font-orbitron text-[9px] font-black text-[#00ff88]">LA</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-orbitron text-[10px] font-black text-[#e0e0f0] leading-tight tracking-wider">
              LA SMOKES
            </div>
            <div className="font-orbitron text-[7px] text-[#4a4a6a] leading-tight tracking-widest uppercase">
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff8830] to-transparent" />
    </header>
  );
}
