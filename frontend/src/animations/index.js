// CVERSE Premium Animasyon Kütüphanesi - Framer Motion Varyantları

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Yumuşak dikey yükseliş (Dribbble kartları ve liste ögeleri için)
export const slideUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } // Yumuşak ivmelenme cubic-bezier
  }
};

// Soldan kayma (Sidebar ve bilgi panelleri için)
export const slideInLeft = {
  hidden: { opacity: 0, x: -35 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

// Sağdan kayma (Mesajlaşma paneli ve trend listeleri için)
export const slideInRight = {
  hidden: { opacity: 0, x: 35 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

// Pop-up büyüme efekti (Modal ve uyarı kartları için)
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// Listelerin ögelerini ardışık (staggered) yükleme
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

// Buton tıklama geri bildirimi
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98, y: 0 }
};

// Kart hover hareketi (sadece Framer ile kontrol edilmek istendiğinde)
export const cardHoverVariants = {
  rest: { y: 0, boxShadow: '0 10px 30px -15px rgba(93, 173, 226, 0.12)' },
  hover: { 
    y: -6, 
    boxShadow: '0 25px 50px -15px rgba(93, 173, 226, 0.22)',
    transition: { duration: 0.3, ease: 'easeOut' } 
  }
};
