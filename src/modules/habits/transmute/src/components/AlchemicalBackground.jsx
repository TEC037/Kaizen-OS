import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * AlchemicalBackground v3.0 — ATMÓSFERA PERSONALIZADA
 * Reacciona al área de enfoque (profiling) del usuario.
 */
const AlchemicalBackground = () => {
  const profiling = useStore(state => state.settings.profiling);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef({ particles: [], w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const getThemeColors = () => {
      const focus = profiling?.focusArea || 'Mente';
      const colors = {
        'Cuerpo':   '239, 68, 68',   // Rojo
        'Mente':    '59, 130, 246',  // Azul
        'Espíritu': '217, 70, 239'   // Violeta
      };
      
      return {
        rgb: colors[focus] || '161, 98, 7',
      };
    };

    
    const spawnParticle = (w, h) => ({
      x:           w * 0.1 + Math.random() * w * 0.8,
      y:           h + Math.random() * 40,
      vy:          -(0.3 + Math.random() * 0.7),
      r:           0.6 + Math.random() * 1.6,
      wobbleAmp:   0.3 + Math.random() * 0.6,
      wobbleFreq:  0.02 + Math.random() * 0.03,
      wobblePhase: Math.random() * Math.PI * 2,
      age: 0,
    });

    
    const createParticles = (w, h, count = 60) =>
      Array.from({ length: count }, () => {
        const p = spawnParticle(w, h);
        p.y = Math.random() * h * 1.2;
        return p;
      });

    
    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width  = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      stateRef.current.w = w;
      stateRef.current.h = h;
      stateRef.current.particles = createParticles(w, h);
    };

    
    const drawFurnace = (w, h, rgb) => {
      const furnace = ctx.createRadialGradient(
        w * 0.5, h * 1.1, 0,
        w * 0.5, h * 1.1, w * 0.6
      );
      furnace.addColorStop(0,   `rgba(${rgb},0.06)`);
      furnace.addColorStop(0.5, `rgba(${rgb},0.02)`);
      furnace.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = furnace;
      ctx.fillRect(0, 0, w, h);
    };

    
    const drawParticle = (p, w, h, rgb) => {
      
      const heightRatio = 1 - Math.max(0, Math.min(1, (h - p.y) / h));
      
      const alpha = Math.pow(heightRatio, 1.6) * 0.22;

      if (alpha < 0.002) return;

      const radius = p.r * (0.7 + heightRatio * 0.3);

      
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 5);
      halo.addColorStop(0, `rgba(${rgb},${alpha * 0.5})`);
      halo.addColorStop(1, `rgba(${rgb},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * 5, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.8})`;
      ctx.fill();
    };

    
    const MAX_DIST = 90;
    const drawConvection = (particles, rgb) => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          if (Math.abs(a.x - b.x) > MAX_DIST) continue;
          const dx   = a.x - b.x;
          const dy   = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_DIST) continue;
          const alpha = (1 - dist / MAX_DIST) * 0.06;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${rgb},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };

    
    const tick = () => {
      const { particles, w, h } = stateRef.current;
      if (!w || !h) { animRef.current = requestAnimationFrame(tick); return; }

      const { rgb } = getThemeColors();
      ctx.clearRect(0, 0, w, h);

      drawFurnace(w, h, rgb);

      particles.forEach((p, idx) => {
        p.age++;
        p.y += p.vy;
        p.x += Math.sin(p.age * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;

        const heightRatio = 1 - Math.max(0, Math.min(1, (h - p.y) / h));
        if (p.y < -20 || heightRatio < 0.01) {
          particles[idx] = spawnParticle(w, h);
        }
      });

      drawConvection(particles, rgb);
      particles.forEach(p => drawParticle(p, w, h, rgb));

      animRef.current = requestAnimationFrame(tick);
    };

    
    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animRef.current);
      else animRef.current = requestAnimationFrame(tick);
    };

    resize();
    animRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};

export default AlchemicalBackground;
