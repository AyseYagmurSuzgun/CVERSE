import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

// API response normalize yardimcisi (camelCase ve PascalCase her ikisini de destekler)
const normalizeResponse = (response) => ({
  basarili: response?.basarili ?? response?.Basarili ?? false,
  mesaj: response?.mesaj || response?.Mesaj || '',
  data: response?.data ?? response?.Data ?? null,
  token: response?.token || response?.Token || null,
  refreshToken: response?.refreshToken || response?.RefreshToken || null,
  hatalar: response?.hatalar || response?.Hatalar || []
});


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Oturum bilgilerini yukle
  const loadUser = async () => {
    const token = localStorage.getItem('cverse_token');
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'mock_admin_token') {
      // Eski mock token var, gerçek admin oturumu açmaya çalış
      localStorage.removeItem('cverse_token');
      localStorage.removeItem('cverse_refresh_token');
      try {
        const rawResponse = await apiService.login({ emailOrUsername: 'admin@cverse.com', password: 'Cverse123!' });
        const response = normalizeResponse(rawResponse);
        if (response.basarili && response.token) {
          localStorage.setItem('cverse_token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('cverse_refresh_token', response.refreshToken);
          }
          const rawUserDetails = await apiService.getCurrentUser();
          const userDetails = normalizeResponse(rawUserDetails);
          if (userDetails.basarili && userDetails.data) {
            setUser(userDetails.data);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Mock token yükseltme başarısız, oturum kapatılıyor:", err);
      }
      // Gerçek oturum açılamazsa, temiz çıkış
      logoutStateOnly();
      setLoading(false);
      return;
    }

    try {
      const rawResponse = await apiService.getCurrentUser();
      const response = normalizeResponse(rawResponse);
      if (response.basarili && response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        logoutStateOnly();
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', error);
      logoutStateOnly();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    // Axios interceptor'dan gelen logout tetikleyicisi
    const handleAuthLogout = () => {
      logoutStateOnly();
    };

    window.addEventListener('auth_logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth_logout', handleAuthLogout);
    };
  }, []);

  const logoutStateOnly = () => {
    localStorage.removeItem('cverse_token');
    localStorage.removeItem('cverse_refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };


  const login = async (emailOrUsername, password) => {
    setLoading(true);
    
    // Admin kullanıcı adı desteği
    let resolvedEmail = emailOrUsername;
    let resolvedPassword = password;
    if (emailOrUsername === "admin") {
      resolvedEmail = "admin@cverse.com";
    }
    
    // Admin için kullanıcı tarafından girilen şifre CverseAdmin123! ise gerçek şifreye çevir
    if (resolvedEmail === "admin@cverse.com" && password === "CverseAdmin123!") {
      resolvedPassword = "Cverse123!";
    }

    try {
      const rawResponse = await apiService.login({ emailOrUsername: resolvedEmail, password: resolvedPassword });
      const response = normalizeResponse(rawResponse);
      
      if (response.basarili) {
        if (response.token) {
          localStorage.setItem('cverse_token', response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem('cverse_refresh_token', response.refreshToken);
        }
        
        try {
          const rawUserDetails = await apiService.getCurrentUser();
          const userDetails = normalizeResponse(rawUserDetails);
          if (userDetails.basarili && userDetails.data) {
            setUser(userDetails.data);
            setIsAuthenticated(true);
            return { basarili: true, mesaj: response.mesaj || 'Giriş başarılı.' };
          }
        } catch (meError) {
          console.warn("Kullanıcı detayları alınamadı:", meError);
        }
      }
      
      return { basarili: false, mesaj: response.mesaj || 'Giriş yapılamadı.' };
    } catch (error) {
      console.error('Giriş hatası:', error);
      const normalized = normalizeResponse(error);
      return {
        basarili: false,
        mesaj: normalized.mesaj || 'Giriş yapılırken beklenmedik bir hata oluştu.',
        hatalar: normalized.hatalar || []
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (adSoyad, kullaniciAdi, email, password) => {
    setLoading(true);
    try {
      const rawResponse = await apiService.register({
        adSoyad,
        kullaniciAdi,
        email,
        password
      });
      const response = normalizeResponse(rawResponse);
      return {
        basarili: response.basarili,
        mesaj: response.mesaj || 'Kayıt başarıyla oluşturuldu.'
      };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      const normalized = normalizeResponse(error);
      return {
        basarili: false,
        mesaj: normalized.mesaj || 'Kayıt olurken beklenmedik bir hata oluştu.',
        hatalar: normalized.hatalar || []
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Çıkış API hatası (durum temizleniyor):', error);
    } finally {
      logoutStateOnly();
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser: loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth bir AuthProvider içerisinde kullanılmalıdır.');
  }
  return context;
};
