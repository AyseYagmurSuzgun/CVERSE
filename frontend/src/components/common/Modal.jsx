import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}) => {
  // Modal acildiginda body scroll'unu kilitleme
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full m-4 h-[calc(100vh-2rem)]",
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { type: "spring", duration: 0.5, bounce: 0.15 } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10, 
      transition: { duration: 0.2, ease: "easeIn" } 
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Arka Plan (Overlay) */}
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Modal Penceresi */}
          <motion.div
            className={`relative w-full ${sizeClasses[size]} bg-card text-text-primary rounded-3xl shadow-premium border border-border-soft overflow-hidden flex flex-col z-10 glassmorphism`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            {/* Ust Alan (Header) */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft">
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                {title}
              </h3>
              <Button
                variant="ghost"
                className="!p-2 rounded-full hover:bg-card-primary text-text-secondary hover:text-text-primary transition-colors"
                onClick={onClose}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Govde (Body) */}
            <div className="px-6 py-5 overflow-y-auto max-h-[70vh] text-text-secondary flex-1">
              {children}
            </div>

            {/* Alt Alan (Footer) */}
            {footer && (
              <div className="px-6 py-4 bg-card-primary/80 border-t border-border-soft flex items-center justify-end space-x-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

