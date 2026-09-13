/**
 * @file src/components/SenseiWidget.tsx
 * @description Widget del Sensei Kaizen: Analista holístico contextual de mejora continua.
 * Correlaciona hábitos, entrenamientos y proyectos en curso para dar síntesis sabias.
 * Incluye exportación visual de la Carta Diaria de Avance mediante html-to-image.
 */

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Sparkles, Download, RefreshCw, Quote, Key } from 'lucide-react';
import { toPng } from 'html-to-image';
import { KzCard } from './ui/KzCard';
import { KzButton } from './ui/KzButton';
import { KzBadge } from './ui/KzBadge';
import { readKaizenSessions } from '../modules/gym/sessions';
import { loadProjects } from '../modules/projects/forja/src/storage/forjaStorage';
import { seedProjects } from '../modules/projects/forja/src/data/seed';
import { soundEngine } from '../core/sound';
import {
  generateSenseiInsight,
  getFallbackInsights,
  getGeminiApiKey,
  setGeminiApiKey,
  SenseiInsight,
} from '../core/senseiAI';

interface SenseiWidgetProps {
  scorePoints: number;
  dailyPercent: number;
  streakDays: number;
  onNavigate?: (path: string) => void;
}

export const SenseiWidget: React.FC<SenseiWidgetProps> = ({
  scorePoints,
  dailyPercent,
  streakDays,
  onNavigate,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<SenseiInsight | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(() => Boolean(getGeminiApiKey()));
  const exportCardRef = useRef<HTMLDivElement>(null);

  // Leer estado real de los módulos para correlación holística
  const sessions = readKaizenSessions();
  const todayStr = new Date().toISOString().split('T')[0];
  const trainedToday = sessions.some((s) => s.date === todayStr);

  const projects = loadProjects(seedProjects);
  const activeProject = projects.find((p) => p.status === 'En progreso') || projects[0];

  const userName = (typeof window !== 'undefined' && localStorage.getItem('kz:user_name')) || 'Artesano';

  const contextData = {
    userName,
    trainedToday,
    dailyPercent,
    scorePoints,
    streakDays,
    activeProjectTitle: activeProject?.title,
    activeProjectNextAction: activeProject?.nextAction,
  };

  const fallbackInsights = getFallbackInsights(contextData);
  const currentInsight = aiInsight || fallbackInsights[insightIndex % fallbackInsights.length];

  const handleNextInsight = async () => {
    soundEngine.playTap();
    const hasKey = Boolean(getGeminiApiKey());

    if (hasKey) {
      try {
        setIsAiLoading(true);
        const generated = await generateSenseiInsight(contextData);
        setAiInsight(generated);
        soundEngine.playComplete();
      } catch {
        setAiInsight(null);
        setInsightIndex((prev) => prev + 1);
      } finally {
        setIsAiLoading(false);
      }
    } else {
      setAiInsight(null);
      setInsightIndex((prev) => prev + 1);
    }
  };

  const handleConfigureKey = () => {
    soundEngine.playTap();
    const current = getGeminiApiKey() || '';
    const input = window.prompt(
      'Configura tu API Key de Google Gemini para reflexiones del Sensei en vivo (o déjala vacía para usar sabiduría local):',
      current
    );
    if (input !== null) {
      setGeminiApiKey(input);
      const active = Boolean(input.trim());
      setHasKey(active);
      if (active) {
        soundEngine.playComplete();
        handleNextInsight();
      }
    }
  };

  const handleExportCard = async () => {
    if (!exportCardRef.current) return;
    soundEngine.playTap();
    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportCardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `kaizen-avance-${todayStr}.png`;
      link.href = dataUrl;
      link.click();
      soundEngine.playComplete();
    } catch (err) {
      console.error('Error exportando tarjeta Kaizen:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <KzCard variant="surface" className="relative overflow-hidden border-stone-300">
      {/* Encabezado del Widget */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center">
            <Sparkles size={13} />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
              Sensei Kaizen · Inteligencia Holística
            </h3>
            <span className="text-[10px] font-mono text-stone-600 block">
              Análisis contextual cruzado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleConfigureKey}
            className={`p-1.5 border rounded-sm cursor-pointer transition-colors ${
              hasKey
                ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                : 'border-stone-300 bg-white hover:bg-stone-100 text-stone-600'
            }`}
            title={hasKey ? 'Gemini IA activa (click para modificar API Key)' : 'Configurar API Key de Gemini para reflexiones de IA en vivo'}
          >
            <Key size={12} className={hasKey ? 'text-emerald-700' : 'text-stone-500'} />
          </button>

          <KzButton
            variant="craft"
            size="sm"
            onClick={handleNextInsight}
            disabled={isAiLoading}
            icon={<RefreshCw size={11} className={isAiLoading ? 'animate-spin' : ''} />}
            title="Siguiente consejo reflexivo del Sensei"
          >
            {isAiLoading ? 'Consultando…' : 'Reflexión'}
          </KzButton>

          <KzButton
            variant="craft"
            size="sm"
            onClick={handleExportCard}
            disabled={isExporting}
            icon={<Download size={11} />}
            title="Descargar tarjeta diaria como imagen PNG"
          >
            {isExporting ? 'Generando…' : 'Exportar'}
          </KzButton>
        </div>
      </div>

      {/* Tarjeta imprimible / exportable */}
      <div
        ref={exportCardRef}
        className="bg-[#faf8f1] border border-stone-200/80 p-4 rounded-sm space-y-3 font-mono text-xs"
      >
        <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <KzBadge variant="accent">{currentInsight.title}</KzBadge>
            {currentInsight.isAiGenerated && <KzBadge variant="info">Gemini IA</KzBadge>}
            {trainedToday && <KzBadge variant="success">Físico Entrenado</KzBadge>}
            {dailyPercent >= 100 && <KzBadge variant="success">Meta 1% Lista</KzBadge>}
          </div>
          <span className="text-[10px] text-stone-600 font-bold">KAIZEN OS</span>
        </div>

        <p className="text-stone-800 leading-relaxed text-xs sm:text-sm font-sans">
          {currentInsight.body}
        </p>

        <div className="pt-2 border-t border-stone-200/60 flex items-start gap-2 text-[11px] text-stone-600 italic">
          <Quote size={12} className="shrink-0 mt-0.5 text-amber-700" />
          <span>{currentInsight.principio}</span>
        </div>

        {/* Resumen de telemetría atómica del día */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200/60 text-center text-[10px]">
          <div className="bg-white/70 p-1.5 border border-stone-200/50 rounded-sm">
            <span className="text-stone-600 uppercase block">Avance 1%</span>
            <span className="font-bold text-xs text-stone-900">{dailyPercent}%</span>
          </div>
          <div className="bg-white/70 p-1.5 border border-stone-200/50 rounded-sm">
            <span className="text-stone-600 uppercase block">Puntos Hoy</span>
            <span className="font-bold text-xs text-stone-900">{scorePoints} pts</span>
          </div>
          <div className="bg-white/70 p-1.5 border border-stone-200/50 rounded-sm">
            <span className="text-stone-600 uppercase block">Racha</span>
            <span className="font-bold text-xs text-stone-900">{streakDays} días</span>
          </div>
        </div>
      </div>
    </KzCard>
  );
};
