import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    const newErrors = {};

    if (!emailOrUsername) {
      newErrors.emailOrUsername = "E-posta veya kullanıcı adı gereklidir.";
    }

    if (!password) {
      newErrors.password = "Şifre alanı gereklidir.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Gerçek API Giriş İşlemi
    const result = await login(emailOrUsername, password);
    
    if (result.basarili) {
      navigate("/");
    } else {
      if (result.hatalar && result.hatalar.length > 0) {
        setGeneralError(result.hatalar.join(" "));
      } else {
        setGeneralError(result.mesaj || "Giriş yapılırken bir hata oluştu.");
      }
    }
  };

  return (
    <AuthLayout 
      title="CVERSE" 
      subtitle="Kendi Kariyer Galaksini Oluştur"
    >
      <div className="space-y-6">
        {/* Baslik (Kutu içi küçük selamlama) */}
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hoş Geldiniz
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Hesabınıza giriş yaparak Cverse dünyasına adım atın.
          </p>
        </div>

        {/* Genel Hata Mesajı */}
        {generalError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium animate-fadeIn">
            {generalError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            id="login-identity"
            label="E-posta veya Kullanıcı Adı"
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            placeholder="kullaniciadi veya email"
            error={errors.emailOrUsername}
            required
          />

          <Input
            id="login-password"
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
            required
          />

          {/* Beni Hatirla & Sifremi Unuttum */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <label className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-200"
              />
              <span>Beni Hatırla</span>
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => e.preventDefault()}
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Şifremi Unuttum
            </a>
          </div>

          {/* Giris Yap Butonu */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            className="mt-6 py-3 rounded-2xl font-bold shadow-md shadow-primary/20"
          >
            Giriş Yap
          </Button>
        </form>

        {/* Kayit Ol Yonlendirme */}
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-100">
          Henüz bir hesabınız yok mu?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary hover:text-primary-dark font-bold transition-colors cursor-pointer"
          >
            Kayıt Olun
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;