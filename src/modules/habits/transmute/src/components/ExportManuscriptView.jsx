import React, { forwardRef } from 'react';
import MonolithText from './MonolithText';
import { evolveHabitTitle } from '../domain/HabitDomain';
import { habitDefinitions } from '../data/habitDefinitions';
import { Flame, Check, X } from 'lucide-react';

export const ExportManuscriptView = forwardRef(({ habits, date, userName }, ref) => {
  const completedCount = habits.filter(h => h.completedDays?.[date]).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  
  
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div ref={ref} className="bg-[#EBE9E4] p-10 w-[600px] flex flex-col font-serif relative overflow-hidden" style={{ minHeight: '800px', color: '#1A181C' }}>
      {}
      <div className="absolute inset-0 opacity-5 bg-[#1A181C]" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] border-[1px] border-[#B48C3C]/20 rounded-full" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] border-[1px] border-[#B48C3C]/20 rounded-full" />

      <div className="relative z-10 flex flex-col flex-1">
        <header className="mb-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 border-2 border-[#1A181C]/10 rounded-full flex items-center justify-center mb-4 bg-white/60">
            <span className="text-[#1A181C] font-serif font-black text-2xl tabular-nums">{completionRate}%</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2" style={{ color: '#1A181C' }}>
            Códice Diario
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px bg-[#1A181C]/20 w-8" />
            <p className="text-xs font-sans font-black uppercase tracking-[0.3em] opacity-60 text-[#1A181C]">
              Adepto: {userName}
            </p>
            <div className="h-px bg-[#1A181C]/20 w-8" />
          </div>
          <p className="text-xs font-serif italic opacity-40 mt-3">{formattedDate}</p>
        </header>
        
        <div className="flex flex-col gap-4 w-full px-4 flex-1">
          {habits.map(h => {
            const isCompleted = h.completedDays?.[date];
            const title = evolveHabitTitle(h, habitDefinitions);
            const streak = h.streak || 0;

            return (
              <div key={h.id} className="flex items-center gap-4 p-4 rounded-2xl border bg-white/40 relative overflow-hidden" style={{
                borderColor: isCompleted ? 'rgba(180, 140, 60, 0.4)' : 'rgba(26, 24, 28, 0.05)',
                boxShadow: isCompleted ? '0 4px 12px rgba(180, 140, 60, 0.05)' : 'none'
              }}>
                {isCompleted && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#B48C3C]" />
                )}
                
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{
                  backgroundColor: isCompleted ? '#B48C3C' : 'rgba(26, 24, 28, 0.05)',
                  color: isCompleted ? '#EBE9E4' : '#1A181C'
                }}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <X size={16} className="opacity-30" strokeWidth={2} />}
                </div>

                <div className="flex flex-col flex-1 pl-2">
                  <span className="text-xl font-bold font-sans tracking-tight" style={{ 
                    color: "#1A181C",
                    opacity: isCompleted ? 1 : 0.4,
                    textDecoration: isCompleted ? "none" : "line-through"
                  }}>
                    {title}
                  </span>
                  
                  {streak > 0 && (
                     <div className="flex items-center gap-1 mt-1 opacity-80">
                        <Flame size={12} className="text-[#B48C3C]" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C3C]">Racha: {streak}</span>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <footer className="relative z-10 mt-12 flex justify-between items-center opacity-40 border-t border-[#1A181C]/20 pt-6">
        <span className="text-xs font-black uppercase tracking-[0.2em] font-sans">Registro Oficial</span>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-sans text-[#B48C3C]">TRANSMUTE APP</span>
      </footer>
    </div>
  );
});
