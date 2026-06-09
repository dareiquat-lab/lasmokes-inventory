"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/",           label: "Home"       },
  { href: "/products",   label: "Products"   },
  { href: "/categories", label: "Categories" },
];

export function StorefrontNav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#00ff8818]">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#00ff8812] border border-[#00ff8840] flex items-center justify-center clip-chamfer-sm">
              <span className="text-sm">🏪</span>
            </div>
            <div className="font-orbitron text-sm font-black text-[#00ff88] tracking-wider glitch hidden sm:block">
              LA SMOKES
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-orbitron text-[9px] uppercase tracking-widest px-3 py-2 transition-all clip-chamfer-sm",
                  pathname === link.href
                    ? "text-[#00ff88] bg-[#00ff8812] border border-[#00ff8830]"
                    : "text-[#4a4a6a] hover:text-[#e0e0f0] hover:bg-[#ffffff08]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 font-orbitron text-[9px] uppercase tracking-wider px-3 py-2 text-[#00ff88] bg-[#00ff8810] border border-[#00ff8830] clip-chamfer-sm hover:bg-[#00ff8820] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00ff88] text-black font-black text-[8px] rounded-full flex items-center justify-center font-orbitron shadow-[0_0_8px_#00ff88]">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Admin link */}
            <Link
              href="/admin"
              className="hidden sm:flex font-orbitron text-[8px] uppercase tracking-widest px-2 py-1.5 text-[#2e2e4a] border border-[#1e1e2e] clip-chamfer-sm hover:text-[#4a4a6a] hover:border-[#2e2e4a] transition-all"
            >
              Admin
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden text-[#4a4a6a] hover:text-[#00ff88] transition-colors p-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff8830] to-transparent" />
      </header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0a0a0f]/98 border-b border-[#00ff8818] p-4 space-y-1 md:hidden"
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block font-orbitron text-[9px] uppercase tracking-widest px-3 py-3 transition-all",
                  pathname === link.href
                    ? "text-[#00ff88] bg-[#00ff8810] border-l-2 border-[#00ff88]"
                    : "text-[#4a4a6a] hover:text-[#e0e0f0] border-l-2 border-transparent"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block font-orbitron text-[8px] uppercase tracking-widest px-3 py-3 text-[#2e2e4a] border-l-2 border-transparent"
            >
              Admin Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
