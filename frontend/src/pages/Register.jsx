import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // Sifre gucu hesaplama
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "Girilmedi", color: "bg-border-soft" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: "Çok Zayıf", color: "bg-rose-500" };
      case 2:
        return { score: 50, text: "Zayıf", color: "bg-amber-500" };
      case 3:
        return { score: 75, text: "Güçlü", color: "bg-blue-500" };
      case 4:
        return { score: 100, text: "Mükemmel", color: "bg-emerald-500" };
      default:
        return { score: 10, text: "Çok Zayıf", color: "bg-rose-500" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    const newErrors = {};

    if (!fullName) newErrors.fullName = "Ad Soyad alanı gereklidir.";
    
    if (!username) {
      newErrors.username = "Kullanıcı adı gereklidir.";
    } else if (username.length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır.";
    } else if (/\s/.test(username)) {
      newErrors.username = "Kullanıcı adı boşluk içeremez.";
    }

    if (!email) {
      newErrors.email = "E-posta adresi gereklidir.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Geçersiz e-posta formatı.";
    }

    if (!password) {
      newErrors.password = "Şifre alanı gereklidir.";
    } else if (password.length < 8) {
      newErrors.password = "Şifre en az 8 karakter olmalıdır.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Şifreler uyuşmuyor.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Gerçek API Kayıt İşlemi
    const result = await register(fullName, username, email, password);

    if (result.basarili) {
      setSuccessMessage("Hesabınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } else {
      if (result.hatalar && result.hatalar.length > 0) {
        setGeneralError(result.hatalar.join(" "));
      } else {
        setGeneralError(result.mesaj || "Kayıt işlemi başarısız.");
      }
    }
  };

  return (
    <AuthLayout subtitle="Kendi Kariyer Galaksini Oluştur" title="CVERSE">
      <div className="space-y-6">
        {/* Baslik */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hesap Oluştur
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Hemen ücretsiz kaydolun ve profesyonel kariyerinizi büyütün.
          </p>
        </div>

        {/* Hata Bildirimi */}
        {generalError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
            {generalError}
          </div>
        )}

        {/* Başarı Bildirimi */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            id="reg-fullName"
            label="Ad Soyad"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ayşe Yağmur Süzgün"
            error={errors.fullName}
            required
          />

          <Input
            id="reg-username"
            label="Kullanıcı Adı"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ayseyagmur"
            error={errors.username}
            required
          />

          <Input
            id="reg-email"
            label="E-posta Adresi"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ayseyagmur@gmail.com"
            error={errors.email}
            required
          />

          <Input
            id="reg-password"
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
            required
          />

          {/* Sifre Gucu Gostergesi */}
          {password && (
            <motion.div
              className="space-y-1.5 pt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Şifre Gücü:</span>
                <span
                  className={
                    strength.score <= 50
                      ? "text-amber-500"
                      : strength.score === 75
                      ? "text-blue-500"
                      : "text-emerald-500"
                  }
                >
                  {strength.text}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${strength.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${strength.score}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          <Input
            id="reg-confirmPassword"
            label="Şifre Tekrar"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.confirmPassword}
            required
          />

          {/* Kayit Ol Butonu */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            className="mt-6 py-3 rounded-2xl font-bold shadow-md shadow-primary/20"
          >
            Kayıt Ol
          </Button>
        </form>

        {/* Giris Yap Yonlendirme */}
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-100">
          Zaten bir hesabınız var mı?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:text-primary-dark font-bold transition-colors cursor-pointer"
          >
            Giriş Yapın
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
