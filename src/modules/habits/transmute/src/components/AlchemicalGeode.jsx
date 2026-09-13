import React, { useRef, useEffect } from 'react';

/**
 * AlchemicalGeode — El estado de la materia.
 * Genera un Geoide (cristal líquido de geometría sagrada) que muta su complejidad
 * y simetría basándose matemáticamente en el progreso diario de transmutación.
 */
function AlchemicalGeode({ progress = 0, size = 180 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const valueRef = useRef(0);
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
    const maxRadius = size * 0.45;
    const dark = '#1a181c';

    const getGeodeColor = (p) => {
      
      if (p >= 0.999) return { r: 34, g: 197, b: 94 }; 

      
      const plomo = { r: 71, g: 85, b: 105 };
      const gold = { r: 180, g: 140, b: 60 };
      
      const rRatio = plomo.r + (gold.r - plomo.r) * p;
      const gRatio = plomo.g + (gold.g - plomo.g) * p;
      const bRatio = plomo.b + (gold.b - plomo.b) * p;
      
      return { r: Math.round(rRatio), g: Math.round(gRatio), b: Math.round(bRatio) };
    };

    const renderGeode = () => {
      
      const targetProgress = Math.max(0, Math.min(1, progress));
      valueRef.current += (targetProgress - valueRef.current) * 0.05;
      const p = valueRef.current; 

      
      if (p < 0.998) {
        timeRef.current += 0.005;
      }
      const t = timeRef.current;

      const cc = getGeodeColor(p);
      const colorString = (alpha) => `rgba(${cc.r}, ${cc.g}, ${cc.b}, ${alpha})`;

      ctx.clearRect(0, 0, size, size);

      
      const auraGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
      auraGradient.addColorStop(0, colorString(p * 0.15));
      auraGradient.addColorStop(1, colorString(0));
      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, size, size);

      ctx.save();
      ctx.translate(cx, cy);

      
      
      const basePoints = 3 + Math.floor(p * 5); 
      const fractureLayers = 1 + Math.floor(p * 3); 
      
      for (let layer = 0; layer < fractureLayers; layer++) {
        const layerRatio = 1 - (layer * 0.2);
        const radius = maxRadius * (0.4 + (p * 0.6)) * layerRatio;
        
        ctx.beginPath();
        
        const modifier = layer % 2 === 0 ? 1 : -1;
        
        for (let i = 0; i <= basePoints; i++) {
          const angle = (i * (Math.PI * 2) / basePoints) + (t * modifier) + (layer * Math.PI/4);
          
          
          const pulse = (p >= 0.998) ? 0 : Math.sin(t * 5 + i) * 2 * p; 
          const r = radius + pulse;

          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.strokeStyle = colorString(0.2 + (0.8 * p));
        ctx.lineWidth = layer === 0 ? 2 : 1;
        ctx.stroke();

        
        if (p > 0.5 && layer === 0) {
          for(let i=0; i < basePoints; i++) {
            const a1 = (i * (Math.PI * 2) / basePoints) + t;
            
            const a2 = ((i+2) * (Math.PI * 2) / basePoints) + t;
            
            ctx.beginPath();
            ctx.moveTo(Math.cos(a1)*radius, Math.sin(a1)*radius);
            ctx.lineTo(Math.cos(a2)*radius*0.8, Math.sin(a2)*radius*0.8);
            ctx.strokeStyle = colorString((p - 0.5) * 0.5);
            ctx.stroke();
          }
        }
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(renderGeode);
    };

    animRef.current = requestAnimationFrame(renderGeode);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [progress, size]);

  return (
    <div className="relative flex items-center justify-center filter drop-shadow-2xl">
      <canvas
        ref={canvasRef}
        aria-label={`Cristalización Alquímica: ${Math.round(progress * 100)}%`}
        className="transition-transform duration-1000 ease-out hover:scale-105 hover:rotate-12"
      />
    </div>
  );
}

export default AlchemicalGeode;
