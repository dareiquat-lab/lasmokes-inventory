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
  MoreHorizontal,
  Barcode,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBadge, StockBadge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ConfirmModal, Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import type { Product } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";

interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField = "product_name" | "category" | "sku" | "quantity" | "price" | "updated_at";

export function InventoryClient() {
  const router = useRouter();
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

      if (bulkAction === "update_quantity") {
        body.data = { quantity: parseInt(bulkQuantity) };
      } else if (bulkAction === "update_category") {
        body.data = { category: bulkCategory };
      }

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
    if (sortBy !== field) return <ChevronUp className="w-3 h-3 text-gray-600" />;
    return sortOrder === "asc"
      ? <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-emerald-400" />;
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, barcode..."
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
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
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>
          <a href="/api/export?format=csv" className="btn-secondary flex items-center gap-1.5">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {data.total.toLocaleString()} product{data.total !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {category && ` in ${category}`}
          </span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setBulkAction("update_quantity"); setBulkModal(true); }}
                  className="text-xs text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-2 py-1"
                >
                  Update Qty
                </button>
                <button
                  onClick={() => { setBulkAction("update_category"); setBulkModal(true); }}
                  className="text-xs text-gray-400 hover:text-white bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-2 py-1"
                >
                  Set Category
                </button>
                <button
                  onClick={() => { setBulkAction("delete"); setBulkModal(true); }}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-500/5 border border-red-500/20 rounded-md px-2 py-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-gray-500 hover:text-white"
                >
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
              <tr className="border-b border-[#1f1f1f]">
                <th className="table-header w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-white">
                    {allSelected
                      ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                      : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
                <th className="table-header w-10">Image</th>
                <th className="table-header">
                  <SortHeader field="product_name" label="Product" />
                </th>
                <th className="table-header hidden sm:table-cell">
                  <SortHeader field="category" label="Category" />
                </th>
                <th className="table-header hidden md:table-cell">
                  <SortHeader field="sku" label="SKU" />
                </th>
                <th className="table-header">
                  <SortHeader field="quantity" label="Qty" />
                </th>
                <th className="table-header hidden lg:table-cell">
                  <SortHeader field="price" label="Price" />
                </th>
                <th className="table-header hidden xl:table-cell">
                  <SortHeader field="updated_at" label="Updated" />
                </th>
                <th className="table-header w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1a1a1a] animate-pulse">
                    <td className="table-cell"><div className="w-4 h-4 bg-[#222] rounded" /></td>
                    <td className="table-cell"><div className="w-8 h-8 bg-[#222] rounded-lg" /></td>
                    <td className="table-cell"><div className="h-4 bg-[#222] rounded w-40" /></td>
                    <td className="table-cell hidden sm:table-cell"><div className="h-4 bg-[#1a1a1a] rounded w-20" /></td>
                    <td className="table-cell hidden md:table-cell"><div className="h-4 bg-[#1a1a1a] rounded w-16" /></td>
                    <td className="table-cell"><div className="h-4 bg-[#222] rounded w-8" /></td>
                    <td className="table-cell hidden lg:table-cell"><div className="h-4 bg-[#1a1a1a] rounded w-12" /></td>
                    <td className="table-cell hidden xl:table-cell"><div className="h-4 bg-[#1a1a1a] rounded w-20" /></td>
                    <td className="table-cell"><div className="h-6 bg-[#1a1a1a] rounded w-12" /></td>
                  </tr>
                ))
              ) : data?.products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-500 py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-600" />
                      <p>No products found</p>
                      {(search || category) && (
                        <button
                          onClick={() => { setSearch(""); setCategory(""); }}
                          className="text-emerald-400 hover:text-emerald-300 text-xs"
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
                        "border-b border-[#1a1a1a] hover:bg-[#151515] transition-colors",
                        selectedIds.has(product.id) && "bg-emerald-500/5"
                      )}
                    >
                      <td className="table-cell">
                        <button onClick={() => toggleSelect(product.id)} className="text-gray-500 hover:text-white">
                          {selectedIds.has(product.id)
                            ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                            : <Square className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="table-cell">
                        {product.image_url ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[#2a2a2a]">
                            <Image
                              src={product.image_url}
                              alt={product.product_name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <CategoryIcon category={product.category} size="sm" />
                        )}
                      </td>
                      <td className="table-cell max-w-[180px]">
                        <div>
                          <Link href={`/products/${product.id}`} className="text-white hover:text-emerald-400 font-medium transition-colors text-sm line-clamp-1">
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
                          <span className="font-mono text-xs text-gray-400">{product.sku}</span>
                          {product.barcode && (
                            <button
                              onClick={() => setBarcodeModal(product)}
                              className="text-gray-600 hover:text-gray-400"
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
                            "text-sm font-semibold",
                            product.quantity === 0 ? "text-red-400" :
                            product.quantity <= 10 ? "text-amber-400" : "text-white"
                          )}>
                            {product.quantity}
                          </span>
                          <StockBadge quantity={product.quantity} />
                        </div>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-gray-300">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="table-cell hidden xl:table-cell text-gray-500 text-xs">
                        {formatDate(product.updated_at)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#222] rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1f1f1f]">
            <span className="text-xs text-gray-500">
              Page {data.page} of {data.totalPages} · {data.total} total
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] rounded-md transition-colors"
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
                      "w-7 h-7 text-xs rounded-md transition-colors",
                      page === p
                        ? "bg-emerald-500 text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
                    )}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-1.5 text-gray-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a1a1a] rounded-md transition-colors"
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
        confirmLabel="Delete Product"
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
          <p className="text-gray-400 text-sm">
            This will affect {selectedIds.size} selected product{selectedIds.size !== 1 ? "s" : ""}.
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
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              ⚠️ This will permanently delete {selectedIds.size} product{selectedIds.size !== 1 ? "s" : ""}. This cannot be undone.
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
      <Modal
        isOpen={!!barcodeModal}
        onClose={() => setBarcodeModal(null)}
        title="Barcode"
      >
        {barcodeModal && (
          <div className="text-center space-y-3">
            <p className="text-white font-medium">{barcodeModal.product_name}</p>
            <div className="bg-white rounded-lg p-4 inline-block">
              <p className="font-mono text-black text-xl font-bold tracking-widest">{barcodeModal.barcode}</p>
            </div>
            <p className="text-gray-500 text-xs">Barcode: {barcodeModal.barcode}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
