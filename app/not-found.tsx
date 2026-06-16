import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center">
      <div
        className="bg-[#e0e5ec] rounded-2xl p-12 text-center"
        style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
      >
        <div className="font-jetbrains text-7xl font-black text-[#ff4757] mb-3">404</div>
        <p className="font-sans text-sm font-bold text-[#4a5568] uppercase tracking-widest mb-6">Page not found</p>
        <Link href="/" className="btn-primary inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
