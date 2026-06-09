"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Terminal } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00ff8812] border border-[#00ff8840] mb-4 clip-chamfer-md mx-auto">
            <Lock className="w-7 h-7 text-[#00ff88] drop-shadow-[0_0_8px_#00ff88]" />
          </div>
          <h1 className="font-orbitron text-2xl font-black text-[#00ff88] tracking-wider glitch">
            LA SMOKES
          </h1>
          <p className="font-orbitron text-[9px] text-[#4a4a6a] uppercase tracking-widest mt-1">
            Admin Portal Access
          </p>
        </div>

        {/* Login card */}
        <div
          className="bg-[#0d0d17] border border-[#00ff8830] p-6 relative overflow-hidden"
          style={{
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            boxShadow: "0 0 30px #00ff8810",
          }}
        >
          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,136,0.012) 3px, rgba(0,255,136,0.012) 4px)",
            }}
          />

          <div className="relative z-10">
            {/* Terminal prompt */}
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e1e2e]">
              <Terminal className="w-3.5 h-3.5 text-[#00ff8860]" />
              <span className="font-jetbrains text-[10px] text-[#2e2e4a]">
                <span className="text-[#00ff8870]">admin@lasmokes</span>
                <span className="text-[#1e1e2e]">:</span>
                <span className="text-[#00d4ff70]">~</span>
                <span className="text-[#2e2e4a]"> $ authenticate</span>
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
                <div className="font-jetbrains text-[#ff3366] text-xs bg-[#ff336610] border border-[#ff336630] px-3 py-2 clip-chamfer-sm">
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
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
        </div>

        {/* Back to store */}
        <p className="text-center mt-4">
          <a href="/" className="font-jetbrains text-[10px] text-[#2e2e4a] hover:text-[#00ff88] transition-colors">
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00ff8830] border-t-[#00ff88] rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
