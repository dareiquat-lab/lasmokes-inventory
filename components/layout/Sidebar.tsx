"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/",             label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory",    label: "Inventory",  icon: Package         },
  { href: "/low-stock",    label: "Low Stock",  icon: AlertTriangle   },
  { href: "/products/new", label: "Add Item",   icon: PlusCircle      },
];

function NavLink({ href, label, icon: Icon, onClick }: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "sidebar-link",
        isActive ? "sidebar-link-active" : "sidebar-link-inactive"
      )}
    >
      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "drop-shadow-[0_0_6px_#00ff88]")} />
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0d0d17] border border-[#00ff8830] p-2 clip-chamfer-sm"
      >
        <Menu className="w-5 h-5 text-[#00ff88]" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-[#00ff8820] z-50 flex flex-col"
          >
            <SidebarContent onClose={() => setMobileOpen(false)} showClose />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 bg-[#0a0a0f] border-r border-[#00ff8818] flex-col flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#00ff8818] relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00ff8812] border border-[#00ff8840] flex items-center justify-center clip-chamfer-sm">
              <span className="text-base">🏪</span>
            </div>
            <div>
              <div className="font-orbitron text-sm font-black text-[#00ff88] leading-tight tracking-wider glitch">
                LA SMOKES
              </div>
              <div className="font-orbitron text-[8px] text-[#4a4a6a] leading-tight tracking-widest uppercase">
                Inventory System
              </div>
            </div>
          </div>
          {showClose && (
            <button onClick={onClose} className="text-[#4a4a6a] hover:text-[#00ff88] transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Decorative corner lines */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#00ff8840] to-transparent" />
      </div>

      {/* System status */}
      <div className="px-4 py-2 border-b border-[#00ff8810]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_4px_#00ff88]" />
          <span className="font-orbitron text-[8px] text-[#4a4a6a] uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="font-orbitron text-[8px] text-[#2e2e4a] uppercase tracking-widest px-3 py-2">
          Navigation
        </div>
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} onClick={onClose} />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#00ff8810]">
        <div className="font-jetbrains text-[9px] text-[#2e2e4a] leading-relaxed">
          <div className="text-[#00ff8840]">v1.0.0 // LASMOKES-INV</div>
          <div>© 2025 Internal Use Only</div>
        </div>
      </div>
    </>
  );
}
