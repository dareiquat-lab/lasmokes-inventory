import { CartProvider } from "@/components/storefront/CartContext";
import { StorefrontNav } from "@/components/storefront/StorefrontNav";
import { CartSheet } from "@/components/storefront/CartSheet";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontNav />
      <CartSheet />
      <main className="pt-16 min-h-screen bg-[var(--background)]">
        {children}
      </main>
    </CartProvider>
  );
}
