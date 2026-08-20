"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Upload,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CLIENT_TYPES } from "@/types";
import type { Client, ClientType } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientForm {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  tobacco_license_number: string;
  sellers_permit_number: string;
  client_type: ClientType;
  notes: string;
}

const emptyForm = (): ClientForm => ({
  business_name: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  tobacco_license_number: "",
  sellers_permit_number: "",
  client_type: "Store Owner",
  notes: "",
});

function clientToForm(c: Client): ClientForm {
  return {
    business_name: c.business_name,
    contact_name: c.contact_name ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    address: c.address ?? "",
    city: c.city ?? "",
    state: c.state ?? "",
    zip: c.zip ?? "",
    tobacco_license_number: c.tobacco_license_number ?? "",
    sellers_permit_number: c.sellers_permit_number ?? "",
    client_type: c.client_type ?? "Store Owner",
    notes: c.notes ?? "",
  };
}

// ─── License Badge ─────────────────────────────────────────────────────────────

function LicenseBadge({ value, label }: { value: string | null; label: string }) {
  if (!value) {
    return (
      <span className="font-jetbrains text-[9px] text-[var(--text-dim)] uppercase tracking-widest">
        —
      </span>
    );
  }
  return (
    <div className="inline-flex flex-col gap-0.5">
      <span className="font-jetbrains text-[8px] text-[var(--text-muted)] uppercase tracking-widest leading-none">
        {label}
      </span>
      <span
        className="font-jetbrains text-[10px] font-black text-[var(--text)] px-2 py-0.5 rounded-md"
        style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)" }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Client Modal (Add / Edit) ─────────────────────────────────────────────────

function ClientModal({
  client,
  prefill,
  onClose,
  onSaved,
}: {
  client: Client | null;
  prefill?: Partial<ClientForm>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ClientForm>(
    client ? clientToForm(client) : { ...emptyForm(), ...prefill }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof ClientForm, val: string) =>
    setForm((f) => ({ ...f, [field]: val }));

  const handleSave = async () => {
    if (!form.business_name.trim()) {
      setError("Business name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const method = client ? "PUT" : "POST";
      const url = client
        ? `/api/admin/clients/${client.id}`
        : "/api/admin/clients";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: form.business_name.trim(),
          contact_name: form.contact_name.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zip: form.zip.trim() || null,
          tobacco_license_number: form.tobacco_license_number.trim() || null,
          sellers_permit_number: form.sellers_permit_number.trim() || null,
          client_type: form.client_type,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Save failed");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto"
      style={{ background: "rgba(45,52,54,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg bg-[var(--background)] rounded-2xl flex flex-col"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-shadow)" }}
        >
          <div>
            <div className="font-sans text-base font-black text-[var(--text)]">
              {client ? "Edit Client" : "Add Client"}
            </div>
            <div className="font-jetbrains text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
              {client ? `ID #${client.id}` : "New business record"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:text-[#ff4757] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Business info */}
          <div>
            <div className="font-jetbrains text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">
              Business Info
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">
                  Business Name <span className="text-[#ff4757]">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Valley Smoke Shop"
                  value={form.business_name}
                  onChange={(e) => set("business_name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input
                  className="input-field"
                  placeholder="Owner / Manager name"
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Client Type</label>
                <select
                  className="input-field"
                  value={form.client_type}
                  onChange={(e) => set("client_type", e.target.value as ClientType)}
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input
                    className="input-field"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input-field"
                    placeholder="hello@shop.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="font-jetbrains text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">
              Address
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Street Address</label>
                <input
                  className="input-field"
                  placeholder="123 Main St"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2">
                  <label className="label">City</label>
                  <input
                    className="input-field"
                    placeholder="Los Angeles"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    className="input-field"
                    placeholder="CA"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => set("state", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">ZIP</label>
                  <input
                    className="input-field"
                    placeholder="90001"
                    value={form.zip}
                    onChange={(e) => set("zip", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div>
            <div className="font-jetbrains text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] mb-3">
              Compliance Numbers
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Tobacco License Number</label>
                <input
                  className="input-field"
                  placeholder="e.g. TL-2024-XXXXX"
                  value={form.tobacco_license_number}
                  onChange={(e) => set("tobacco_license_number", e.target.value)}
                />
              </div>
              <div>
                <label className="label">Sellers Permit Number</label>
                <input
                  className="input-field"
                  placeholder="e.g. SR XXXXXXX"
                  value={form.sellers_permit_number}
                  onChange={(e) => set("sellers_permit_number", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Additional notes…"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-3 font-jetbrains text-xs text-[#c0392b]"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: "1px solid var(--border-shadow)" }}
        >
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                {client ? "Save Changes" : "Add Client"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Import Modal ───────────────────────────────────────────────────────────

interface ExtractedClientData {
  business_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  tobacco_license_number: string | null;
  sellers_permit_number: string | null;
}

function AIImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: (prefill: Partial<ClientForm>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [extracted, setExtracted] = useState<ExtractedClientData[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ai-parse/status")
      .then((r) => r.json())
      .then((d) => setApiConfigured(d.configured))
      .catch(() => setApiConfigured(false));
  }, []);

  const handleExtract = async () => {
    if (!file) return;
    setParsing(true);
    setParseError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", "client");
      const res = await fetch("/api/ai-parse", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      const clients: ExtractedClientData[] = json.data.clients || [];
      if (clients.length === 0) throw new Error("No client data found in this document");
      setExtracted(clients);
      setSelectedIdx(0);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setParsing(false);
    }
  };

  const handleUse = () => {
    if (!extracted) return;
    const c = extracted[selectedIdx];
    onImported({
      business_name: c.business_name ?? "",
      contact_name: c.contact_name ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      address: c.address ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      zip: c.zip ?? "",
      tobacco_license_number: c.tobacco_license_number ?? "",
      sellers_permit_number: c.sellers_permit_number ?? "",
    });
  };

  const previewFile = file
    ? file.type === "application/pdf"
      ? null
      : URL.createObjectURL(file)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(45,52,54,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md bg-[var(--background)] rounded-2xl flex flex-col"
        style={{ boxShadow: "var(--shadow-lg)", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-shadow)" }}
        >
          <div>
            <div className="font-sans text-base font-black text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff4757]" />
              AI Client Import
            </div>
            <div className="font-jetbrains text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
              Upload a business card, license, or permit
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:text-[#ff4757] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* API warning */}
          {apiConfigured === false && (
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)" }}
            >
              <AlertTriangle className="w-4 h-4 text-[#ff4757] flex-shrink-0" />
              <div className="font-jetbrains text-[10px] text-[#ff4757]">
                ANTHROPIC_API_KEY not configured
              </div>
            </div>
          )}

          {/* Upload zone */}
          {!extracted && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
              {!file ? (
                <label
                  htmlFor="ai-client-file"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer py-10 px-6"
                  style={{ boxShadow: "var(--shadow-recessed)" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                  >
                    <Upload className="w-6 h-6 text-[var(--text-dim)]" />
                  </div>
                  <div className="text-center">
                    <div className="font-jetbrains text-xs font-black text-[var(--text)] uppercase tracking-wider">
                      Tap to upload
                    </div>
                    <div className="font-jetbrains text-[10px] text-[var(--text-dim)] mt-1">
                      Business card, license, or permit — image or PDF
                    </div>
                  </div>
                </label>
              ) : (
                <div
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ boxShadow: "var(--shadow-inner-md)" }}
                >
                  {previewFile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewFile}
                      alt="preview"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[var(--background)] flex items-center justify-center flex-shrink-0"
                      style={{ boxShadow: "var(--shadow-sm)" }}>
                      <FileText className="w-7 h-7 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-jetbrains text-xs font-black text-[var(--text)] truncate">
                      {file.name}
                    </div>
                    <div className="font-jetbrains text-[9px] text-[var(--text-muted)] mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-[var(--text-dim)] hover:text-[#ff4757] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {parseError && (
                <div
                  className="rounded-xl px-4 py-3 font-jetbrains text-xs text-[#c0392b]"
                  style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)" }}
                >
                  {parseError}
                </div>
              )}

              <button
                onClick={handleExtract}
                disabled={!file || parsing || apiConfigured === false}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Extracting data…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Extract Client Info
                  </>
                )}
              </button>
            </>
          )}

          {/* Review extracted data */}
          {extracted && (
            <>
              <div className="font-jetbrains text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                {extracted.length > 1
                  ? `${extracted.length} records found — select one:`
                  : "Review extracted data:"}
              </div>

              {extracted.length > 1 && (
                <div className="flex gap-2">
                  {extracted.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIdx(i)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-1.5 font-jetbrains text-[10px] font-black uppercase tracking-wider transition-all",
                        selectedIdx === i
                          ? "bg-[#ff4757] text-white"
                          : "text-[var(--text-muted)]"
                      )}
                      style={selectedIdx !== i ? { boxShadow: "var(--shadow-sm)" } : {}}
                    >
                      Record {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {(() => {
                const c = extracted[selectedIdx];
                return (
                  <div
                    className="rounded-2xl p-4 space-y-2"
                    style={{ boxShadow: "var(--shadow-inner-md)" }}
                  >
                    {[
                      ["Business", c.business_name],
                      ["Contact", c.contact_name],
                      ["Phone", c.phone],
                      ["Email", c.email],
                      ["Address", [c.address, c.city, c.state, c.zip].filter(Boolean).join(", ")],
                      ["Tobacco License", c.tobacco_license_number],
                      ["Sellers Permit", c.sellers_permit_number],
                    ].map(([label, val]) =>
                      val ? (
                        <div key={label} className="flex gap-3">
                          <span className="font-jetbrains text-[9px] text-[var(--text-dim)] uppercase tracking-widest w-24 flex-shrink-0 pt-0.5">
                            {label}
                          </span>
                          <span className="font-jetbrains text-xs font-black text-[var(--text)]">
                            {val}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                );
              })()}

              <div className="flex gap-3">
                <button
                  onClick={() => setExtracted(null)}
                  className="btn-secondary flex-1"
                >
                  Try Again
                </button>
                <button onClick={handleUse} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Use This Data
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirm({
  client,
  onClose,
  onDeleted,
}: {
  client: Client;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(45,52,54,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm bg-[var(--background)] rounded-2xl p-6 space-y-5"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}
          >
            <Trash2 className="w-5 h-5 text-[#c0392b]" />
          </div>
          <div>
            <div className="font-sans text-base font-black text-[var(--text)]">
              Delete Client
            </div>
            <div className="font-jetbrains text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Remove <strong>{client.business_name}</strong> from the database? This cannot be undone.
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-xl px-4 py-2.5 font-jetbrains text-xs font-black uppercase tracking-wider text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "#c0392b", boxShadow: "4px 4px 8px rgba(192,57,43,0.3), -2px -2px 6px rgba(255,100,100,0.1)" }}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client Row / Card ─────────────────────────────────────────────────────────

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const fullAddress = [client.address, client.city, client.state, client.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="bg-[var(--background)] rounded-2xl p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Top row: name + actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="font-sans text-sm font-black text-[var(--text)] truncate">
            {client.business_name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="font-jetbrains text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,71,87,0.1)", color: "#ff4757" }}
            >
              {client.client_type}
            </span>
            {client.contact_name && (
              <span className="font-jetbrains text-[10px] text-[var(--text-muted)] truncate">
                {client.contact_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[#ff4757] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-dim)] hover:text-[#c0392b] transition-colors"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-4">
        {client.phone && (
          <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[var(--text-muted)]">
            <Phone className="w-3 h-3 text-[var(--text-dim)] flex-shrink-0" />
            {client.phone}
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2 font-jetbrains text-[10px] text-[var(--text-muted)]">
            <Mail className="w-3 h-3 text-[var(--text-dim)] flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {fullAddress && (
          <div className="flex items-start gap-2 font-jetbrains text-[10px] text-[var(--text-muted)]">
            <MapPin className="w-3 h-3 text-[var(--text-dim)] flex-shrink-0 mt-0.5" />
            <span>{fullAddress}</span>
          </div>
        )}
      </div>

      {/* License badges */}
      <div
        className="grid grid-cols-2 gap-3 pt-3"
        style={{ borderTop: "1px solid #d0d4db" }}
      >
        <LicenseBadge value={client.tobacco_license_number} label="Tobacco Lic." />
        <LicenseBadge value={client.sellers_permit_number} label="Sellers Permit" />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ClientsClient() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "">("");
  const [page, setPage] = useState(1);

  const [editTarget, setEditTarget] = useState<Client | null | "new">(null);
  const [aiPrefill, setAiPrefill] = useState<Partial<ClientForm> | undefined>(undefined);
  const [showAIImport, setShowAIImport] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: String(page),
        limit: "20",
        ...(typeFilter ? { type: typeFilter } : {}),
      });
      const res = await fetch(`/api/admin/clients?${params}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      setClients(data.clients ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients, typeFilter]);

  const withTobacco = clients.filter((c) => c.tobacco_license_number).length;
  const withPermit = clients.filter((c) => c.sellers_permit_number).length;

  const handleAIImported = (prefill: Partial<ClientForm>) => {
    setShowAIImport(false);
    setAiPrefill(prefill);
    setEditTarget("new");
  };

  return (
    <>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            className="input-field pl-9 w-full"
            placeholder="Search by name, phone, license…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAIImport(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Import</span>
          </button>
          <button
            onClick={() => { setAiPrefill(undefined); setEditTarget("new"); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setTypeFilter(""); setPage(1); }}
          className={cn(
            "font-jetbrains text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all",
            typeFilter === ""
              ? "text-white bg-[#ff4757]"
              : "text-[var(--text-muted)]"
          )}
          style={typeFilter !== "" ? { boxShadow: "var(--shadow-sm)" } : {}}
        >
          All
        </button>
        {CLIENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => { setTypeFilter(t); setPage(1); }}
            className={cn(
              "font-jetbrains text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all",
              typeFilter === t
                ? "text-white bg-[#ff4757]"
                : "text-[var(--text-muted)]"
            )}
            style={typeFilter !== t ? { boxShadow: "var(--shadow-sm)" } : {}}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Clients", value: total, color: "#ff4757" },
          {
            icon: FileText,
            label: "Tobacco License on File",
            value: loading ? "—" : `${withTobacco} / ${clients.length}`,
            color: "#00b894",
          },
          {
            icon: Building2,
            label: "Sellers Permit on File",
            value: loading ? "—" : `${withPermit} / ${clients.length}`,
            color: "#0984e3",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="bg-[var(--background)] rounded-2xl p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: "var(--shadow-inner-md)" }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="min-w-0">
                <div className="font-jetbrains text-[8px] text-[var(--text-dim)] uppercase tracking-widest leading-tight">
                  {label}
                </div>
                <div className="font-sans text-lg font-black text-[var(--text)] leading-tight mt-0.5">
                  {loading ? (
                    <span className="inline-block w-8 h-4 rounded bg-[var(--border-shadow)] opacity-40 animate-pulse" />
                  ) : (
                    value
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Client grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--background)] rounded-2xl p-5 h-48 animate-pulse"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div
          className="bg-[var(--background)] rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-recessed)" }}
          >
            <Users className="w-7 h-7 text-[var(--text-dim)]" />
          </div>
          <div className="text-center">
            <div className="font-sans text-base font-black text-[var(--text)]">
              {debouncedSearch ? "No clients match your search" : "No clients yet"}
            </div>
            <div className="font-jetbrains text-[10px] text-[var(--text-dim)] mt-1 uppercase tracking-widest">
              {debouncedSearch ? "Try a different search term" : "Add your first client to get started"}
            </div>
          </div>
          {!debouncedSearch && (
            <button
              onClick={() => { setAiPrefill(undefined); setEditTarget("new"); }}
              className="btn-primary flex items-center gap-2 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <ClientCard
              key={c.id}
              client={c}
              onEdit={() => { setAiPrefill(undefined); setEditTarget(c); }}
              onDelete={() => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30 transition-all"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-jetbrains text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30 transition-all"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      {showAIImport && (
        <AIImportModal
          onClose={() => setShowAIImport(false)}
          onImported={handleAIImported}
        />
      )}

      {editTarget !== null && (
        <ClientModal
          client={editTarget === "new" ? null : editTarget}
          prefill={aiPrefill}
          onClose={() => { setEditTarget(null); setAiPrefill(undefined); }}
          onSaved={() => {
            setEditTarget(null);
            setAiPrefill(undefined);
            fetchClients();
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          client={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            fetchClients();
          }}
        />
      )}
    </>
  );
}
