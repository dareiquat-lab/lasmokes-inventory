"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Plus, CheckCircle, Loader2, Building2, ChevronDown } from "lucide-react";
import type { Client } from "@/types";

interface QuickCreateForm {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
}

export interface ClientPickerProps {
  selectedClient: Client | null;
  onSelect: (client: Client) => void;
  onClear: () => void;
  label?: string;
}

export function ClientPicker({ selectedClient, onSelect, onClear, label = "Client" }: ClientPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState<QuickCreateForm>({ business_name: "", contact_name: "", phone: "", email: "" });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q, limit: "8" });
      const res = await fetch(`/api/admin/clients?${params}`);
      const data = await res.json();
      setResults(data.clients ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, open, search]);

  useEffect(() => {
    if (open) search(query);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (client: Client) => {
    onSelect(client);
    setOpen(false);
    setQuery("");
    setShowCreate(false);
  };

  const handleCreate = async () => {
    if (!form.business_name.trim()) { setCreateError("Business name is required"); return; }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: form.business_name.trim(),
          contact_name: form.contact_name.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");
      handleSelect(data as Client);
      setForm({ business_name: "", contact_name: "", phone: "", email: "" });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  if (selectedClient) {
    return (
      <div>
        <label className="label">{label}</label>
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ boxShadow: "var(--shadow-inner-sm)", background: "var(--background)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,71,87,0.1)" }}
          >
            <Building2 className="w-4 h-4 text-[#ff4757]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sans text-sm font-black text-[var(--text)] truncate">
              {selectedClient.business_name}
            </div>
            {selectedClient.contact_name && (
              <div className="font-jetbrains text-[10px] text-[var(--text-muted)] truncate">
                {selectedClient.contact_name}
                {selectedClient.phone ? ` · ${selectedClient.phone}` : ""}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            title="Change client"
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:text-[#ff4757] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="label">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
        <input
          ref={inputRef}
          className="input-field pl-9 pr-9"
          placeholder="Search clients or leave blank to create…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setShowCreate(false); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)] pointer-events-none" />
      </div>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1 bg-[var(--background)] rounded-xl overflow-hidden z-30"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {!showCreate ? (
            <>
              {loading && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <Loader2 className="w-3 h-3 animate-spin text-[var(--text-dim)]" />
                  <span className="font-jetbrains text-[10px] text-[var(--text-dim)]">Searching…</span>
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="px-4 py-3 font-jetbrains text-[10px] text-[var(--text-dim)]">
                  {query ? "No clients found" : "No clients yet"}
                </div>
              )}

              {!loading && results.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => handleSelect(c)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#ff475708] transition-colors"
                  style={{ borderBottom: "1px solid var(--border-shadow)" }}
                >
                  <Building2 className="w-4 h-4 text-[var(--text-dim)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-xs font-bold text-[var(--text)] truncate">{c.business_name}</div>
                    <div className="font-jetbrains text-[9px] text-[var(--text-dim)] truncate">
                      {[c.contact_name, c.phone, c.client_type].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onMouseDown={() => { setShowCreate(true); setCreateError(""); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#ff475708] transition-colors"
              >
                <Plus className="w-4 h-4 text-[#ff4757] flex-shrink-0" />
                <span className="font-jetbrains text-xs font-black text-[#ff4757] uppercase tracking-wider">
                  New Client
                </span>
              </button>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <div className="font-jetbrains text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Quick-create client
              </div>
              <div className="space-y-2">
                <input
                  className="input-field"
                  placeholder="Business Name *"
                  value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                  autoFocus
                />
                <input
                  className="input-field"
                  placeholder="Contact Name"
                  value={form.contact_name}
                  onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input-field"
                    placeholder="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                  <input
                    className="input-field"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
              </div>
              {createError && (
                <div className="font-jetbrains text-[10px] text-[#c0392b]">{createError}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onMouseDown={() => setShowCreate(false)}
                  className="btn-secondary flex-1 text-xs py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onMouseDown={handleCreate}
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-2 disabled:opacity-40"
                >
                  {creating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
