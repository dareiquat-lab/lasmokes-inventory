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
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/low-stock", label: "Low Stock", icon: AlertTriangle },
  { href: "/products/new", label: "Add Product", icon: PlusCircle },
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
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
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
        className="md:hidden fixed top-4 left-4 z-50 bg-[#111111] border border-[#1f1f1f] rounded-lg p-2"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 z-40"
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
            className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#111111] border-r border-[#1f1f1f] z-50 flex flex-col"
          >
            <SidebarContent onClose={() => setMobileOpen(false)} showClose />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-56 bg-[#111111] border-r border-[#1f1f1f] flex-col flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-base">
            🏪
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">LA Smokes</div>
            <div className="text-[10px] text-gray-500 leading-tight">Inventory</div>
          </div>
        </div>
        {showClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} onClick={onClose} />
        ))}
      </nav>
    </>
  );
}
