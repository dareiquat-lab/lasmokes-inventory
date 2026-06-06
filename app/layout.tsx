import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LA SMOKES — INVENTORY",
  description: "Internal inventory management system for LA Smokes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0a0a0f] text-[#e0e0f0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
