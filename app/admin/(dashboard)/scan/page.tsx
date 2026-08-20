import { ScanClient } from "@/components/admin/ScanClient";

export const dynamic = "force-dynamic";

export default function ScanPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Scan to Order
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Connect a barcode scanner and scan items to build an order instantly
        </p>
      </div>
      <ScanClient />
    </div>
  );
}
