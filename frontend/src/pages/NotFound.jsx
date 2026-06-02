import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/common/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative select-none">
      {/* Premium Floating Shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card-primary border border-border-soft p-8 sm:p-12 rounded-3xl shadow-premium z-10"
      >
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-2 bg-gradient-to-br from-primary to-primary-dark rounded-full shadow-premium flex items-center justify-center">
            <span className="text-4xl font-black text-white">404</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Sayfa Bulunamadı</h1>
          <p className="text-xs text-text-secondary font-semibold leading-relaxed">
            Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir. CVerse akışına geri dönerek keşfetmeye devam edebilirsiniz.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-xs font-bold px-6 py-2.5 rounded-2xl"
          >
            Geri Dön
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="text-xs font-bold px-6 py-2.5 rounded-2xl shadow-premium"
          >
            Ana Sayfa
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
