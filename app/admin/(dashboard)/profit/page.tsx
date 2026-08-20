import { ProfitClient } from "@/components/admin/ProfitClient";

export const dynamic = "force-dynamic";

export default function ProfitPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Profit Analytics
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Cost tracking, margins, and profit reporting
        </p>
      </div>
      <ProfitClient />
    </div>
  );
}
