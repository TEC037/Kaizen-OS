import React, { useState } from 'react';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

interface AjustesScreenProps {
  onExportPdf: () => void;
  onOpenWeightModal: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenHistory: () => void;
}

export const AjustesScreen: React.FC<AjustesScreenProps> = ({
  onExportPdf,
  onOpenWeightModal,
  onOpenProfile,
  onOpenNotifications,
  onOpenHistory,
}) => {
  const {
    profile,
    personalRecords,
    weeklyVolumes,
    monthCalendarDays,
    isDemoMode,
    logoutUser,
    resetDemo,
  } = useUiData();

  const currentWeight = profile.weight;
  const [selectedPeriod, setSelectedPeriod] = useState<'semana' | 'mes' | '3meses' | 'anio'>('mes');

  const initialBar = weeklyVolumes.find((v) => v.isPeak) ?? weeklyVolumes[weeklyVolumes.length - 1];
  const [selectedBar, setSelectedBar] = useState(() => ({
    label: initialBar?.label ?? 'Semana Actual',
    tonnage: initialBar ? `${initialBar.tonnage.toLocaleString()} kg` : '—',
    week: initialBar?.week ?? 'S4',
  }));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const maxVolume = Math.max(...weeklyVolumes.map((v) => v.tonnage), 1);
  const activeDaysInMonth = monthCalendarDays.filter((d) => d.active && !d.isOtherMonth).length;

  const periods = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: '3meses', label: '3 Meses' },
    { id: 'anio', label: 'Año' },
  ];

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 gap-5 pb-28 pt-2">
      {/* Header title */}
      <section className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse shadow-[0_0_8px_#c3f400]"></span>
            <span className="font-headline text-[10px] uppercase tracking-widest text-[#c3f400] font-bold">
              Configuración & Perfil
            </span>
          </div>
          <span className="font-headline text-xs text-[#c4c9ac] bg-[#272a31] px-2.5 py-1 rounded-full border border-white/[0.05]">
            {isDemoMode ? 'Modo Demo' : 'Cuenta Conectada'}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="font-headline text-3xl sm:text-4xl text-[#e1e2eb] font-bold tracking-tight">
            Ajustes
          </h1>
          <span className="font-headline text-xs sm:text-sm text-[#4ae176] flex items-center gap-1 font-semibold">
            <Icon name="local_fire_department" size={16} />
            Racha: {profile.currentStreakDays} días
          </span>
        </div>
      </section>

      {/* User Card & Profile Quick Access */}
      <section className="rounded-2xl bg-[#1d2026] p-4 flex flex-col gap-3 shadow-md border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#272a31] flex items-center justify-center text-[#c3f400] border border-white/[0.1] font-headline font-bold text-lg">
              {profile.firstName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline text-base text-white font-bold">{profile.name}</h2>
              <span className="font-body text-xs text-[#c4c9ac]">{profile.email}</span>
              <span className="font-headline text-[10px] text-[#c3f400] font-semibold mt-0.5">
                {profile.phase}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenProfile}
            type="button"
            aria-label="Ver Perfil"
            className="w-9 h-9 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.06]"
          >
            <Icon name="person" size={18} />
          </button>
        </div>

        {/* Quick Action Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.04]">
          <button
            onClick={onOpenWeightModal}
            type="button"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#272a31] hover:bg-[#32353c] text-[#e1e2eb] font-headline text-xs font-semibold transition-colors cursor-pointer border border-white/[0.04]"
          >
            <Icon name="monitor_weight" size={15} className="text-[#c3f400]" />
            <span>Peso: {currentWeight}kg</span>
          </button>

          <button
            onClick={onOpenNotifications}
            type="button"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#272a31] hover:bg-[#32353c] text-[#e1e2eb] font-headline text-xs font-semibold transition-colors cursor-pointer border border-white/[0.04]"
          >
            <Icon name="notifications" size={15} className="text-[#7bd0ff]" />
            <span>Avisos</span>
          </button>

          <button
            onClick={onOpenHistory}
            type="button"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#272a31] hover:bg-[#32353c] text-[#e1e2eb] font-headline text-xs font-semibold transition-colors cursor-pointer border border-white/[0.04]"
          >
            <Icon name="history" size={15} className="text-[#4ae176]" />
            <span>Historial</span>
          </button>
        </div>
      </section>

      {/* Dataset & Licencia (Atribuciones correspondientes) */}
      <section className="rounded-2xl bg-[#191c22] p-4 sm:p-5 flex flex-col gap-3 shadow-md border border-[#c3f400]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#c3f400]/10 flex items-center justify-center text-[#c3f400]">
              <Icon name="menu_book" size={18} />
            </div>
            <div>
              <h2 className="font-headline text-base text-white font-bold">
                Dataset de Ejercicios & Licencia
              </h2>
              <span className="font-body text-xs text-[#c4c9ac]">
                Atribución oficial y créditos de medios
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#c3f400]/20 text-[#c3f400] font-headline text-[10px] font-bold">
            1,324 Ejercicios
          </span>
        </div>

        <p className="font-body text-xs text-[#c4c9ac] leading-relaxed">
          Esta aplicación utiliza la base de datos abierta de ejercicios del repositorio{' '}
          <strong className="text-white">hasaneyldrm/exercises-dataset</strong> con ilustraciones
          animadas en GIF e imágenes HD originales creadas por{' '}
          <strong className="text-white">Gym Visual</strong>.
        </p>

        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#101319] border border-white/[0.04]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c4c9ac] font-headline">Fuente original:</span>
            <a
              href="https://gymvisual.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c3f400] font-semibold hover:underline flex items-center gap-1"
            >
              gymvisual.com <Icon name="open_in_new" size={12} />
            </a>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c4c9ac] font-headline">Repositorio del Dataset:</span>
            <a
              href="https://github.com/hasaneyldrm/exercises-dataset"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c3f400] font-semibold hover:underline flex items-center gap-1"
            >
              GitHub exercises-dataset <Icon name="open_in_new" size={12} />
            </a>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c4c9ac] font-headline">Licencia de medios:</span>
            <span className="text-[#4ae176] font-semibold">Attribution (© Gym visual)</span>
          </div>
        </div>
      </section>

      {/* Progress & Performance Overview */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg text-white font-bold">Resumen de Rendimiento</h2>
          {/* Timeframe Filter Chips */}
          <div className="flex items-center gap-1.5">
            {periods.map((p) => {
              const isSelected = selectedPeriod === p.id;
              return (
                <button
                  key={p.id}
                  id={`ajustes-timeframe-${p.id}`}
                  onClick={() => setSelectedPeriod(p.id as 'semana' | 'mes' | '3meses' | 'anio')}
                  type="button"
                  className={`px-3 py-1 rounded-full font-headline text-[10px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#c3f400] text-[#161e00]'
                      : 'bg-[#272a31] text-[#c4c9ac] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Volume */}
          <div className="col-span-2 rounded-xl bg-[#1d2026] p-4 flex flex-col justify-between gap-2 shadow-md border border-white/[0.05]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#272a31] flex items-center justify-center text-[#c3f400]">
                  <Icon name="fitness_center" size={18} />
                </div>
                <span className="font-headline text-xs text-[#c4c9ac] font-medium">
                  Volumen Levantado
                </span>
              </div>
              <span className="font-headline text-[11px] font-bold text-[#4ae176]">
                {profile.monthlySessions} sesiones este {profile.monthName}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-3xl text-white font-bold">
                {profile.monthlyTonnageKg.toLocaleString()}
              </span>
              <span className="font-headline text-xs text-[#c4c9ac]">kg</span>
            </div>
          </div>

          {/* Sessions */}
          <div className="rounded-xl bg-[#1d2026] p-3.5 flex flex-col justify-between gap-1 shadow-md border border-white/[0.05]">
            <span className="font-headline text-xs text-[#c4c9ac] font-medium">Sesiones</span>
            <span className="font-headline text-2xl text-white font-bold">{profile.monthlySessions}</span>
            <span className="font-headline text-[10px] text-[#4ae176] font-semibold">
              {profile.weekGoalPercent}% cumplimiento
            </span>
          </div>

          {/* Time */}
          <div className="rounded-xl bg-[#1d2026] p-3.5 flex flex-col justify-between gap-1 shadow-md border border-white/[0.05]">
            <span className="font-headline text-xs text-[#c4c9ac] font-medium">Tiempo Total</span>
            <span className="font-headline text-2xl text-white font-bold">{profile.monthlyTotalTime}</span>
            <span className="font-headline text-[10px] text-[#c4c9ac] font-semibold">
              Media: {profile.monthlyAverageSession}
            </span>
          </div>
        </div>

        {/* Weekly Tonnage Chart */}
        <div className="rounded-2xl bg-[#1d2026] p-4 flex flex-col gap-3 shadow-md border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="font-headline text-xs text-[#c3f400] font-bold uppercase tracking-wider">
              Tonelaje Semanal
            </span>
            <span className="font-headline text-xs text-[#c4c9ac]">{selectedBar.tonnage}</span>
          </div>

          <div className="relative w-full h-32 flex items-end justify-between px-2 pt-2">
            {weeklyVolumes.map((wv) => {
              const isSelected = selectedBar.week === wv.week;
              const heightPercent =
                wv.tonnage > 0
                  ? `${Math.max(12, Math.round((wv.tonnage / maxVolume) * 100))}%`
                  : '6%';

              return (
                <div
                  key={wv.week}
                  onClick={() =>
                    setSelectedBar({
                      label: wv.label,
                      tonnage: `${wv.tonnage.toLocaleString()} kg`,
                      week: wv.week,
                    })
                  }
                  className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer"
                >
                  <div className="relative w-6 bg-[#272a31] rounded-full overflow-hidden flex flex-col justify-end h-24 hover:ring-1 hover:ring-[#c3f400]/40 transition-all">
                    <div
                      className={`w-full rounded-full transition-all duration-300 ${
                        isSelected || wv.isPeak
                          ? 'bg-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.5)]'
                          : 'bg-[#c3f400]/40 group-hover:bg-[#c3f400]'
                      }`}
                      style={{ height: heightPercent }}
                    />
                  </div>
                  <span
                    className={`font-headline text-[10px] ${
                      isSelected || wv.isPeak ? 'text-[#c3f400] font-bold' : 'text-[#c4c9ac]'
                    }`}
                  >
                    {wv.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Calendar Consistency */}
        <div className="rounded-2xl bg-[#1d2026] p-4 flex flex-col gap-3 shadow-md border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline text-sm text-white font-bold">Constancia Mensual</h3>
              <span className="font-body text-xs text-[#c4c9ac]">
                {activeDaysInMonth} días entrenados este mes
              </span>
            </div>
            <span className="font-headline text-xs font-bold bg-[#00b954] text-white px-2 py-0.5 rounded-full">
              {profile.weekGoalPercent}% Cumplido
            </span>
          </div>

          <div className="grid grid-cols-7 text-center font-headline text-[10px] text-[#c4c9ac] font-bold">
            <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthCalendarDays.map((item, idx) => {
              const isSelected = selectedCalendarDay === item.day;
              if (item.isOtherMonth) {
                return (
                  <div
                    key={idx}
                    className="h-7 rounded bg-[#272a31] flex items-center justify-center font-headline text-[10px] text-[#c4c9ac] opacity-30"
                  >
                    {item.day}
                  </div>
                );
              }
              if (item.isCurrentDay) {
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDay(item.day)}
                    className={`h-7 rounded bg-[#c3f400] text-[#161e00] flex items-center justify-center font-headline text-[10px] font-bold cursor-pointer ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    {item.day}
                  </button>
                );
              }
              if (item.active) {
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCalendarDay(item.day)}
                    className={`h-7 rounded bg-[#00b954] text-white flex items-center justify-center font-headline text-[10px] font-bold cursor-pointer ${
                      isSelected ? 'ring-2 ring-[#c3f400]' : ''
                    }`}
                  >
                    {item.day}
                  </button>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCalendarDay(item.day)}
                  className={`h-7 rounded bg-[#272a31] text-[#c4c9ac] flex items-center justify-center font-headline text-[10px] hover:bg-[#32353c] cursor-pointer ${
                    isSelected ? 'ring-1 ring-[#c3f400]' : ''
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* PRs */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mt-2">
            <Icon name="emoji_events" size={18} className="text-[#c3f400]" />
            <h3 className="font-headline text-base text-white font-bold">Récords Personales (1RM)</h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {personalRecords.map((pr) => (
              <div
                key={pr.id}
                className="rounded-xl bg-[#1d2026] p-3 flex items-center justify-between shadow-sm border border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#272a31] flex items-center justify-center text-[#c3f400]">
                    <Icon name={pr.iconName} size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline text-xs text-white font-bold">{pr.exercise}</span>
                    <span className="font-body text-[10px] text-[#c4c9ac]">{pr.date}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline text-lg text-[#c3f400] font-bold">{pr.weight}</span>
                  <span className="font-headline text-[10px] text-[#c4c9ac]">{pr.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Report & Session Management */}
      <section className="flex flex-col gap-3 pt-2">
        <button
          id="export-pdf-btn"
          onClick={onExportPdf}
          type="button"
          className="w-full py-3.5 px-4 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white font-headline text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-white/[0.08]"
        >
          <Icon name="share" size={18} />
          Exportar Informe de Rendimiento (.PDF)
        </button>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1d2026] border border-white/[0.04]">
          <div className="flex flex-col">
            <span className="font-headline text-xs text-white font-semibold">Estado de la Sesión</span>
            <span className="font-body text-[11px] text-[#c4c9ac]">
              {isDemoMode ? 'Modo Demostración Local' : 'Sesión activa en Supabase'}
            </span>
          </div>

          {isDemoMode ? (
            <button
              onClick={resetDemo}
              type="button"
              className="px-3 py-1.5 rounded-full bg-[#272a31] hover:bg-[#32353c] text-[#c3f400] font-headline text-xs font-semibold transition-colors cursor-pointer"
            >
              Reiniciar Demo
            </button>
          ) : (
            <button
              onClick={() => void logoutUser()}
              type="button"
              className="px-3 py-1.5 rounded-full bg-[#272a31] hover:bg-[#32353c] text-red-400 font-headline text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
