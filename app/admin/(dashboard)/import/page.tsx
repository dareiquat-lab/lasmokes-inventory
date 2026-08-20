import { ImportClient } from "@/components/admin/ImportClient";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          AI Import
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Upload order screenshots or supplier invoices — Claude extracts and commits the data
        </p>
      </div>
      <ImportClient />
    </div>
  );
}
