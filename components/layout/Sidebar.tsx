"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  PlusCircle,
  Menu,
  X,
  ShoppingCart,
  LogOut,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/admin",               label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/inventory",     label: "Inventory",  icon: Package         },
  { href: "/admin/orders",        label: "Orders",     icon: ShoppingCart    },
  { href: "/admin/profit",        label: "Profit",     icon: TrendingUp      },
  { href: "/admin/categories",    label: "Categories", icon: Tag             },
  { href: "/admin/low-stock",     label: "Low Stock",  icon: AlertTriangle   },
  { href: "/admin/products/new",  label: "Add Item",   icon: PlusCircle      },
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
      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-[#ff4757]")} />
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto w-2 h-2 rounded-full bg-[#ff4757]"
          style={{ boxShadow: "0 0 6px rgba(255,71,87,0.7)" }}
        />
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
        className="md:hidden fixed top-4 left-4 z-50 bg-[#e0e5ec] rounded-lg p-2"
        style={{ boxShadow: "4px 4px 8px #babecc, -4px -4px 8px #ffffff" }}
      >
        <Menu className="w-5 h-5 text-[#4a5568]" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-[#2d3436]/40 z-40 backdrop-blur-sm"
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
            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#e0e5ec] z-50 flex flex-col"
            style={{ boxShadow: "8px 0 24px #babecc" }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} showClose />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex w-56 bg-[#e0e5ec] flex-col flex-shrink-0"
        style={{ boxShadow: "4px 0 12px #babecc" }}
      >
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <>
      {/* Logo */}
      <div className="px-4 py-5 relative" style={{ borderBottom: "1px solid #babecc" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 bg-[#ff4757] rounded-lg flex items-center justify-center"
              style={{ boxShadow: "3px 3px 8px rgba(166,50,60,0.3), -2px -2px 5px rgba(255,100,110,0.2)" }}
            >
              <span className="text-base">🏪</span>
            </div>
            <div>
              <div className="font-jetbrains text-xs font-black text-[#2d3436] leading-tight tracking-wider uppercase">
                LA SMOKES WHOLESALE
              </div>
              <div className="font-jetbrains text-[8px] text-[#4a5568] leading-tight tracking-widest uppercase">
                Admin Portal
              </div>
            </div>
          </div>
          {showClose && (
            <button onClick={onClose} className="text-[#babecc] hover:text-[#ff4757] transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* System status */}
      <div className="px-4 py-2" style={{ borderBottom: "1px solid #babecc" }}>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
            style={{ boxShadow: "0 0 5px rgba(34,197,94,0.8)" }}
          />
          <span className="font-jetbrains text-[8px] text-[#4a5568] uppercase tracking-widest">System Online</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="font-jetbrains text-[8px] text-[#babecc] uppercase tracking-widest px-3 py-2">
          Navigation
        </div>
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} onClick={onClose} />
        ))}

        {/* Storefront link */}
        <div className="font-jetbrains text-[8px] text-[#babecc] uppercase tracking-widest px-3 py-2 mt-3">
          Storefront
        </div>
        <Link
          href="/"
          onClick={onClose}
          className="sidebar-link sidebar-link-inactive"
          target="_blank"
        >
          <Package className="w-4 h-4 flex-shrink-0" />
          <span>View Store</span>
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-3" style={{ borderTop: "1px solid #babecc" }}>
        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full text-left text-[#c0392b] hover:text-[#c0392b] hover:bg-[#c0392b10]"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Logout</span>
        </button>
        <div className="font-jetbrains text-[9px] text-[#babecc] mt-3 leading-relaxed">
          <div>v1.0.0 // LASMOKES-WHL</div>
        </div>
      </div>
    </>
  );
}
