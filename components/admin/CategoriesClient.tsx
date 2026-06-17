"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, X, Tag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { CategoryRecord } from "@/types";

function suggestEmoji(name: string): string {
  const n = name.toLowerCase();
  const rules: [string[], string][] = [
    [["cigarette", "cig", "tobacco", "smoke", "marlboro", "newport", "camel", "menthol"], "🚬"],
    [["cigar", "stogie", "cohiba", "davidoff"], "🍫"],
    [["wrap", "blunt", "backwood", "dutchmaster"], "📜"],
    [["paper", "rolling", "zigzag", "zig", "raw", "rizla"], "📄"],
    [["lighter", "torch", "clipper", "bic", "flame", "ignit"], "🔥"],
    [["match", "matchbook"], "🔥"],
    [["battery", "batteries", "18650", "lithium", "alkaline"], "🔋"],
    [["butane", "propane", "fuel", "gas", "fluid", "refill"], "💨"],
    [["incense", "stick", "scent", "aroma", "fragrance", "diffuser"], "🕯️"],
    [["candle", "wax"], "🕯️"],
    [["medication", "medicine", "drug", "pharmacy", "vitamin", "pill", "capsule", "otc", "health"], "💊"],
    [["accessory", "accessories", "tool", "supply", "misc", "other", "general"], "⚙️"],
    [["grinder", "herb grinder"], "⚙️"],
    [["eye", "vision", "contact", "drop", "optical", "lens"], "👁️"],
    [["condom", "protection", "contraceptive", "safe", "sexual"], "🛡️"],
    [["vape", "vaping", "e-cig", "ecig", "pod", "mod", "coil", "juice", "eliquid", "e-liquid", "disposable"], "💨"],
    [["hookah", "shisha", "narghile", "waterpipe"], "🌬️"],
    [["pipe", "glass", "bowl", "bong", "dab", "rig"], "🪈"],
    [["hemp", "cbd", "cannabis", "marijuana", "weed", "herb", "kush", "sativa", "indica", "delta"], "🌿"],
    [["drink", "beverage", "soda", "water", "tea", "coffee", "energy drink"], "🥤"],
    [["energy", "boost", "monster", "redbull"], "⚡"],
    [["beer", "alcohol", "wine", "liquor", "spirit", "whiskey", "vodka", "rum"], "🍺"],
    [["food", "snack", "chip", "cracker", "pretzel", "popcorn", "nuts"], "🍿"],
    [["candy", "gummy", "sweet", "chocolate", "lollipop"], "🍬"],
    [["gum", "chew", "mint", "breath"], "🌿"],
    [["lotion", "cream", "balm", "salve", "skincare", "skin"], "🧴"],
    [["rolling tray", "tray", "mat"], "🗂️"],
    [["scale", "weight", "measure"], "⚖️"],
    [["bag", "storage", "case", "pouch", "container", "box"], "👜"],
    [["card", "gift", "voucher", "coupon"], "🎁"],
    [["phone", "charger", "cable", "electronic", "tech"], "📱"],
    [["mask", "ppe", "glove", "hygiene", "sanit"], "🧤"],
    [["pain", "relief", "aspirin", "ibuprofen", "tylenol"], "💊"],
    [["sexual", "adult", "pleasure"], "🛡️"],
    [["lighter fluid", "torch fuel"], "🔥"],
    [["cleaning", "cleaner", "wash", "wipe"], "🧹"],
    [["nail", "gel", "polish", "beauty", "cosmetic"], "💅"],
    [["hat", "cap", "shirt", "apparel", "clothing", "merch"], "👕"],
  ];
  for (const [keywords, emoji] of rules) {
    if (keywords.some(k => n.includes(k))) return emoji;
  }
  return "📦";
}

export function CategoriesClient() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add/Edit modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIcon, setFormIcon] = useState("📦");
  const [formError, setFormError] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [deleteProductCount, setDeleteProductCount] = useState(0);
  const [deleteHasProducts, setDeleteHasProducts] = useState(false);
  const [reassignTo, setReassignTo] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setFormName("");
    setFormDesc("");
    setFormIcon("📦");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (cat: CategoryRecord) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormDesc(cat.description || "");
    setFormIcon(cat.icon || "📦");
    setFormError("");
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setFormName(name);
    // Auto-suggest emoji only when adding (not editing) or if icon is still the default
    if (!editing || formIcon === "📦") {
      setFormIcon(suggestEmoji(name));
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError("Name is required");
      return;
    }
    setFormSaving(true);
    setFormError("");
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim(), description: formDesc.trim() || null, icon: formIcon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setShowForm(false);
      fetchCategories();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setFormSaving(false);
    }
  };

  const openDelete = (cat: CategoryRecord) => {
    setDeleteTarget(cat);
    setDeleteProductCount(0);
    setDeleteHasProducts(false);
    setReassignTo("");
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteHasProducts && !reassignTo) {
      setDeleteError("Please select a category to reassign products to");
      return;
    }
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reassignTo: reassignTo || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.productCount !== undefined) {
          setDeleteHasProducts(true);
          setDeleteProductCount(data.productCount);
          setIsDeleting(false);
          return;
        }
        throw new Error(data.error || "Failed to delete");
      }
      setDeleteTarget(null);
      setDeleteHasProducts(false);
      fetchCategories();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const otherCategories = categories.filter((c) => c.id !== deleteTarget?.id);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#babecc]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#babecc] hover:text-[#ff4757]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="font-jetbrains text-[10px] text-[#babecc]">
        {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        {search && ` · ${filtered.length} matching`}
      </div>

      {/* Table card */}
      <div
        className="bg-[#e0e5ec] rounded-2xl overflow-hidden"
        style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #babecc" }}>
                <th className="table-header">Name</th>
                <th className="table-header hidden sm:table-cell">Description</th>
                <th className="table-header hidden md:table-cell">Created</th>
                <th className="table-header w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f2f5" }} className="animate-pulse">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="table-cell">
                        <div className="h-4 bg-[#d1d9e6] rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-cell text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-xl bg-[#e0e5ec] flex items-center justify-center"
                        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
                      >
                        <Tag className="w-5 h-5 text-[#babecc]" />
                      </div>
                      <p className="font-jetbrains text-xs text-[#babecc] uppercase tracking-widest">
                        {search ? "No categories match your search" : "No categories yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr
                    key={cat.id}
                    style={{ borderBottom: "1px solid #f0f2f5" }}
                    className="hover:bg-[#ff475704] transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg bg-[#e0e5ec] flex items-center justify-center flex-shrink-0 text-lg"
                          style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
                        >
                          {cat.icon || "📦"}
                        </div>
                        <span className="font-sans text-sm font-bold text-[#2d3436]">{cat.name}</span>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="font-jetbrains text-xs text-[#4a5568]">
                        {cat.description || (
                          <span className="text-[#babecc] italic">No description</span>
                        )}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="font-jetbrains text-[10px] text-[#babecc]">
                        {new Date(cat.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg text-[#4a5568] hover:text-[#0984e3] hover:bg-[#0984e310] transition-all"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDelete(cat)}
                          className="p-1.5 rounded-lg text-[#4a5568] hover:text-[#c0392b] hover:bg-[#c0392b10] transition-all"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => { if (!formSaving) { setShowForm(false); setFormError(""); } }} title={editing ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">Category Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                className="input-field"
                placeholder="e.g. Vapes"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Icon</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-11 h-11 flex items-center justify-center text-2xl rounded-lg bg-[#e0e5ec] select-none"
                  style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
                  title="Auto-suggested icon"
                >
                  {formIcon}
                </div>
                <input
                  type="text"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  className="input-field w-16 text-center text-lg"
                  maxLength={4}
                  title="Type or paste any emoji"
                />
              </div>
            </div>
          </div>
          <p className="font-jetbrains text-[9px] text-[#babecc] -mt-2">
            Icon is auto-suggested from the name — type any emoji to override
          </p>
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Brief description of this category..."
            />
          </div>

          {formError && (
            <div
              className="font-jetbrains text-xs text-[#c0392b]"
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.2)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {formError}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={() => { if (!formSaving) { setShowForm(false); setFormError(""); } }}
              disabled={formSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={formSaving || !formName.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {formSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                editing ? "Save Changes" : "Create Category"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteHasProducts(false);
            setDeleteError("");
          }
        }}
        title="Delete Category"
      >
        <div className="space-y-4">
          {!deleteHasProducts ? (
            <p className="font-jetbrains text-[#4a5568] text-sm">
              Are you sure you want to delete{" "}
              <span className="font-bold text-[#2d3436]">&ldquo;{deleteTarget?.name}&rdquo;</span>?
              This action cannot be undone.
            </p>
          ) : (
            <div className="space-y-3">
              <div
                className="font-jetbrains text-xs text-[#92400e]"
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                This category has{" "}
                <span className="font-bold">{deleteProductCount} product{deleteProductCount !== 1 ? "s" : ""}</span>.
                Please select a category to reassign them to before deleting.
              </div>
              <div>
                <label className="label">Reassign products to</label>
                <select
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a category...</option>
                  {otherCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {deleteError && (
            <div
              className="font-jetbrains text-xs text-[#c0392b]"
              style={{
                background: "rgba(192,57,43,0.08)",
                border: "1px solid rgba(192,57,43,0.2)",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              {deleteError}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                if (!isDeleting) {
                  setDeleteTarget(null);
                  setDeleteHasProducts(false);
                  setDeleteError("");
                }
              }}
              disabled={isDeleting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || (deleteHasProducts && !reassignTo)}
              className="btn-danger flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Deleting...
                </>
              ) : deleteHasProducts ? (
                "Reassign & Delete"
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
