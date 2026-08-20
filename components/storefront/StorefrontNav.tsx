"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./CartContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeProvider";

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
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--background)] backdrop-blur-md"
        style={{ boxShadow: "0 2px 12px var(--nm-dark), 0 -1px 0 var(--nm-light)" }}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 bg-[#ff4757] rounded-lg flex items-center justify-center"
              style={{ boxShadow: "3px 3px 6px rgba(166,50,60,0.3), -2px -2px 4px rgba(255,100,110,0.2)" }}
            >
              <span className="text-sm">🏪</span>
            </div>
            <div className="hidden sm:block">
              <div className="font-jetbrains text-xs font-black text-[var(--text)] tracking-wider uppercase leading-tight">LA SMOKES</div>
              <div className="font-jetbrains text-[8px] font-bold text-[var(--text-muted)] tracking-widest uppercase leading-tight">WHOLESALE</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-jetbrains text-[9px] uppercase tracking-widest px-3 py-2 rounded-lg transition-all",
                  pathname === link.href
                    ? "text-[#ff4757] font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
                style={pathname === link.href ? { boxShadow: "var(--shadow-recessed)" } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
            />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 font-jetbrains text-[9px] uppercase tracking-wider px-3 py-2 text-[#ff4757] rounded-lg transition-all"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Cart</span>
              {count > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#ff4757] text-white font-black text-[8px] rounded-full flex items-center justify-center font-jetbrains"
                  style={{ boxShadow: "0 0 8px rgba(255,71,87,0.6)" }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* Admin link */}
            <Link
              href="/admin"
              className="hidden sm:flex font-jetbrains text-[8px] uppercase tracking-widest px-2 py-1.5 text-[var(--text-dim)] rounded-lg hover:text-[var(--text-muted)] transition-all"
            >
              Admin
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden text-[var(--text-muted)] hover:text-[#ff4757] transition-colors p-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[var(--background)] p-4 space-y-1 md:hidden"
            style={{ boxShadow: "0 8px 20px var(--nm-dark)" }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block font-jetbrains text-[9px] uppercase tracking-widest px-3 py-3 rounded-lg transition-all",
                  pathname === link.href
                    ? "text-[#ff4757] font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
                style={pathname === link.href ? { boxShadow: "var(--shadow-recessed)" } : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block font-jetbrains text-[8px] uppercase tracking-widest px-3 py-3 text-[var(--text-dim)] hover:text-[var(--text-muted)] transition-all"
            >
              Admin Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
