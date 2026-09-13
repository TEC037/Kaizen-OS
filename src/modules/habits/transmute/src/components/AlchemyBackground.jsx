import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore.jsx';

/**
 * AlchemyBackground v660.6: EL VÓRTICE DE LA OBRA
 * - Sincronía Temática Dinámica (Nigredo / Citrinitas).
 * - Partículas de Esencia alineadas a var(--color-gold).
 * - Estética Etérea de Alta Fidelidad.
 */
const AlchemyBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = 20; 

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Essence {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 50;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speedY = -(Math.random() * 0.5 + 0.2);
        this.frequency = Math.random() * 0.003 + 0.001;
        this.phi = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.depth = Math.random();
      }

      update() {
        this.y += this.speedY * (0.8 + this.depth);
        this.x += Math.sin(this.y * this.frequency + this.phi) * 0.2;
        if (this.y < -50) this.reset();
      }

      draw(color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = this.opacity * (this.y / canvas.height);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Essence());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      
      const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--color-gold').trim();
      
      particles.forEach(p => {
        p.update();
        p.draw(goldColor || '#a16207');
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]); 

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[var(--bg-porcelain)] transition-colors duration-1000">
      
      {}
      <svg className="absolute inset-0 w-full h-full opacity-10 blur-[100px]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="gradAtanor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-gold)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradAtanor)" className="animate-pulse" />
      </svg>

      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 block w-full h-full opacity-40 mix-blend-multiply dark:mix-blend-screen"
      />

      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-porcelain)] via-transparent to-[var(--bg-porcelain)] opacity-60" />
      
    </div>
  );
};

export default AlchemyBackground;
