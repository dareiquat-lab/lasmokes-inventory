"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  category?: string;
}

// Resize + compress to max 600px wide/tall, JPEG 82% — keeps files under ~80KB
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;

        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ currentImageUrl, onImageChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10MB.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: compressed, mimeType: "image/jpeg" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await res.json();
      setPreview(url);
      onImageChange(url);
    } catch (err) {
      setPreview(currentImageUrl || null);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [currentImageUrl, onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="label">Product Image</label>

      {preview ? (
        <div
          className="relative w-full aspect-square max-w-[200px] overflow-hidden rounded-xl bg-[var(--background)] group"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Product" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-[var(--background)/70] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--border-shadow)] border-t-[#ff4757] rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[var(--background)] p-2 text-[var(--text-muted)] hover:text-[#ff4757] transition-colors rounded-lg"
              style={{ boxShadow: "var(--shadow-sm)" }}
              title="Replace image"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-[var(--background)] p-2 text-[#c0392b] hover:text-[#e74c3c] transition-colors rounded-lg"
              style={{ boxShadow: "var(--shadow-sm)" }}
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full aspect-square max-w-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
            isDragging
              ? "border-[#ff4757] bg-[#ff475710]"
              : "border-[var(--border-shadow)] bg-[var(--background)] hover:border-[#ff475750] hover:bg-[#ff475706]"
          )}
          style={{ boxShadow: "var(--shadow-recessed)" }}
        >
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-[var(--border-shadow)] border-t-[#ff4757] rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--text-dim)]" />
              <div className="text-center">
                <p className="font-jetbrains text-[10px] text-[var(--text-muted)]">Drop image here</p>
                <p className="font-jetbrains text-[9px] text-[var(--text-dim)] mt-0.5">or click to browse</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <div className="flex items-center gap-1.5 font-jetbrains text-[#c0392b] text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="font-jetbrains text-[9px] text-[var(--text-dim)]">
        JPEG · PNG · WebP · GIF — auto-compressed
      </p>
    </div>
  );
}
