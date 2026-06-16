"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = searchParams.get("from") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Invalid password");
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center p-4">
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-[#e0e5ec] rounded-2xl mb-4"
            style={{ boxShadow: "6px 6px 14px #babecc, -6px -6px 14px #ffffff" }}
          >
            <Lock className="w-7 h-7 text-[#ff4757]" />
          </div>
          <h1 className="font-sans text-2xl font-black text-[#2d3436] tracking-tight">
            LA SMOKES
          </h1>
          <p className="font-jetbrains text-[9px] text-[#4a5568] uppercase tracking-widest mt-1">
            Admin Portal Access
          </p>
        </div>

        {/* Login card */}
        <div
          className="bg-[#e0e5ec] rounded-2xl p-6 relative overflow-hidden"
          style={{ boxShadow: "12px 12px 24px #babecc, -12px -12px 24px #ffffff" }}
        >
          {/* Corner vents decoration */}
          <div className="absolute top-3 right-4 flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1 h-5 rounded-full"
                style={{
                  background: "#d1d9e6",
                  boxShadow: "inset 1px 1px 2px #babecc, inset -1px -1px 1px #ffffff",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: "1px solid #babecc" }}>
            <div
              className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
              style={{ boxShadow: "0 0 6px rgba(34,197,94,0.8)" }}
            />
            <span className="font-jetbrains text-[10px] text-[#4a5568] uppercase tracking-widest">
              Authentication Required
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Access Code</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter admin password"
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="font-jetbrains text-[#c0392b] text-xs rounded-lg px-3 py-2"
                style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
              >
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Access Portal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to store */}
        <p className="text-center mt-4">
          <a href="/" className="font-jetbrains text-[10px] text-[#babecc] hover:text-[#ff4757] transition-colors">
            ← Back to storefront
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#babecc] border-t-[#ff4757] animate-spin"
        />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
