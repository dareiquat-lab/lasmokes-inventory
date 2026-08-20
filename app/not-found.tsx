import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div
        className="bg-[var(--background)] rounded-2xl p-12 text-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="font-jetbrains text-7xl font-black text-[#ff4757] mb-3">404</div>
        <p className="font-sans text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">Page not found</p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
