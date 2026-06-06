"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={`relative w-full ${maxWidth} bg-[#0d0d17] border border-[#00ff8830] shadow-[0_0_30px_#00ff8815]`}
            style={{
              clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,136,0.012) 3px, rgba(0,255,136,0.012) 4px)",
              }}
            />

            {title && (
              <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-[#00ff8820]">
                <h2 className="font-orbitron text-sm font-black uppercase tracking-wider text-[#00ff88]">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-[#2e2e4a] hover:text-[#00ff88] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="relative z-10 p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  isDanger?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  isLoading = false,
  isDanger = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="font-jetbrains text-[#4a4a6a] text-sm mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={isDanger ? "btn-danger" : "btn-primary"}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}
