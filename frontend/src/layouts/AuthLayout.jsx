import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const AuthLayout = ({ children, title = "CVERSE", subtitle = "Geleceğin Profesyonel Ağ Sistemi" }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = 0.2;
        this.color = "rgba(93, 173, 226, 0.15)";
      }

      update(mouseX, mouseY) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxNormalSpeed = 0.8;
        if (speed > maxNormalSpeed) {
          this.vx *= 0.92;
          this.vy *= 0.92;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) {
          this.x = 0;
          this.vx = -this.vx * 0.8;
        } else if (this.x > canvas.width) {
          this.x = canvas.width;
          this.vx = -this.vx * 0.8;
        }
        
        if (this.y < 0) {
          this.y = 0;
          this.vy = -this.vy * 0.8;
        } else if (this.y > canvas.height) {
          this.y = canvas.height;
          this.vy = -this.vy * 0.8;
        }

        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 150;

          if (distance < forceRadius) {
            const safeDistance = Math.max(1.0, distance);
            const force = (forceRadius - safeDistance) / forceRadius;
            const directionX = dx / safeDistance;
            const directionY = dy / safeDistance;

            const acceleration = force * 2.5;
            this.vx -= directionX * acceleration;
            this.vy -= directionY * acceleration;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    let particles = [];
    const initParticles = () => {
      particles = [];
      const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 5000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    initParticles();

    let mouseX = null;
    let mouseY = null;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw();

        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(p.x, p.y);
            const alpha = ((140 - distance) / 140) * 0.75;
            ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.lineWidth = 1.35;
            ctx.stroke();
          }
        }
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = ((140 - distance) / 140) * 0.65;
            ctx.strokeStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full flex flex-col lg:flex-row select-none overflow-hidden relative bg-gradient-to-br from-[#E1F0FA] via-[#B9DCF4] to-[#E1F0FA] pb-16"
    >
      {/* İnteraktif Canvas Katmanı */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Arka plan derinlik parıltıları */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-100/20 blur-[100px] pointer-events-none z-0" />

      {/* Sol Panel: Başlık & Slogan Alanı (Sağa ötelenmiş ve özel modern italik stilde) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 overflow-hidden flex-col justify-center items-center p-12 border-r border-blue-200/30">
        {/* pl-20 veya pl-32 ekleyerek tüm metin bloğunu sağ tarafa (form kutusuna doğru) öteliyoruz */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pl-24 transition-all duration-500">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Büyük Başlık */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-widest text-[#0B2545] font-sans leading-none uppercase select-none drop-shadow-sm text-glow-elegant">
              {title}
            </h1>
            
            {/* Dekoratif Çizgi */}
            <div className="flex items-center justify-center space-x-2">
              <span className="w-16 h-[2px] bg-gradient-to-r from-transparent to-primary rounded-full" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="w-16 h-[2px] bg-gradient-to-l from-transparent to-primary rounded-full" />
            </div>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-wide text-[#0B2545] italic font-elegant max-w-md mx-auto leading-relaxed select-none opacity-90 drop-shadow-sm">
              {subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sağ Panel: Form Alanı */}
      <div className="flex-grow lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <motion.div
          className="w-full max-w-md auth-glassmorphism rounded-3xl p-8 sm:p-10 relative z-10"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>

      {/* Full-width Sleek Footer Strip at the very bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-6 z-20">
        <Footer />
      </div>

    </div>
  );
};

export default AuthLayout;