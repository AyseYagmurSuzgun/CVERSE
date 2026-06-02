import axios from 'axios';

const BASE_URL = 'http://localhost:5145/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cverse_token');
    if (token && token !== 'mock_admin_token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('cverse_refresh_token');
        if (!refreshToken) throw new Error('Yenileme token bulunamadı.');
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        if (response.data && response.data.basarili) {
          const { token, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('cverse_token', token);
          localStorage.setItem('cverse_refresh_token', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('cverse_token');
        localStorage.removeItem('cverse_refresh_token');
        localStorage.removeItem('cverse_user');
        window.dispatchEvent(new Event('auth_logout'));
      }
    }

    const errorData = error.response?.data || {
      basarili: false,
      mesaj: error.message || 'Bir ağ hatası oluştu.',
    };

    return Promise.reject(errorData);
  }
);

const toUtcIso = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

export const apiService = {
  // --- AUTH ---
  async register(registerData) {
    const response = await api.post('/auth/register', registerData);
    return response.data;
  },

  async login(loginData) {
    const response = await api.post('/auth/login', loginData);
    if (response.data && response.data.basarili) {
      localStorage.setItem('cverse_token', response.data.token);
      localStorage.setItem('cverse_refresh_token', response.data.refreshToken);
    }
    return response.data;
  },

  async refreshToken(refreshTokenValue) {
    const response = await api.post('/auth/refresh-token', { refreshToken: refreshTokenValue });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // --- PROFILE (Zarf Açma Entegrasyonu Yapıldı) ---
  // --- PROFILE ---
  async getProfile() {
    const response = await api.get('/profile/me');
    return response.data; // İçini kurcalamadan doğrudan ham response'u döndürüyoruz
  },

  async getProfileById(userId) {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile/update', profileData);
    return response.data; // Ham response
  },

  async uploadProfilePhoto(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/profile/upload-photo', formData, {
      onUploadProgress,
    });
    return response.data;
  },

  async uploadCoverPhoto(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/profile/upload-cover', formData, {
      onUploadProgress,
    });
    return response.data;
  },

  // --- EDUCATION ---
  async addEducation(educationData) {
    const response = await api.post('/profile/education', {
      okulAdi: educationData.okulAdi,
      bolum: educationData.bolum,
      baslangicTarihi: toUtcIso(educationData.baslangicTarihi),
      bitisTarihi: educationData.devamEdiyor ? null : toUtcIso(educationData.bitisTarihi),
      aciklama: educationData.aciklama,
      devamEdiyor: educationData.devamEdiyor
    });
    return response.data;
  },

  async updateEducation(id, educationData) {
    const response = await api.put(`/profile/education/${id}`, {
      okulAdi: educationData.okulAdi,
      bolum: educationData.bolum,
      baslangicTarihi: toUtcIso(educationData.baslangicTarihi),
      bitisTarihi: educationData.devamEdiyor ? null : toUtcIso(educationData.bitisTarihi),
      aciklama: educationData.aciklama,
      devamEdiyor: educationData.devamEdiyor
    });
    return response.data;
  },

  async deleteEducation(id) {
    const response = await api.delete(`/profile/education/${id}`);
    return response.data;
  },

  // --- EXPERIENCE ---
  async addExperience(experienceData) {
    const response = await api.post('/profile/experience', {
      sirketAdi: experienceData.sirketAdi,
      unvan: experienceData.unvan,
      konum: experienceData.konum,
      baslangicTarihi: toUtcIso(experienceData.baslangicTarihi),
      bitisTarihi: experienceData.suAnBuradaCalisiyorum ? null : toUtcIso(experienceData.bitisTarihi),
      suAnBuradaCalisiyorum: experienceData.suAnBuradaCalisiyorum,
      aciklama: experienceData.aciklama
    });
    return response.data;
  },

  async updateExperience(id, experienceData) {
    const response = await api.put(`/profile/experience/${id}`, {
      sirketAdi: experienceData.sirketAdi,
      unvan: experienceData.unvan,
      konum: experienceData.konum,
      baslangicTarihi: toUtcIso(experienceData.baslangicTarihi),
      bitisTarihi: experienceData.suAnBuradaCalisiyorum ? null : toUtcIso(experienceData.bitisTarihi),
      suAnBuradaCalisiyorum: experienceData.suAnBuradaCalisiyorum,
      aciklama: experienceData.aciklama
    });
    return response.data;
  },

  async deleteExperience(id) {
    const response = await api.delete(`/profile/experience/${id}`);
    return response.data;
  },

  // --- SKILLS ---
  async addSkill(skillData) {
    const response = await api.post('/profile/skill', {
      yetenekAdi: skillData.yetenekAdi
    });
    return response.data;
  },

  async deleteSkill(id) {
    const response = await api.delete(`/profile/skill/${id}`);
    return response.data;
  },

  // --- CERTIFICATES ---
  async addCertificate(certificateData) {
    const response = await api.post('/profile/certificate', {
      sertifikaAdi: certificateData.sertifikaAdi,
      verenKurum: certificateData.verenKurum,
      verilisTarihi: toUtcIso(certificateData.verilisTarihi),
      sertifikaUrl: certificateData.sertifikaUrl,
      sertifikaId: certificateData.sertifikaId
    });
    return response.data;
  },

  async updateCertificate(id, certificateData) {
    const response = await api.put(`/profile/certificate/${id}`, {
      sertifikaAdi: certificateData.sertifikaAdi,
      verenKurum: certificateData.verenKurum,
      verilisTarihi: toUtcIso(certificateData.verilisTarihi),
      sertifikaUrl: certificateData.sertifikaUrl,
      sertifikaId: certificateData.sertifikaId
    });
    return response.data;
  },

  async deleteCertificate(id) {
    const response = await api.delete(`/profile/certificate/${id}`);
    return response.data;
  },

  // --- FEED & POSTS ---
  async getFeed() {
    const response = await api.get('/posts/feed');
    return response.data;
  },
  
  async createPost(content, files) {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
    }
    const response = await api.post('/posts/create', formData);
    return response.data;
  },

  async toggleLike(postId) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  async addComment(postId, content) {
    const response = await api.post(`/posts/${postId}/comment`, { content });
    return response.data;
  },

  async toggleCommentLike(commentId) {
    const response = await api.post(`/posts/comments/${commentId}/like`);
    return response.data;
  },

  async toggleRepost(postId) {
    const response = await api.post(`/posts/${postId}/repost`);
    return response.data;
  },

  async deletePost(postId) {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  async getUserPosts(targetUserId) {
    const response = await api.get(`/posts/user/${targetUserId}`);
    return response.data;
  },

  // --- FOLLOW & DISCOVER ---
  async toggleFollow(targetUserId) {
    const response = await api.post(`/follow/${targetUserId}`);
    return response.data;
  },

  async getDiscoverUsers() {
    const response = await api.get('/follow/discover');
    return response.data;
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async getUnreadNotificationCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markNotificationAsRead(id) {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsAsRead() {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  // --- CHAT ---
  async getConversations() {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(receiverId, content) {
    const response = await api.post('/chat/message', { receiverId, content });
    return response.data;
  },

  async markConversationAsRead(conversationId) {
    const response = await api.post(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  async createConversation(receiverId) {
    const response = await api.post(`/chat/conversations/create/${receiverId}`);
    return response.data;
  },

  // --- CV ANALYSIS ---
  async uploadCv(file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/cv/upload', formData, {
      onUploadProgress,
    });
    return response.data;
  },

  async getMyCvAnalyses() {
    const response = await api.get('/cv/my-analyses');
    return response.data;
  },

  async deleteCvAnalysis(id) {
    const response = await api.delete(`/cv/${id}`);
    return response.data;
  },

  // --- JOBS ---
  async getJobs() {
    const response = await api.get('/jobs');
    return response.data;
  },

  async getJobById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  async applyToJob(id) {
    const response = await api.post(`/jobs/apply/${id}`);
    return response.data;
  },

  async getRecommendedJobs() {
    const response = await api.get('/jobs/recommended');
    return response.data;
  },

  async searchJobs(params) {
    const response = await api.get('/jobs/search', { params });
    return response.data;
  },

  async getAppliedJobs() {
    const response = await api.get('/jobs/applied');
    return response.data;
  },

  async updateApplicationStatus(id, status) {
    const response = await api.put(`/jobs/applications/${id}/status`, JSON.stringify(status));
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/profile/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/profile/delete-account');
    return response.data;
  },

  // --- ADMIN ---
  async deleteUserByAdmin(userId) {
    const response = await api.delete(`/profile/admin/delete-user/${userId}`);
    return response.data;
  },

  async deleteJobByAdmin(jobId) {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  }
};

export default api;