import { ClientsClient } from "@/components/admin/ClientsClient";

export const dynamic = "force-dynamic";

export default function ClientsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-black text-[var(--text)] tracking-tight">
          Clients
        </h1>
        <p className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 tracking-wider">
          Business client database — licenses &amp; permits on file
        </p>
      </div>
      <ClientsClient />
    </div>
  );
}
