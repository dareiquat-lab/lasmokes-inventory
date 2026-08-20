"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";

export function Header() {
  return (
    <header
      className="h-14 bg-[var(--background)] flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative"
      style={{ boxShadow: "var(--shadow-header)" }}
    >
      {/* Left */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} />
        <span className="font-jetbrains text-[10px] text-[var(--text-muted)] tracking-wider uppercase">
          System Online
        </span>
      </div>

      <div className="md:hidden" />

      {/* Right */}
      <div className="flex items-center gap-3">
        <ThemeToggle
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
          style={{ boxShadow: "var(--shadow-sm)" }}
        />

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <Bell className="w-4 h-4" />
        </button>

        <div
          className="flex items-center gap-2.5 pl-3"
          style={{ borderLeft: "1px solid var(--border-shadow)" }}
        >
          <div
            className="w-7 h-7 bg-[#ff4757] rounded-lg flex items-center justify-center"
            style={{ boxShadow: "3px 3px 6px rgba(166,50,60,0.3), -2px -2px 4px rgba(255,100,110,0.2)" }}
          >
            <span className="font-jetbrains text-[9px] font-black text-white">LA</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-jetbrains text-[10px] font-black text-[var(--text)] leading-tight tracking-wider uppercase">
              LA SMOKES WHOLESALE
            </div>
            <div className="font-jetbrains text-[7px] text-[var(--text-muted)] leading-tight tracking-widest uppercase">
              Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
