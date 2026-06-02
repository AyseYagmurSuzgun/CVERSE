import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import { staggerContainer, slideUp } from "../animations";
import { useSignalR } from "../context/SignalRContext";
import { apiService } from "../services/api";

const Settings = () => {
  const { addToast } = useSignalR();

  // Theme State
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("cverse_theme") === "dark"
  );

  // Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Account Deletion States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cverse_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleThemeChange = (isDark) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("cverse_theme", "dark");
      if (addToast) addToast("Karanlık tema aktif edildi!", "success");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("cverse_theme", "light");
      if (addToast) addToast("Açık tema aktif edildi!", "success");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (addToast) addToast("Lütfen tüm şifre alanlarını doldurun.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      if (addToast) addToast("Yeni şifreler eşleşmiyor.", "warning");
      return;
    }
    if (newPassword.length < 6) {
      if (addToast) addToast("Şifre en az 6 karakter olmalıdır.", "warning");
      return;
    }

    setSubmittingPassword(true);
    try {
      // Call actual backend API
      const response = await apiService.changePassword(currentPassword, newPassword);
      
      if (addToast) addToast(response.mesaj || "Şifreniz başarıyla değiştirildi!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      const errMsg = err.mesaj || err.Message || "Şifre değiştirilirken bir hata oluştu. Lütfen mevcut şifrenizi kontrol edin.";
      if (addToast) addToast(errMsg, "error");
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      // Call actual backend API
      await apiService.deleteAccount();
      
      if (addToast) addToast("Hesabınız kalıcı olarak silindi. Hoşçakalın... 👋", "success");
      
      // Clear token and localstorage
      localStorage.removeItem("cverse_token");
      localStorage.removeItem("cverse_refresh_token");
      localStorage.removeItem("cverse_user");
      
      // Close modal
      setIsDeleteModalOpen(false);

      // Dispatch logout event to update React state across application
      window.dispatchEvent(new Event("auth_logout"));
    } catch (err) {
      console.error(err);
      const errMsg = err.mesaj || err.Message || "Hesap silinirken bir hata oluştu.";
      if (addToast) addToast(errMsg, "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8 select-none font-sans"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Üst Başlık */}
      <motion.div variants={slideUp}>
        <Card 
          variant="primary"
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6"
          animate={false}
        >
          <div>
            <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
              Ayarlar
              <span className="text-[10px] tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black border border-primary/20">
                Profil & Tercihler
              </span>
            </h1>
            <p className="text-xs text-text-secondary mt-1 font-semibold">CVerse hesap ayarlarınızı, gizliliğinizi ve tema tercihlerinizi buradan yönetin.</p>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SOL BÖLGE: Tema ve Tehlikeli Bölge */}
        <div className="md:col-span-5 space-y-6">
          {/* Tema Seçimi */}
          <motion.div variants={slideUp}>
            <Card variant="primary" className="p-6 space-y-4">
              <h3 className="text-sm font-black text-text-primary tracking-tight uppercase border-b border-border-soft pb-2">Görünüm Ayarları</h3>
              
              <div className="space-y-3 pt-1">
                <span className="text-xs text-text-secondary font-extrabold uppercase tracking-wider block">Tema Seçimi</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleThemeChange(false)}
                    className={`p-4 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${
                      !darkMode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border-soft bg-transparent text-text-secondary hover:bg-card-primary"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Açık Tema</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange(true)}
                    className={`p-4 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${
                      darkMode
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                        : "border-border-soft bg-transparent text-text-secondary hover:bg-card-primary"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646" />
                    </svg>
                    <span>Karanlık Tema</span>
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tehlikeli Bölge */}
          <motion.div variants={slideUp}>
            <Card variant="primary" className="p-6 bg-red-500/5 border border-red-500/20 dark:border-red-500/30 space-y-4" animate={true}>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 tracking-tight uppercase border-b border-red-500/10 pb-2">Tehlikeli Bölge</h3>
              
              <div className="space-y-4 pt-1">
                <div>
                  <span className="text-xs font-black text-text-primary block">Hesabı Kalıcı Olarak Sil</span>
                  <span className="text-[10px] text-text-secondary font-semibold block mt-0.5">
                    Bu işlem geri alınamaz. CV'leriniz, profil verileriniz ve tüm etkileşimleriniz kalıcı olarak silinecektir.
                  </span>
                </div>
                
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full text-xs font-black rounded-xl py-2.5"
                >
                  Hesabımı Sil
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* SAĞ BÖLGE: Şifre Değiştirme */}
        <div className="md:col-span-7 space-y-6">
          {/* Şifre Değiştir */}
          <motion.div variants={slideUp}>
            <Card variant="secondary" className="p-6 space-y-4">
              <h3 className="text-sm font-black text-text-primary tracking-tight uppercase border-b border-border-soft pb-2">Şifre Değiştir</h3>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
                <Input
                  label="Mevcut Şifre"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Yeni Şifre"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Yeni Şifre (Tekrar)"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submittingPassword}
                    className="text-xs font-black px-6 py-2.5 rounded-2xl shadow-md shadow-primary/20"
                  >
                    {submittingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* HESAP SİLME ONAY MODALİ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hesabınızı Silmek İstediğinize Emin Misiniz?"
        size="md"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingAccount}
              className="text-xs font-black py-2 px-4 rounded-xl"
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deletingAccount}
              className="text-xs font-black py-2 px-4 rounded-xl"
            >
              Evet, Kalıcı Olarak Sil
            </Button>
          </div>
        }
      >
        <div className="space-y-3 font-sans text-left">
          <p className="text-sm text-white font-semibold leading-relaxed">
            Hesabınızı sildiğinizde, CVerse üzerindeki tüm verileriniz (profil bilgileriniz, özgeçmiş analiz geçmişiniz, başvurularınız ve mesajlarınız) sistemimizden <strong className="text-white underline">tamamen ve kalıcı olarak temizlenecektir.</strong>
          </p>
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5">
            <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[11px] text-rose-700 dark:text-rose-400 font-extrabold leading-snug">
              Bu işlem hiçbir şekilde geri alınamaz. Devam etmek istediğinizi onaylıyor musunuz?
            </span>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Settings;
