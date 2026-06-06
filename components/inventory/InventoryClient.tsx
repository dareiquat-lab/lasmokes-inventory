"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Download,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Barcode,
} from "lucide-react";
import Link from "next/link";

import { CategoryBadge, StockBadge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import { useSearchParams } from "next/navigation";

interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField = "product_name" | "category" | "sku" | "quantity" | "price" | "updated_at";

export function InventoryClient() {
  const searchParamsHook = useSearchParams();

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParamsHook.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [category, setCategory] = useState(searchParamsHook.get("category") || "");
  const [sortBy, setSortBy] = useState<SortField>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [barcodeModal, setBarcodeModal] = useState<Product | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        category,
        sortBy,
        sortOrder,
        page: String(page),
        limit: "25",
      });
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.products.map(p => p.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      let body: Record<string, unknown> = { ids, action: bulkAction };
      if (bulkAction === "update_quantity") body.data = { quantity: parseInt(bulkQuantity) };
      else if (bulkAction === "update_category") body.data = { category: bulkCategory };

      await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setSelectedIds(new Set());
      setBulkModal(false);
      setBulkAction("");
      setBulkQuantity("");
      setBulkCategory("");
      fetchProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ChevronUp className="w-3 h-3 text-[#2e2e4a]" />;
    return sortOrder === "asc"
      ? <ChevronUp className="w-3 h-3 text-[#00ff88]" />
      : <ChevronDown className="w-3 h-3 text-[#00ff88]" />;
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-orbitron text-[9px] font-bold uppercase tracking-widest text-[#4a4a6a] hover:text-[#00ff88] transition-colors"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  const allSelected = data ? selectedIds.size === data.products.length && data.products.length > 0 : false;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e4a]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, barcode..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2e2e4a] hover:text-[#00ff88]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e2e4a] pointer-events-none" />
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="input-field pl-9 pr-8 appearance-none min-w-[160px] cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/products/new" className="btn-primary flex items-center gap-1.5 whitespace-nowrap">
            <PlusCircle className="w-3.5 h-3.5" />
            Add Item
          </Link>
          <a href="/api/export?format=csv" className="btn-secondary flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="flex items-center justify-between font-jetbrains text-[10px] text-[#2e2e4a]">
          <span>
            <span className="text-[#00ff8860]">//</span>{" "}
            {data.total.toLocaleString()} record{data.total !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {category && ` in ${category}`}
          </span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[#00ff88] font-bold">{selectedIds.size} selected</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setBulkAction("update_quantity"); setBulkModal(true); }}
                  className="font-orbitron text-[9px] text-[#4a4a6a] hover:text-[#00ff88] bg-[#0d0d17] border border-[#1e1e2e] hover:border-[#00ff8840] px-2 py-1 clip-chamfer-sm transition-all"
                >
                  Update Qty
                </button>
                <button
                  onClick={() => { setBulkAction("update_category"); setBulkModal(true); }}
                  className="font-orbitron text-[9px] text-[#4a4a6a] hover:text-[#00ff88] bg-[#0d0d17] border border-[#1e1e2e] hover:border-[#00ff8840] px-2 py-1 clip-chamfer-sm transition-all"
                >
                  Set Category
                </button>
                <button
                  onClick={() => { setBulkAction("delete"); setBulkModal(true); }}
                  className="font-orbitron text-[9px] text-[#ff3366] bg-[#ff336610] border border-[#ff336630] hover:bg-[#ff336620] px-2 py-1 clip-chamfer-sm transition-all"
                >
                  Delete
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="text-[#2e2e4a] hover:text-[#ff3366]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="table-header w-10">
                  <button onClick={toggleSelectAll} className="text-[#2e2e4a] hover:text-[#00ff88] transition-colors">
                    {allSelected
                      ? <CheckSquare className="w-4 h-4 text-[#00ff88]" />
                      : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
                <th className="table-header w-10">IMG</th>
                <th className="table-header"><SortHeader field="product_name" label="Product" /></th>
                <th className="table-header hidden sm:table-cell"><SortHeader field="category" label="Category" /></th>
                <th className="table-header hidden md:table-cell"><SortHeader field="sku" label="SKU" /></th>
                <th className="table-header"><SortHeader field="quantity" label="Qty" /></th>
                <th className="table-header hidden lg:table-cell"><SortHeader field="price" label="Price" /></th>
                <th className="table-header hidden xl:table-cell"><SortHeader field="updated_at" label="Updated" /></th>
                <th className="table-header w-20">OPS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#0d0d17] animate-pulse">
                    <td className="table-cell"><div className="w-4 h-4 bg-[#0d0d17] rounded" /></td>
                    <td className="table-cell"><div className="w-8 h-8 bg-[#0d0d17] clip-chamfer-sm" /></td>
                    <td className="table-cell"><div className="h-4 bg-[#0d0d17] rounded w-40" /></td>
                    <td className="table-cell hidden sm:table-cell"><div className="h-4 bg-[#0a0a0f] rounded w-20" /></td>
                    <td className="table-cell hidden md:table-cell"><div className="h-4 bg-[#0a0a0f] rounded w-16" /></td>
                    <td className="table-cell"><div className="h-4 bg-[#0d0d17] rounded w-8" /></td>
                    <td className="table-cell hidden lg:table-cell"><div className="h-4 bg-[#0a0a0f] rounded w-12" /></td>
                    <td className="table-cell hidden xl:table-cell"><div className="h-4 bg-[#0a0a0f] rounded w-20" /></td>
                    <td className="table-cell"><div className="h-6 bg-[#0a0a0f] rounded w-12" /></td>
                  </tr>
                ))
              ) : data?.products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-[#1e1e2e]" />
                      <p className="font-orbitron text-xs text-[#2e2e4a] uppercase tracking-widest">No records found</p>
                      {(search || category) && (
                        <button
                          onClick={() => { setSearch(""); setCategory(""); }}
                          className="font-orbitron text-[9px] text-[#00ff88] hover:text-[#33ffaa] uppercase tracking-widest"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data?.products.map((product) => (
                  <AnimatePresence key={product.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "border-b border-[#0d0d17] hover:bg-[#00ff8804] transition-colors",
                        selectedIds.has(product.id) && "bg-[#00ff8808]"
                      )}
                    >
                      <td className="table-cell">
                        <button onClick={() => toggleSelect(product.id)} className="text-[#2e2e4a] hover:text-[#00ff88] transition-colors">
                          {selectedIds.has(product.id)
                            ? <CheckSquare className="w-4 h-4 text-[#00ff88]" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="table-cell">
                        {product.image_url ? (
                          <div
                            className="w-8 h-8 overflow-hidden flex-shrink-0 border border-[#00ff8820]"
                            style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }}
                          >
                            <img
                              src={product.image_url}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <CategoryIcon category={product.category} size="sm" />
                        )}
                      </td>
                      <td className="table-cell max-w-[180px]">
                        <div>
                          <Link
                            href={`/products/${product.id}`}
                            className="font-jetbrains text-[#c0c0d8] hover:text-[#00ff88] font-bold transition-colors text-sm line-clamp-1"
                          >
                            {product.product_name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                            <CategoryBadge category={product.category} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <CategoryBadge category={product.category} />
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="font-jetbrains text-xs text-[#4a4a6a]">{product.sku}</span>
                          {product.barcode && (
                            <button
                              onClick={() => setBarcodeModal(product)}
                              className="text-[#2e2e4a] hover:text-[#00d4ff] transition-colors"
                              title="View barcode"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "font-jetbrains text-sm font-bold",
                            product.quantity === 0   ? "text-[#ff3366]"  :
                            product.quantity <= 10   ? "text-[#cccc00]"  : "text-[#00ff88]"
                          )}>
                            {product.quantity}
                          </span>
                          <StockBadge quantity={product.quantity} />
                        </div>
                      </td>
                      <td className="table-cell hidden lg:table-cell font-jetbrains text-[#4a4a6a]">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="table-cell hidden xl:table-cell font-jetbrains text-[#2e2e4a] text-xs">
                        {formatDate(product.updated_at)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 text-[#2e2e4a] hover:text-[#00ff88] hover:bg-[#00ff8810] transition-colors clip-chamfer-sm"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 text-[#2e2e4a] hover:text-[#ff3366] hover:bg-[#ff336610] transition-colors clip-chamfer-sm"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  </AnimatePresence>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e1e2e]">
            <span className="font-jetbrains text-[10px] text-[#2e2e4a]">
              Page {data.page} of {data.totalPages} · {data.total} total
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-[#2e2e4a] hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00ff8810] clip-chamfer-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                const p = data.totalPages <= 5 ? i + 1 :
                  page <= 3 ? i + 1 :
                  page >= data.totalPages - 2 ? data.totalPages - 4 + i :
                  page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 font-orbitron text-[9px] clip-chamfer-sm transition-all",
                      page === p
                        ? "bg-[#00ff88] text-black font-black shadow-[0_0_10px_#00ff8860]"
                        : "text-[#4a4a6a] hover:text-[#00ff88] hover:bg-[#00ff8810]"
                    )}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-1.5 text-[#2e2e4a] hover:text-[#00ff88] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00ff8810] clip-chamfer-sm transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.product_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        isDanger
      />

      {/* Bulk action modal */}
      <Modal
        isOpen={bulkModal}
        onClose={() => { setBulkModal(false); setBulkAction(""); }}
        title={
          bulkAction === "delete" ? "Bulk Delete" :
          bulkAction === "update_quantity" ? "Update Quantities" :
          "Change Category"
        }
      >
        <div className="space-y-4">
          <p className="font-jetbrains text-[#4a4a6a] text-sm">
            Affects {selectedIds.size} selected product{selectedIds.size !== 1 ? "s" : ""}.
          </p>

          {bulkAction === "update_quantity" && (
            <div>
              <label className="label">New Quantity</label>
              <input
                type="number"
                min="0"
                value={bulkQuantity}
                onChange={e => setBulkQuantity(e.target.value)}
                className="input-field"
                placeholder="Enter quantity"
              />
            </div>
          )}

          {bulkAction === "update_category" && (
            <div>
              <label className="label">New Category</label>
              <select
                value={bulkCategory}
                onChange={e => setBulkCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {bulkAction === "delete" && (
            <p className="font-jetbrains text-[#ff3366] text-sm bg-[#ff336610] border border-[#ff336630] p-3 clip-chamfer-sm">
              ⚠ This will permanently delete {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}. Cannot be undone.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button onClick={() => { setBulkModal(false); setBulkAction(""); }} className="btn-secondary">Cancel</button>
            <button
              onClick={handleBulkAction}
              disabled={isBulkProcessing ||
                (bulkAction === "update_quantity" && !bulkQuantity) ||
                (bulkAction === "update_category" && !bulkCategory)
              }
              className={bulkAction === "delete" ? "btn-danger" : "btn-primary"}
            >
              {isBulkProcessing ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Barcode modal */}
      <Modal isOpen={!!barcodeModal} onClose={() => setBarcodeModal(null)} title="Barcode">
        {barcodeModal && (
          <div className="text-center space-y-3">
            <p className="font-orbitron text-[10px] font-black uppercase tracking-widest text-[#00ff88]">
              {barcodeModal.product_name}
            </p>
            <div className="bg-white p-4 inline-block clip-chamfer-sm">
              <p className="font-mono text-black text-xl font-bold tracking-widest">{barcodeModal.barcode}</p>
            </div>
            <p className="font-jetbrains text-[#2e2e4a] text-xs">ID: {barcodeModal.barcode}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
