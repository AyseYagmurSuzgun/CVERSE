import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;
    
    setIsSubmitting(true);
    
    // Save message to LocalStorage
    const currentMsgs = JSON.parse(localStorage.getItem("cverse_contact_messages") || "[]");
    const newMsg = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      time: new Date().toLocaleString("tr-TR"),
      isRead: false
    };
    localStorage.setItem("cverse_contact_messages", JSON.stringify([newMsg, ...currentMsgs]));

    // Simulate API Submission success trigger
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E1F0FA] via-[#B9DCF4] to-[#E1F0FA] py-8 px-4 sm:px-8 flex flex-col items-center select-none overflow-y-auto">
      {/* Floating Header */}
      <div className="w-full max-w-2xl flex items-center justify-between py-4 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-sky-100/40 dark:border-slate-800/40 shadow-sm mb-8 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-sky-100 dark:border-slate-800 shrink-0">
            <img src="/weblogo.png" alt="Cverse Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <span className="text-base font-extrabold tracking-wider text-slate-800 dark:text-white">CVERSE</span>
        </div>
        <Link to="/login">
          <Button variant="primary" className="text-xs font-bold bg-primary hover:bg-primary/95 text-white py-2.5 px-6 !rounded-xl shadow-md shadow-primary/10">
            Giriş Yap
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-2xl space-y-8 relative z-10">

        {/* Feedback Input Form Box */}
        <Card variant="default" className="p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-700 dark:text-sky-400 mb-6 border-b border-sky-100/50 dark:border-slate-800/40 pb-3.5">
            Destek ve İletişim Formu
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Adınız Soyadınız</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Ayşe Yılmaz"
                  className="w-full px-4 py-3 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder-slate-400 font-medium"
                />
              </div>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">E-Posta Adresiniz</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Örn: ayse@cverse.com"
                  className="w-full px-4 py-3 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Konu Başlığı</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Örn: Özgeçmiş Analizi hakkında teknik destek"
                className="w-full px-4 py-3 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder-slate-400 font-medium"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Mesajınız</label>
              <textarea
                required
                rows="4"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Sorunuzu, önerinizi veya şikayetinizi buraya yazın..."
                className="w-full px-4 py-3 bg-white/80 dark:bg-[#1C2541] border border-blue-200/50 dark:border-[#3A506B]/45 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white placeholder-slate-400 font-medium resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold !rounded-2xl py-3 shadow-lg shadow-primary/20"
              >
                {isSubmitting ? "Gönderiliyor..." : "Mesajı Gönder"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#EDF5FF] dark:bg-[#1C2541] rounded-3xl border border-sky-200 dark:border-slate-800 p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Mesajınız Alındı!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-2 font-semibold leading-relaxed">
                Geri bildiriminiz başarıyla iletildi. Ekibimiz en kısa sürede e-posta adresiniz üzerinden geri dönüş sağlayacaktır. Teşekkür ederiz!
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-primary text-white font-bold !rounded-2xl py-2.5"
                >
                  Kapat
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contact;
