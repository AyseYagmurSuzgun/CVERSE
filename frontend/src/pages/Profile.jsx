import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/common/Avatar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import { staggerContainer, slideUp } from "../animations";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";

// Tarih Dönemi Formatlayıcı Helper (Türkçe Ay ve Yıl)
const formatPeriod = (startDateStr, endDateStr, continues = false) => {
  if (!startDateStr) return "";
  
  const parseDate = (str) => {
    if (!str) return null;
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const formatMonthYear = (d) => {
    if (!d) return "";
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const startFormatted = start ? formatMonthYear(start) : "";
  let endFormatted = "";

  if (continues) {
    endFormatted = "Hâlâ";
  } else if (end) {
    endFormatted = formatMonthYear(end);
  } else {
    endFormatted = "Hâlâ";
  }

  return startFormatted ? `${startFormatted} - ${endFormatted}` : "";
};

// URL Formatlayıcı Helper (Local fallback ve Cloudinary uyumlu)
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = "http://localhost:5145";
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

// Tarih formatını YYYY-MM-DD input uyumlu yapma helper
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

// Dış bağlantı (URL) formatlayıcı Helper (protokol ekler)
const formatExternalUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
};

// Normalize API response (backend camelCase/PascalCase güvenli)
const normalizeResponse = (response) => ({
  basarili: response?.basarili ?? response?.Basarili ?? false,
  mesaj: response?.mesaj || response?.Mesaj || "",
  data: response?.data ?? response?.Data ?? response?.veri ?? null,
  hatalar: response?.hatalar || response?.Hatalar || []
});

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { userId } = useParams();

  const isOwnProfile = !userId || String(userId).toLowerCase() === String(user?.id || user?.Id).toLowerCase();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [uploadProgress, setUploadProgress] = useState({ profile: 0, cover: 0 });
  const [isDragging, setIsDragging] = useState({ profile: false, cover: false });
  // profileVersion, profil fotoğrafı yüklendikten sonra img'yi force rerender etmek için
  const [profileVersion, setProfileVersion] = useState(0);

  // Modalların Açıklık States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [activeEducation, setActiveEducation] = useState(null);

  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState(null);

  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    adSoyad: "",
    unvan: "",
    konum: "",
    bio: "",
    linkedInUrl: "",
    gitHubUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    kapakFotografiUrl: ""
  });

  const [educationForm, setEducationForm] = useState({
    okulAdi: "",
    bolum: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    aciklama: "",
    devamEdiyor: false
  });

  const [experienceForm, setExperienceForm] = useState({
    sirketAdi: "",
    unvan: "",
    konum: "",
    baslangicTarihi: "",
    bitisTarihi: "",
    suAnBuradaCalisiyorum: false,
    aciklama: ""
  });

  const [certificateForm, setCertificateForm] = useState({
    sertifikaAdi: "",
    verenKurum: "",
    verilisTarihi: "",
    sertifikaUrl: "",
    sertifikaId: ""
  });

  const [newSkill, setNewSkill] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Toast Mesajı Gösterme
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 4000);
  };

  // Profil Verilerini Getir
  const fetchProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const rawResponse = userId 
        ? await apiService.getProfileById(userId) 
        : await apiService.getProfile();
      const response = normalizeResponse(rawResponse);
      
      if (response.basarili && response.data) {
        setProfile(response.data);
        setError("");
      } else {
        setError(response.mesaj || "Profil getirilemedi.");
      }
    } catch (err) {
      console.error("Profil fetch hatası:", err);
      const normalized = normalizeResponse(err);
      setError(normalized.mesaj || "Ağ hatası veya profil yükleme problemi.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // Sürükle Bırak İşleyicileri
  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [type]: false }));
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file, type);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      await uploadFile(file, type);
    }
  };

  // Dosya Yükleme Servis Çağrısı
  const uploadFile = async (file, type) => {
    if (!file.type.startsWith("image/")) {
      showToast("error", "Lütfen yalnızca resim dosyası yükleyin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Görsel boyutu maksimum 5MB olmalıdır.");
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [type]: 1 }));
      const onProgress = (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [type]: percent }));
      };

      let rawResponse;
      if (type === "profile") {
        rawResponse = await apiService.uploadProfilePhoto(file, onProgress);
      } else {
        rawResponse = await apiService.uploadCoverPhoto(file, onProgress);
      }

      const response = normalizeResponse(rawResponse);

      if (response.basarili) {
        showToast("success", response.mesaj || "Görsel başarıyla güncellendi.");
        // Fotoğraf yüklendikten sonra profili yenile ve version'ı artır (force rerender)
        await fetchProfile(true);
        setProfileVersion(prev => prev + 1);
        refreshUser();
      } else {
        showToast("error", response.mesaj || "Yükleme başarısız.");
      }
    } catch (err) {
      console.error(`${type} yükleme hatası:`, err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    }
  };

  // --- CRUD Modalları Açma İşlemleri ---
  const handleOpenProfileEdit = () => {
    setProfileForm({
      adSoyad: profile?.adSoyad || profile?.AdSoyad || "",
      unvan: profile?.unvan || profile?.Unvan || "",
      konum: profile?.konum || profile?.Konum || "",
      bio: profile?.bio || profile?.Bio || "",
      linkedInUrl: profile?.linkedInUrl || profile?.LinkedInUrl || "",
      gitHubUrl: profile?.gitHubUrl || profile?.GitHubUrl || "",
      twitterUrl: profile?.twitterUrl || profile?.TwitterUrl || "",
      websiteUrl: profile?.websiteUrl || profile?.WebsiteUrl || "",
      kapakFotografiUrl: profile?.kapakFotografiUrl || profile?.KapakFotografiUrl || ""
    });
    setFormErrors({});
    setIsProfileModalOpen(true);
  };

  const handleOpenEducationModal = (edu = null) => {
    if (edu) {
      setActiveEducation(edu);
      setEducationForm({
        okulAdi: edu.okulAdi || edu.OkulAdi || "",
        bolum: edu.bolum || edu.Bolum || "",
        baslangicTarihi: toInputDate(edu.baslangicTarihi || edu.BaslangicTarihi) || "",
        bitisTarihi: (edu.bitisTarihi || edu.BitisTarihi) ? toInputDate(edu.bitisTarihi || edu.BitisTarihi) : "",
        devamEdiyor: !(edu.bitisTarihi || edu.BitisTarihi),
        aciklama: edu.aciklama || edu.Aciklama || ""
      });
    } else {
      setActiveEducation(null);
      setEducationForm({
        okulAdi: "",
        bolum: "",
        baslangicTarihi: "",
        bitisTarihi: "",
        aciklama: "",
        devamEdiyor: false
      });
    }
    setFormErrors({});
    setIsEducationModalOpen(true);
  };

  const handleOpenExperienceModal = (exp = null) => {
    if (exp) {
      setActiveExperience(exp);
      setExperienceForm({
        sirketAdi: exp.sirketAdi || exp.SirketAdi || "",
        unvan: exp.unvan || exp.Unvan || "",
        konum: exp.konum || exp.Konum || "",
        baslangicTarihi: toInputDate(exp.baslangicTarihi || exp.BaslangicTarihi) || "",
        bitisTarihi: (exp.bitisTarihi || exp.BitisTarihi) ? toInputDate(exp.bitisTarihi || exp.BitisTarihi) : "",
        suAnBuradaCalisiyorum: exp.suAnBuradaCalisiyorum || exp.SuAnBuradaCalisiyorum || false,
        aciklama: exp.aciklama || exp.Aciklama || ""
      });
    } else {
      setActiveExperience(null);
      setExperienceForm({
        sirketAdi: "",
        unvan: "",
        konum: "",
        baslangicTarihi: "",
        bitisTarihi: "",
        suAnBuradaCalisiyorum: false,
        aciklama: ""
      });
    }
    setFormErrors({});
    setIsExperienceModalOpen(true);
  };

  const handleOpenCertificateModal = (cert = null) => {
    if (cert) {
      setActiveCertificate(cert);
      setCertificateForm({
        sertifikaAdi: cert.sertifikaAdi || cert.SertifikaAdi || "",
        verenKurum: cert.verenKurum || cert.VerenKurum || "",
        verilisTarihi: toInputDate(cert.verilisTarihi || cert.VerilisTarihi) || "",
        sertifikaUrl: cert.sertifikaUrl || cert.SertifikaUrl || "",
        sertifikaId: cert.sertifikaId || cert.SertifikaId || ""
      });
    } else {
      setActiveCertificate(null);
      setCertificateForm({
        sertifikaAdi: "",
        verenKurum: "",
        verilisTarihi: "",
        sertifikaUrl: "",
        sertifikaId: ""
      });
    }
    setFormErrors({});
    setIsCertificateModalOpen(true);
  };

  // --- CRUD Kaydet/Gönder İşlemleri ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.adSoyad.trim()) {
      setFormErrors({ adSoyad: "Ad Soyad alanı zorunludur." });
      return;
    }

    try {
      const rawResponse = await apiService.updateProfile(profileForm);
      const response = normalizeResponse(rawResponse);

      if (response.basarili) {
        showToast("success", "Profil bilgileri başarıyla güncellendi.");
        setIsProfileModalOpen(false);
        await fetchProfile(true);
        setProfileVersion(prev => prev + 1);
        refreshUser();
      } else {
        showToast("error", response.mesaj || "Güncelleme başarısız oldu.");
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || normalized.hatalar?.[0] || "Güncelleme sırasında bir hata oluştu.");
    }
  };

  const handleSaveEducation = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!educationForm.okulAdi.trim()) errors.okulAdi = "Okul adı zorunludur.";
    if (!educationForm.bolum.trim()) errors.bolum = "Bölüm alanı zorunludur.";
    if (!educationForm.baslangicTarihi) errors.baslangicTarihi = "Başlangıç tarihi zorunludur.";
    
    if (educationForm.baslangicTarihi && educationForm.bitisTarihi && !educationForm.devamEdiyor) {
      if (new Date(educationForm.bitisTarihi) < new Date(educationForm.baslangicTarihi)) {
        errors.bitisTarihi = "Bitiş tarihi başlangıç tarihinden önce olamaz.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...educationForm,
      bitisTarihi: educationForm.devamEdiyor ? null : educationForm.bitisTarihi
    };

    try {
      let rawResponse;
      if (activeEducation) {
        rawResponse = await apiService.updateEducation(activeEducation.id || activeEducation.Id, payload);
      } else {
        rawResponse = await apiService.addEducation(payload);
      }

      const response = normalizeResponse(rawResponse);

      if (response.basarili) {
        showToast("success", activeEducation ? "Eğitim bilgisi güncellendi." : "Eğitim bilgisi başarıyla eklendi.");
        setIsEducationModalOpen(false);
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "İşlem başarısız.");
      }
    } catch (err) {
      console.error("Eğitim CRUD hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Eğitim kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteEducation = async (id) => {
    if (!window.confirm("Bu eğitim bilgisini silmek istediğinize emin misiniz?")) return;
    try {
      const rawResponse = await apiService.deleteEducation(id);
      const response = normalizeResponse(rawResponse);
      if (response.basarili) {
        showToast("success", "Eğitim bilgisi silindi.");
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Eğitim silme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Eğitim silinirken bir hata oluştu.");
    }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!experienceForm.sirketAdi.trim()) errors.sirketAdi = "Şirket adı zorunludur.";
    if (!experienceForm.unvan.trim()) errors.unvan = "Ünvan/Rol zorunludur.";
    if (!experienceForm.baslangicTarihi) errors.baslangicTarihi = "Başlangıç tarihi zorunludur.";
    
    if (experienceForm.baslangicTarihi && experienceForm.bitisTarihi && !experienceForm.suAnBuradaCalisiyorum) {
      if (new Date(experienceForm.bitisTarihi) < new Date(experienceForm.baslangicTarihi)) {
        errors.bitisTarihi = "Bitiş tarihi başlangıç tarihinden önce olamaz.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...experienceForm,
      bitisTarihi: experienceForm.suAnBuradaCalisiyorum ? null : experienceForm.bitisTarihi
    };

    try {
      let rawResponse;
      if (activeExperience) {
        rawResponse = await apiService.updateExperience(activeExperience.id || activeExperience.Id, payload);
      } else {
        rawResponse = await apiService.addExperience(payload);
      }

      const response = normalizeResponse(rawResponse);

      if (response.basarili) {
        showToast("success", activeExperience ? "Deneyim güncellendi." : "Deneyim başarıyla eklendi.");
        setIsExperienceModalOpen(false);
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "İşlem başarısız.");
      }
    } catch (err) {
      console.error("Deneyim CRUD hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Deneyim kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Bu deneyim bilgisini silmek istediğinize emin misiniz?")) return;
    try {
      const rawResponse = await apiService.deleteExperience(id);
      const response = normalizeResponse(rawResponse);
      if (response.basarili) {
        showToast("success", "Deneyim bilgisi silindi.");
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Deneyim silme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Deneyim silinirken bir hata oluştu.");
    }
  };

  const handleSaveCertificate = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!certificateForm.sertifikaAdi.trim()) errors.sertifikaAdi = "Sertifika adı zorunludur.";
    if (!certificateForm.verenKurum.trim()) errors.verenKurum = "Veren kurum zorunludur.";
    if (!certificateForm.verilisTarihi) errors.verilisTarihi = "Veriliş tarihi zorunludur.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let rawResponse;
      if (activeCertificate) {
        rawResponse = await apiService.updateCertificate(activeCertificate.id || activeCertificate.Id, certificateForm);
      } else {
        rawResponse = await apiService.addCertificate(certificateForm);
      }

      const response = normalizeResponse(rawResponse);

      if (response.basarili) {
        showToast("success", activeCertificate ? "Sertifika güncellendi." : "Sertifika başarıyla eklendi.");
        setIsCertificateModalOpen(false);
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "İşlem başarısız.");
      }
    } catch (err) {
      console.error("Sertifika CRUD hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Sertifika kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm("Bu sertifikayı silmek istediğinize emin misiniz?")) return;
    try {
      const rawResponse = await apiService.deleteCertificate(id);
      const response = normalizeResponse(rawResponse);
      if (response.basarili) {
        showToast("success", "Sertifika silindi.");
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error("Sertifika silme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Sertifika silinirken bir hata oluştu.");
    }
  };

  // --- SKILL (YETENEK) İşlemleri ---
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    const skillList = profile?.skills || profile?.Skills || [];
    if (skillList.some(s => (s.yetenekAdi || s.YetenekAdi || "").toLowerCase() === newSkill.trim().toLowerCase())) {
      showToast("error", "Bu yetenek profilinizde zaten mevcut.");
      return;
    }

    try {
      const rawResponse = await apiService.addSkill({ yetenekAdi: newSkill.trim() });
      const response = normalizeResponse(rawResponse);
      if (response.basarili) {
        showToast("success", "Yetenek başarıyla eklendi.");
        setNewSkill("");
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "Yetenek eklenemedi.");
      }
    } catch (err) {
      console.error("Yetenek ekleme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Yetenek eklenirken bir hata oluştu.");
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const rawResponse = await apiService.deleteSkill(skillId);
      const response = normalizeResponse(rawResponse);
      if (response.basarili) {
        showToast("success", "Yetenek silindi.");
        await fetchProfile(true);
      } else {
        showToast("error", response.mesaj || "Silme başarısız.");
      }
    } catch (err) {
      console.error("Yetenek silme hatası:", err);
      const normalized = normalizeResponse(err);
      showToast("error", normalized.mesaj || "Yetenek silinirken bir hata oluştu.");
    }
  };

  // --- RENDERING MODALLARI ---
  const renderProfileModal = () => (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      title="Profili Düzenle"
      size="lg"
      footer={
        <>
          <Button variant="ghost" className="rounded-2xl" onClick={() => setIsProfileModalOpen(false)}>İptal</Button>
          <Button variant="primary" className="rounded-2xl shadow-md px-6" onClick={handleSaveProfile}>Kaydet</Button>
        </>
      }
    >
      <form onSubmit={handleSaveProfile} className="space-y-4 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="adSoyad"
            label="Ad Soyad"
            value={profileForm.adSoyad || ""}
            onChange={e => setProfileForm({ ...profileForm, adSoyad: e.target.value })}
            error={formErrors.adSoyad}
            required
          />
          <Input
            id="unvan"
            label="Başlık / Ünvan"
            placeholder="Senior AI Engineer"
            value={profileForm.unvan || ""}
            onChange={e => setProfileForm({ ...profileForm, unvan: e.target.value })}
          />
        </div>
        
        <Input
          id="konum"
          label="Lokasyon"
          placeholder="İstanbul, Türkiye"
          value={profileForm.konum || ""}
          onChange={e => setProfileForm({ ...profileForm, konum: e.target.value })}
        />

        <Input
          id="kapakFotografiUrl"
          label="Kapak Resmi URL (Opsiyonel)"
          placeholder="https://ornek.com/kapak-resmi.jpg"
          value={profileForm.kapakFotografiUrl || ""}
          onChange={e => setProfileForm({ ...profileForm, kapakFotografiUrl: e.target.value })}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hakkımda</label>
          <textarea
            value={profileForm.bio || ""}
            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
            placeholder="Kendinizden, mesleki deneyimlerinizden and ilgi alanlarınızdan bahsedin..."
            className="w-full px-4 py-3 bg-app border border-border-soft rounded-2xl text-sm focus:outline-none focus:bg-card-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-text-primary placeholder-text-secondary min-h-[120px] resize-none font-medium transition-all duration-200"
          />
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mb-2">Sosyal Ağ Bağlantıları</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="linkedInUrl"
              label="LinkedIn URL"
              placeholder="https://linkedin.com/in/kullanici"
              value={profileForm.linkedInUrl || ""}
              onChange={e => setProfileForm({ ...profileForm, linkedInUrl: e.target.value })}
            />
            <Input
              id="gitHubUrl"
              label="GitHub URL"
              placeholder="https://github.com/kullanici"
              value={profileForm.gitHubUrl || ""}
              onChange={e => setProfileForm({ ...profileForm, gitHubUrl: e.target.value })}
            />
            <Input
              id="websiteUrl"
              label="Kişisel Web Sitesi"
              placeholder="https://kullanici.com"
              value={profileForm.websiteUrl || ""}
              onChange={e => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
            />
            <Input
              id="twitterUrl"
              label="Twitter URL"
              placeholder="https://twitter.com/kullanici"
              value={profileForm.twitterUrl || ""}
              onChange={e => setProfileForm({ ...profileForm, twitterUrl: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );

  const renderEducationModal = () => (
    <Modal
      isOpen={isEducationModalOpen}
      onClose={() => setIsEducationModalOpen(false)}
      title={activeEducation ? "Eğitim Bilgisini Düzenle" : "Eğitim Bilgisi Ekle"}
      size="md"
      footer={
        <>
          <Button variant="ghost" className="rounded-2xl" onClick={() => setIsEducationModalOpen(false)}>İptal</Button>
          <Button variant="primary" className="rounded-2xl shadow-md px-6" onClick={handleSaveEducation}>Kaydet</Button>
        </>
      }
    >
      <form onSubmit={handleSaveEducation} className="space-y-4 font-sans">
        <Input
          id="okulAdi"
          label="Okul Adı"
          placeholder="Boğaziçi Üniversitesi"
          value={educationForm.okulAdi || ""}
          onChange={e => setEducationForm({ ...educationForm, okulAdi: e.target.value })}
          error={formErrors.okulAdi}
          required
        />
        
        <Input
          id="bolum"
          label="Bölüm"
          placeholder="Bilgisayar Mühendisliği"
          value={educationForm.bolum || ""}
          onChange={e => setEducationForm({ ...educationForm, bolum: e.target.value })}
          error={formErrors.bolum}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="baslangicTarihi"
            label="Başlangıç Tarihi"
            type="date"
            value={educationForm.baslangicTarihi || ""}
            onChange={e => setEducationForm({ ...educationForm, baslangicTarihi: e.target.value })}
            error={formErrors.baslangicTarihi}
            required
          />
          <Input
            id="bitisTarihi"
            label="Bitiş Tarihi"
            type="date"
            value={educationForm.bitisTarihi || ""}
            onChange={e => setEducationForm({ ...educationForm, bitisTarihi: e.target.value })}
            disabled={educationForm.devamEdiyor}
            error={formErrors.bitisTarihi}
          />
        </div>

        <div className="flex items-center space-x-2 py-1 select-none">
          <input
            id="edu-devam"
            type="checkbox"
            checked={educationForm.devamEdiyor}
            onChange={e => setEducationForm({ ...educationForm, devamEdiyor: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="edu-devam" className="text-xs font-bold text-slate-500 cursor-pointer">Eğitimime Devam Ediyorum</label>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Açıklama (Opsiyonel)</label>
          <textarea
            value={educationForm.aciklama || ""}
            onChange={e => setEducationForm({ ...educationForm, aciklama: e.target.value })}
            placeholder="Başarılar, önemli projeler veya not ortalaması hakkında bilgi girin..."
            className="w-full px-4 py-3 bg-app border border-border-soft rounded-2xl text-sm focus:outline-none focus:bg-card-primary focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-text-primary placeholder-text-secondary min-h-[90px] resize-none font-medium transition-all duration-200"
          />
        </div>
      </form>
    </Modal>
  );

  const renderExperienceModal = () => (
    <Modal
      isOpen={isExperienceModalOpen}
      onClose={() => setIsExperienceModalOpen(false)}
      title={activeExperience ? "Deneyimi Düzenle" : "Deneyim Ekle"}
      size="md"
      footer={
        <>
          <Button variant="ghost" className="rounded-2xl" onClick={() => setIsExperienceModalOpen(false)}>İptal</Button>
          <Button variant="primary" className="rounded-2xl shadow-md px-6" onClick={handleSaveExperience}>Kaydet</Button>
        </>
      }
    >
      <form onSubmit={handleSaveExperience} className="space-y-4 font-sans">
        <Input
          id="sirketAdi"
          label="Şirket Adı"
          placeholder="TechCorp"
          value={experienceForm.sirketAdi || ""}
          onChange={e => setExperienceForm({ ...experienceForm, sirketAdi: e.target.value })}
          error={formErrors.sirketAdi}
          required
        />
        
        <Input
          id="exp-unvan"
          label="Pozisyon / Ünvan"
          placeholder="Senior AI Engineer"
          value={experienceForm.unvan || ""}
          onChange={e => setExperienceForm({ ...experienceForm, unvan: e.target.value })}
          error={formErrors.unvan}
          required
        />

        <Input
          id="exp-konum"
          label="Konum (Opsiyonel)"
          placeholder="İstanbul, Türkiye (Hibrit)"
          value={experienceForm.konum || ""}
          onChange={e => setExperienceForm({ ...experienceForm, konum: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="exp-baslangic"
            label="Başlangıç Tarihi"
            type="date"
            value={experienceForm.baslangicTarihi || ""}
            onChange={e => setExperienceForm({ ...experienceForm, baslangicTarihi: e.target.value })}
            error={formErrors.baslangicTarihi}
            required
          />
          <Input
            id="exp-bitis"
            label="Bitiş Tarihi"
            type="date"
            value={experienceForm.bitisTarihi || ""}
            onChange={e => setExperienceForm({ ...experienceForm, bitisTarihi: e.target.value })}
            disabled={experienceForm.suAnBuradaCalisiyorum}
            error={formErrors.bitisTarihi}
          />
        </div>

        <div className="flex items-center space-x-2 py-1 select-none">
          <input
            id="exp-devam"
            type="checkbox"
            checked={experienceForm.suAnBuradaCalisiyorum}
            onChange={e => setExperienceForm({ ...experienceForm, suAnBuradaCalisiyorum: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          <label htmlFor="exp-devam" className="text-xs font-bold text-slate-500 cursor-pointer">Şu An Burada Çalışıyorum</label>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-cverse-text/70 uppercase tracking-wider">Açıklama / Görev Tanımı</label>
          <textarea
            value={experienceForm.aciklama || ""}
            onChange={e => setExperienceForm({ ...experienceForm, aciklama: e.target.value })}
            placeholder="Üstlendiğiniz sorumluluklar, kullandığınız teknolojiler and kazandığınız başarılar..."
            className="w-full px-4 py-3 bg-sky-50/80 dark:bg-slate-800 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/50 text-slate-700 min-h-[110px] resize-none font-medium transition-all duration-200"
          />
        </div>
      </form>
    </Modal>
  );

  const renderCertificateModal = () => (
    <Modal
      isOpen={isCertificateModalOpen}
      onClose={() => setIsCertificateModalOpen(false)}
      title={activeCertificate ? "Sertifikayı Düzenle" : "Sertifika Ekle"}
      size="md"
      footer={
        <>
          <Button variant="ghost" className="rounded-2xl" onClick={() => setIsCertificateModalOpen(false)}>İptal</Button>
          <Button variant="primary" className="rounded-2xl shadow-md px-6" onClick={handleSaveCertificate}>Kaydet</Button>
        </>
      }
    >
      <form onSubmit={handleSaveCertificate} className="space-y-4 font-sans">
        <Input
          id="sertifikaAdi"
          label="Sertifika Adı"
          placeholder="AWS Certified Solutions Architect"
          value={certificateForm.sertifikaAdi || ""}
          onChange={e => setCertificateForm({ ...certificateForm, sertifikaAdi: e.target.value })}
          error={formErrors.sertifikaAdi}
          required
        />
        
        <Input
          id="verenKurum"
          label="Veren Kurum"
          placeholder="Amazon Web Services"
          value={certificateForm.verenKurum || ""}
          onChange={e => setCertificateForm({ ...certificateForm, verenKurum: e.target.value })}
          error={formErrors.verenKurum}
          required
        />

        <Input
          id="verilisTarihi"
          label="Veriliş Tarihi"
          type="date"
          value={certificateForm.verilisTarihi || ""}
          onChange={e => setCertificateForm({ ...certificateForm, verilisTarihi: e.target.value })}
          error={formErrors.verilisTarihi}
          required
        />

        <Input
          id="sertifikaUrl"
          label="Sertifika Bağlantısı / URL (Opsiyonel)"
          placeholder="https://creds.com/verify/123"
          value={certificateForm.sertifikaUrl || ""}
          onChange={e => setCertificateForm({ ...certificateForm, sertifikaUrl: e.target.value })}
        />

        <Input
          id="sertifikaId"
          label="Sertifika Numarası / ID (Opsiyonel)"
          placeholder="AWS-123456"
          value={certificateForm.sertifikaId || ""}
          onChange={e => setCertificateForm({ ...certificateForm, sertifikaId: e.target.value })}
        />
      </form>
    </Modal>
  );

  // --- ANA RENDER KARARLARI ---
  if (loading && !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-sky-50 dark:bg-slate-900 rounded-3xl border border-red-100 shadow-premium glassmorphism font-sans">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">Profil Yüklenemedi</h3>
        <p className="text-sm text-slate-500 font-medium mb-6">{error}</p>
        <Button variant="primary" onClick={() => fetchProfile()} className="rounded-2xl px-6">Tekrar Dene</Button>
      </div>
    );
  }

  // Güvenli dizi okumaları sağlamak için fallbacks oluşturduk
  const skillsList = profile?.skills || profile?.Skills || [];
  const educationsList = profile?.educations || profile?.Educations || [];
  const experiencesList = profile?.experiences || profile?.Experiences || [];
  const certificatesList = profile?.certificates || profile?.Certificates || [];

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6 select-none pb-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* 1. ÜST ALAN: Kapak Resmi & Profil Başlığı */}
      <motion.div variants={slideUp}>
        <Card variant="primary" className="overflow-hidden p-0 relative shadow-premium rounded-3xl">
          
          {/* SÜRÜKLE BIRAK KAPAK ALANI */}
          <div 
            className="h-44 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 relative group/cover cursor-pointer overflow-hidden"
            onDragOver={e => handleDragOver(e, "cover")}
            onDragLeave={e => handleDragLeave(e, "cover")}
            onDrop={e => handleDrop(e, "cover")}
          >
            {(() => {
              const coverUrl = profile?.kapakFotografiUrl || profile?.KapakFotografiUrl;
              return coverUrl && coverUrl !== "string" && coverUrl.trim() !== "" ? (
                <img 
                  src={getImageUrl(coverUrl)} 
                  alt="Kapak Resmi" 
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/cover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 opacity-95" />
              );
            })()}
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

            {isDragging.cover && (
              <div className="absolute inset-0 bg-primary-dark/45 backdrop-blur-md flex items-center justify-center border-4 border-dashed border-white m-3 rounded-2xl z-30 transition-all duration-300 pointer-events-none">
                <div className="text-center text-white font-sans">
                  <svg className="w-8 h-8 mx-auto mb-1 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider">Kapak yapmak için bırakın</span>
                </div>
              </div>
            )}

            {/* Kapağı Değiştir Butonu - Her zaman görünür ve şık */}
            {isOwnProfile && (
              <div 
                className="absolute top-4 right-4 bg-slate-900/65 backdrop-blur-md border border-white/15 text-white p-2.5 rounded-2xl transition-all duration-300 shadow-lg hover:bg-slate-900/80 z-20 flex items-center space-x-1.5 select-none cursor-pointer"
                onClick={(e) => { e.stopPropagation(); coverInputRef.current?.click(); }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span className="text-[10px] font-extrabold tracking-wider uppercase font-sans">Kapağı Değiştir</span>
              </div>
            )}

            {uploadProgress.cover > 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30 font-sans">
                <div className="w-1/2 bg-white/20 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-primary h-full transition-all duration-150" style={{ width: `${uploadProgress.cover}%` }} />
                </div>
                <span className="text-xs font-bold">Kapak resmi yükleniyor %{uploadProgress.cover}</span>
              </div>
            )}
            
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={e => handleFileChange(e, "cover")} 
            />
            <input 
              type="file" 
              ref={avatarInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={e => handleFileChange(e, "profile")} 
            />
          </div>

          {/* DETAYLAR & AVATAR (Tek Sütun ve Profil Fotoğrafının Altından Başlayan Doğal Düzen) */}
          <div className="px-6 pb-6 relative flex flex-col items-center text-center gap-4">
            
            <div className="flex flex-col items-center justify-center w-full">
              
              {/* AVATAR CONTAINER - Kapak fotoğrafının hemen altından başlar, üstüne binmez */}
              <div 
                className="mt-6 relative group/avatar cursor-pointer z-10 rounded-full ring-4 ring-card-primary shadow-xl bg-card-primary shrink-0 w-28 h-28 md:w-32 md:h-32"
                style={{ minWidth: 0 }}
                onDragOver={e => handleDragOver(e, "profile")}
                onDragLeave={e => handleDragLeave(e, "profile")}
                onDrop={e => handleDrop(e, "profile")}
              >
                {/* Profil fotoğrafı veya baş harfler */}
                {(() => {
                  const photoUrl = getImageUrl(profile?.profilFotografiUrl || profile?.ProfilFotografiUrl);
                  const fullName = profile?.adSoyad || profile?.AdSoyad || "";
                  const initials = fullName
                    ? fullName.trim().split(" ").filter(Boolean)
                        .map((w, i, arr) => i === 0 || i === arr.length - 1 ? w[0] : "")
                        .join("").toUpperCase().slice(0, 2)
                    : "C";
                  
                  return photoUrl ? (
                    <img
                      key={`avatar-${profileVersion}`}
                      src={`${photoUrl}${photoUrl.includes("?") ? "&" : "?"}v=${profileVersion}`}
                      alt={fullName || "Profil"}
                      className="w-full h-full rounded-full object-cover object-center"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center">
                      <span className="text-white font-black text-2xl select-none">{initials}</span>
                    </div>
                  );
                })()}

                {isDragging.profile && (
                  <div className="absolute inset-0 bg-primary/50 backdrop-blur-md flex items-center justify-center rounded-full pointer-events-none border-2 border-dashed border-white z-30 animate-pulse">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                )}

                {isOwnProfile && (
                  <div 
                    className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 rounded-full z-20"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <span className="text-[8px] font-bold uppercase tracking-wider font-sans">Değiştir</span>
                  </div>
                )}

                {uploadProgress.profile > 0 && (
                  <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center text-white z-30 rounded-full font-sans">
                    <span className="text-[10px] font-black">%{uploadProgress.profile}</span>
                  </div>
                )}
              </div>

              {/* METİN BİLGİLERİ */}
              <div className="mt-4 z-10 w-full font-sans text-center">
                <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center justify-center gap-2 flex-wrap">
                  <span>{profile?.adSoyad || profile?.AdSoyad}</span>
                  <span className="text-[10px] text-text-secondary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md select-none">
                    @{profile?.kullaniciAdi || profile?.KullaniciAdi}
                  </span>
                </h1>
                
                <p className="text-sm font-bold text-text-secondary mt-1">
                  {profile?.unvan || profile?.Unvan || "Cverse Üyesi"}
                </p>
 
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2">
                  {(profile?.konum || profile?.Konum) && (
                    <p className="text-xs text-text-secondary font-semibold flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{profile?.konum || profile?.Konum}</span>
                    </p>
                  )}
                  <p className="text-xs text-text-secondary font-semibold flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{profile?.email || profile?.Email}</span>
                  </p>
                </div>

                {/* SOSYAL MEDYA İKONLARI */}
                <div className="flex items-center justify-center space-x-2 mt-3">
                  {(profile?.linkedInUrl || profile?.LinkedInUrl) && (
                    <a href={formatExternalUrl(profile.linkedInUrl || profile.LinkedInUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-app border border-border-soft hover:border-blue-200 text-text-secondary hover:text-[#0077B5] hover:bg-primary/10 rounded-lg transition-all shadow-sm" title="LinkedIn">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {(profile?.gitHubUrl || profile?.GitHubUrl) && (
                    <a href={formatExternalUrl(profile.gitHubUrl || profile.GitHubUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-app border border-border-soft hover:border-slate-300 text-text-secondary hover:text-text-primary hover:bg-primary/10 rounded-lg transition-all shadow-sm" title="GitHub">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    </a>
                  )}
                  {(profile?.websiteUrl || profile?.WebsiteUrl) && (
                    <a href={formatExternalUrl(profile.websiteUrl || profile.WebsiteUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-app border border-border-soft hover:border-cyan-200 text-text-secondary hover:text-cyan-600 hover:bg-primary/10 rounded-lg transition-all shadow-sm" title="Kişisel Web Sitesi">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </a>
                  )}
                  {(profile?.twitterUrl || profile?.TwitterUrl) && (
                    <a href={formatExternalUrl(profile.twitterUrl || profile.TwitterUrl)} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-app border border-border-soft hover:border-sky-200 text-text-secondary hover:text-[#1DA1F2] hover:bg-primary/10 rounded-lg transition-all shadow-sm" title="Twitter">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                  )}
                </div>
              </div>

            </div>
            
            {/* DÜZENLE BUTONU */}
            {isOwnProfile && (
              <div className="mt-2 shrink-0 z-10 w-full flex justify-center">
                <Button
                  variant="primary"
                  onClick={handleOpenProfileEdit}
                  className="text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-primary/10 flex items-center space-x-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Profili Düzenle</span>
                </Button>
              </div>
            )}

          </div>
        </Card>
      </motion.div>

      {/* 2. ANA İÇERİK ALANI (Tek Sütun Düzeni) */}
      <motion.div className="space-y-6 w-full max-w-4xl mx-auto font-sans animate-fadeIn" variants={slideUp}>
          {/* HAKKINDA KARTI */}
          <Card variant="primary" className="p-4 shadow-premium card-hover-effect">
            <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight mb-2">Hakkında</h3>
            <p className="text-text-secondary text-[11px] sm:text-xs leading-relaxed whitespace-pre-line font-medium">
              {(profile?.bio || profile?.Bio) || "Henüz biyografi girilmemiş. Profilinizi düzenleyerek kendinizden bahsedin."}
            </p>
          </Card>

          {/* YETENEKLER KARTI */}
          <Card variant="secondary" className="p-4 shadow-premium card-hover-effect font-sans">
            <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight mb-3">Yetenekler</h3>
            
            {isOwnProfile && (
              <form onSubmit={handleAddSkill} className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newSkill || ""}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="Yetenek ekleyin..."
                  className="flex-1 px-3 py-2 bg-app border border-border-soft rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all font-medium text-text-primary"
                />
                <Button type="submit" variant="primary" className="!p-2 rounded-xl shadow-md shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </form>
            )}

            {skillsList.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold text-center py-4">Henüz yetenek eklenmemiş.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence>
                  {skillsList.map((skill) => {
                    const skillName = skill.yetenekAdi || skill.YetenekAdi;
                    return (
                      <motion.span key={skill.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <Badge 
                          label={skillName} 
                          type="primary" 
                          className={`group flex items-center space-x-1 py-1 px-2.5 rounded-lg border border-primary/10 transition-colors text-[11px] ${
                            isOwnProfile ? "hover:bg-rose-50 hover:text-rose-600 cursor-pointer" : ""
                          }`}
                          onClick={isOwnProfile ? () => handleRemoveSkill(skill.id) : undefined}
                        >
                          <span>{skillName}</span>
                          {isOwnProfile && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-dark group-hover:text-rose-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </Badge>
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>

          {/* DENEYİMLER KARTI */}
          <Card variant="primary" className="p-4 shadow-premium card-hover-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight">Deneyim</h3>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  onClick={() => handleOpenExperienceModal()}
                  className="text-[11px] font-bold text-primary hover:text-primary-dark p-1 rounded-lg hover:bg-sky-50/80 dark:bg-slate-800 flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ekle</span>
                </Button>
              )}
            </div>

            {experiencesList.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold text-center py-4">Henüz iş deneyimi eklenmemiş.</p>
            ) : (
              <div className="relative border-l-2 border-slate-100/70 ml-1.5 space-y-5">
                {experiencesList.map((exp) => (
                  <div key={exp.id} className="relative pl-5 group/item">
                    <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-sky-50 dark:bg-slate-900 group-hover/item:bg-primary transition-all duration-300 ring-4 ring-white" />
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] text-text-secondary font-bold bg-app border border-border-soft px-1.5 py-0.5 rounded-md">
                          {formatPeriod(exp.baslangicTarihi || exp.BaslangicTarihi, exp.bitisTarihi || exp.BitisTarihi, exp.suAnBuradaCalisiyorum || exp.SuAnBuradaCalisiyorum)}
                        </span>
                        <h4 className="text-xs font-black text-text-primary mt-1.5">{exp.unvan || exp.Unvan}</h4>
                        <div className="flex items-center space-x-2 text-[11px] font-bold text-primary mt-0.5">
                          <span>{exp.sirketAdi || exp.SirketAdi}</span>
                          {(exp.konum || exp.Konum) && <span className="text-border-soft font-normal">|</span>}
                          {(exp.konum || exp.Konum) && <span className="text-text-secondary font-semibold">{exp.konum || exp.Konum}</span>}
                        </div>
                        {(exp.aciklama || exp.Aciklama) && (
                          <p className="text-[11px] text-text-secondary font-semibold leading-relaxed mt-1.5 whitespace-pre-line">
                            {exp.aciklama || exp.Aciklama}
                          </p>
                        )}
                      </div>

                      {isOwnProfile && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleOpenExperienceModal(exp)}
                            className="p-1 hover:bg-sky-50/80 dark:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 border border-transparent"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 border border-transparent"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* EĞİTİM KARTI */}
          <Card variant="secondary" className="p-4 shadow-premium card-hover-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight">Eğitim</h3>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  onClick={() => handleOpenEducationModal()}
                  className="text-[11px] font-bold text-secondary hover:text-secondary-dark p-1 rounded-lg hover:bg-sky-50/80 dark:bg-slate-800 flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ekle</span>
                </Button>
              )}
            </div>

            {educationsList.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold text-center py-4">Henüz eğitim bilgisi eklenmemiş.</p>
            ) : (
              <div className="relative border-l-2 border-slate-100/70 ml-1.5 space-y-5">
                {educationsList.map((edu) => (
                  <div key={edu.id} className="relative pl-5 group/item">
                    <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-secondary bg-sky-50 dark:bg-slate-900 group-hover/item:bg-secondary transition-all duration-300 ring-4 ring-white" />
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] text-text-secondary font-bold bg-app border border-border-soft px-1.5 py-0.5 rounded-md">
                          {formatPeriod(edu.baslangicTarihi || edu.BaslangicTarihi, edu.bitisTarihi || edu.BitisTarihi, !(edu.bitisTarihi || edu.BitisTarihi))}
                        </span>
                        <h4 className="text-xs font-black text-text-primary mt-1.5">{edu.bolum || edu.Bolum}</h4>
                        <span className="text-[11px] text-secondary font-bold mt-0.5 block">{edu.okulAdi || edu.OkulAdi}</span>
                        {(edu.aciklama || edu.Aciklama) && (
                          <p className="text-[11px] text-text-secondary font-semibold leading-relaxed mt-1.5">
                            {edu.aciklama || edu.Aciklama}
                          </p>
                        )}
                      </div>

                      {isOwnProfile && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleOpenEducationModal(edu)}
                            className="p-1 hover:bg-sky-50/80 dark:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 border border-transparent"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteEducation(edu.id)}
                            className="p-1 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 border border-transparent"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SERTİFİKALAR KARTI */}
          <Card variant="primary" className="p-4 shadow-premium card-hover-effect">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary tracking-tight">Sertifikalar</h3>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  onClick={() => handleOpenCertificateModal()}
                  className="text-[11px] font-bold text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-border-soft flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ekle</span>
                </Button>
              )}
            </div>

            {certificatesList.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold text-center py-4">Henüz sertifika eklenmemiş.</p>
            ) : (
              <div className="space-y-3">
                {certificatesList.map((cert) => (
                  <div key={cert.id} className="group/item flex items-start justify-between p-2.5 bg-app border border-border-soft hover:bg-primary/5 rounded-xl transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-app border border-border-soft text-text-secondary rounded-lg shadow-sm shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138z" />
                        </svg>
                      </div>
                      
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-extrabold text-text-primary">{cert.sertifikaAdi || cert.SertifikaAdi}</h4>
                        <p className="text-[11px] text-text-secondary font-bold">{cert.verenKurum || cert.VerenKurum}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pt-1 text-[10px] text-text-secondary/80 font-semibold">
                          <span className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-border-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(cert.verilisTarihi || cert.VerilisTarihi).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}</span>
                          </span>
                          {(cert.sertifikaId || cert.SertifikaId) && <span>ID: {cert.sertifikaId || cert.SertifikaId}</span>}
                          {(cert.sertifikaUrl || cert.SertifikaUrl) && (
                            <a href={formatExternalUrl(cert.sertifikaUrl || cert.SertifikaUrl)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-0.5">
                              <span>Göster</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                        <button onClick={() => handleOpenCertificateModal(cert)} className="p-1 hover:bg-sky-50 dark:bg-slate-900 rounded-lg text-slate-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDeleteCertificate(cert.id)} className="p-1 hover:bg-rose-50 rounded-lg text-slate-400"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

      </motion.div>

      {/* MODALLAR VE TOAST BİLDİRİMLERİ */}
      {renderProfileModal()}
      {renderEducationModal()}
      {renderExperienceModal()}
      {renderCertificateModal()}

      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-premium backdrop-blur-lg flex items-center space-x-2.5 border ${toast.type === "success" ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" : "bg-rose-50/95 border-rose-200 text-rose-800"}`}>
            <span className="text-xs font-bold font-sans">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
