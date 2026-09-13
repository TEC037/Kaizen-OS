import React, { useRef, useEffect } from 'react';

/**
 * CollectiveGeode — El Corazón del Conclave.
 * Una visualización de geometría sagrada que evoluciona basándose en el 
 * esfuerzo colectivo del sistema.
 */
function CollectiveGeode({ progress = 0.5, size = 260 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const valueRef = useRef(0.2);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const dim = size * dpr;

    canvas.width = dim;
    canvas.height = dim;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = size * 0.42;

    const getColors = (p) => {
      
      const cosmic = { r: 15, g: 23, b: 42 };
      const gold = { r: 161, g: 98, b: 7 };
      const cyan = { r: 34, g: 211, b: 238 };
      
      const r = cosmic.r + (gold.r - cosmic.r) * p;
      const g = cosmic.g + (gold.g - cosmic.g) * p;
      const b = cosmic.b + (gold.b - cosmic.b) * p;
      
      return { 
        main: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
        glow: cyan 
      };
    };

    const render = () => {
      const targetProgress = Math.max(0.1, Math.min(1, progress));
      valueRef.current += (targetProgress - valueRef.current) * 0.05;
      const p = valueRef.current;
      timeRef.current += 0.003 + (p * 0.005);
      const t = timeRef.current;

      const colors = getColors(p);
      const colorStr = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

      ctx.clearRect(0, 0, size, size);

      
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.2);
      aura.addColorStop(0, colorStr(colors.main, 0.1));
      aura.addColorStop(0.5, colorStr(colors.glow, 0.02));
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.translate(cx, cy);

      
      const rings = 5 + Math.floor(p * 5);
      for (let i = 0; i < rings; i++) {
        const ringP = i / rings;
        const radius = maxRadius * (0.3 + (ringP * 0.7));
        const rot = t * (i % 2 === 0 ? 1 : -1) * (1 - ringP * 0.5);
        
        ctx.beginPath();
        const sides = 3 + Math.floor(p * 4) + i;
        for (let s = 0; s <= sides; s++) {
          const angle = (s * Math.PI * 2 / sides) + rot;
          const r = radius + Math.sin(t * 2 + i + s) * 2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = colorStr(i % 2 === 0 ? colors.main : colors.glow, 0.1 + (p * 0.3));
        ctx.lineWidth = 0.5 + (p * 1);
        ctx.stroke();

        
        if (p > 0.4 && i % 2 === 0) {
           const nodes = 3 + (i % 3);
           for(let n=0; n<nodes; n++) {
             const nAngle = (n * Math.PI * 2 / nodes) + rot * 1.5;
             const nx = Math.cos(nAngle) * radius;
             const ny = Math.sin(nAngle) * radius;
             ctx.beginPath();
             ctx.arc(nx, ny, 1.5 + p, 0, Math.PI*2);
             ctx.fillStyle = colorStr(colors.glow, 0.4 + p * 0.4);
             ctx.fill();
           }
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [progress, size]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} className="drop-shadow-[0_0_30px_rgba(34,211,238,0.1)]" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-16 h-16 rounded-full bg-cyan-500/5 blur-2xl animate-pulse" />
      </div>
    </div>
  );
}

export default CollectiveGeode;
