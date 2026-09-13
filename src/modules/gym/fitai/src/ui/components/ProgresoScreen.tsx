import React, { useState } from 'react';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

interface ProgresoScreenProps {
  onExportPdf: () => void;
}

export const ProgresoScreen: React.FC<ProgresoScreenProps> = ({
  onExportPdf,
}) => {
  const { profile, personalRecords, weeklyVolumes, monthCalendarDays } = useUiData();
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
      {/* Header telemetry and title */}
      <section className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse shadow-[0_0_8px_#c3f400]"></span>
            <span className="font-headline text-[10px] uppercase tracking-widest text-[#c3f400] font-bold">
              Rendimiento Atlético
            </span>
          </div>
          <span className="font-headline text-xs text-[#c4c9ac] bg-[#272a31] px-2.5 py-1 rounded-full border border-white/[0.05]">
            Actualizado hoy
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="font-headline text-3xl sm:text-4xl text-[#e1e2eb] font-bold tracking-tight">
            Progreso
          </h1>
          <span className="font-headline text-xs sm:text-sm text-[#4ae176] flex items-center gap-1 font-semibold">
            <Icon name="local_fire_department" size={16} />
            Racha: {profile.currentStreakDays} días
          </span>
        </div>

        {/* Timeframe Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar -mx-4 px-4">
          {periods.map((p) => {
            const isSelected = selectedPeriod === p.id;
            return (
              <button
                key={p.id}
                id={`timeframe-${p.id}`}
                onClick={() => setSelectedPeriod(p.id as 'semana' | 'mes' | '3meses' | 'anio')}
                type="button"
                className={`px-4 py-1.5 rounded-full font-headline text-xs font-semibold transition-all active:scale-95 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#c3f400] text-[#161e00] shadow-md'
                    : 'bg-[#272a31] text-[#c4c9ac] hover:text-white hover:bg-[#32353c] border border-white/[0.04]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Motivational Snapshot Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#191c22] p-4 shadow-md border border-white/[0.06]">
        <div className="flex items-start justify-between relative z-10 gap-3">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1d2026] text-[#c3f400] w-max border border-white/[0.06]">
              <Icon name="bolt" size={14} />
              <span className="font-headline text-[10px] font-bold uppercase tracking-wider">
                Estado Óptimo
              </span>
            </div>
            <p className="font-headline text-base sm:text-lg text-white font-bold tracking-tight">
              Carga semanal superada
            </p>
            <p className="font-body text-xs text-[#c4c9ac]">
              Estás en el top 5% de regularidad en tu categoría.
            </p>
          </div>

          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#1d2026] border border-white/[0.08]">
            <img
              className="w-full h-full object-cover"
              alt="Atleta enfocado ajustando zapatillas en gimnasio"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPQiv0lM94xRr_QYiS5QgwGyGQqbTXPPuJ0FPkze_cChVh837V2h9mWlvtENimH5o9tsecDE0WJEsroB3YMZYGMmXxlQ4fFeVzJxxX9-Vt0dngb1bCq8hnEpPRl7BLDZknkI4GTJUZ4_jeco8_Jg9zpoAqpb58h6f1080hP_PSFacKL4kpWKHD5DAnVisk2J2O4P3CxEPPQjBa5qjfCf4FPGKU1VRv5dR0YIGRHTUqq95fBC_7G2_NdQ"
            />
          </div>
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Metric: Volumen Levantado */}
        <div className="col-span-2 rounded-xl bg-[#1d2026] p-4 flex flex-col justify-between gap-3 shadow-md border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#272a31] flex items-center justify-center text-[#c3f400]">
                <Icon name="fitness_center" size={20} />
              </div>
              <span className="font-headline text-xs text-[#c4c9ac] font-medium">
                Volumen Levantado
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#272a31] px-2 py-0.5 rounded-full text-[#4ae176]">
              <Icon name="trending_up" size={14} />
              <span className="font-headline text-[11px] font-bold">
                {profile.monthlySessions} sesiones
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-3xl sm:text-4xl text-white font-bold tracking-tight">
                {profile.monthlyTonnageKg.toLocaleString()}
              </span>
              <span className="font-headline text-sm text-[#c4c9ac]">kg</span>
            </div>
            <span className="font-body text-xs text-[#c4c9ac]">
              este {profile.monthName}
            </span>
          </div>

          <div className="w-full bg-[#32353c] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#c3f400] h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(195,244,0,0.6)]"
              style={{ width: `${Math.min(100, profile.weekGoalPercent)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric: Sesiones */}
        <div className="rounded-xl bg-[#1d2026] p-4 flex flex-col justify-between gap-1 shadow-md border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="font-headline text-xs text-[#c4c9ac] font-medium">
              Sesiones
            </span>
            <div className="w-6 h-6 rounded-full bg-[#00b954] flex items-center justify-center text-white">
              <Icon name="check" size={14} />
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-headline text-2xl sm:text-3xl text-white font-bold">
              {profile.monthlySessions}
            </span>
            <span className="font-headline text-[11px] text-[#4ae176] font-semibold">
              {profile.weekGoalPercent}% del objetivo
            </span>
          </div>
          <span className="font-body text-xs text-[#c4c9ac] mt-1">
            Cumplimiento semanal
          </span>
        </div>

        {/* Metric: Tiempo Total */}
        <div className="rounded-xl bg-[#1d2026] p-4 flex flex-col justify-between gap-1 shadow-md border border-white/[0.05]">
          <div className="flex items-center justify-between">
            <span className="font-headline text-xs text-[#c4c9ac] font-medium">
              Tiempo Total
            </span>
            <div className="w-6 h-6 rounded-full bg-[#272a31] flex items-center justify-center text-[#e1e2eb]">
              <Icon name="schedule" size={14} />
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="font-headline text-2xl sm:text-3xl text-white font-bold">
              {profile.monthlyTotalTime}
            </span>
            <span className="font-headline text-[11px] text-[#c4c9ac] font-semibold">
              Media: {profile.monthlyAverageSession} / entreno
            </span>
          </div>
          <span className="font-body text-xs text-[#c4c9ac] mt-1">
            Durante {profile.monthName}
          </span>
        </div>
      </section>

      {/* Interactive Chart: Weekly Volume Progression */}
      <section className="rounded-2xl bg-[#1d2026] p-4 sm:p-5 flex flex-col gap-4 shadow-md border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-headline text-[10px] text-[#c3f400] uppercase tracking-wider font-bold">
              Distribución Semanal
            </span>
            <h2 className="font-headline text-lg text-white font-bold">
              Tonelaje por Semana
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c3f400]"></span>
            <span className="font-headline text-xs text-[#c4c9ac]">Carga real</span>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="relative w-full h-44 flex flex-col justify-end pt-2">
          {/* Horizontal Reference Guidelines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="w-full h-px bg-[#c4c9ac]"></div>
            <div className="w-full h-px bg-[#c4c9ac]"></div>
            <div className="w-full h-px bg-[#c4c9ac]"></div>
            <div className="w-full h-px bg-[#c4c9ac]"></div>
          </div>

          {/* Bars Container */}
          <div className="relative z-10 w-full h-36 flex items-end justify-between px-2">
            {weeklyVolumes.map((wv) => {
              const isSelected = selectedBar.week === wv.week;
              const heightPercent =
                wv.tonnage > 0
                  ? `${Math.max(10, Math.round((wv.tonnage / maxVolume) * 100))}%`
                  : '4%';

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
                  className="flex flex-col items-center gap-2 flex-1 group cursor-pointer"
                >
                  <div className="relative w-6 sm:w-7 bg-[#272a31] rounded-full overflow-hidden flex flex-col justify-end h-28 hover:ring-1 hover:ring-[#c3f400]/40 transition-all">
                    <div
                      className={`w-full rounded-full transition-all duration-300 ${
                        isSelected || wv.isPeak
                          ? 'bg-[#c3f400] shadow-[0_0_12px_rgba(195,244,0,0.5)]'
                          : 'bg-[#c3f400]/40 group-hover:bg-[#c3f400]'
                      }`}
                      style={{ height: heightPercent }}
                    ></div>
                  </div>
                  <span
                    className={`font-headline text-xs ${
                      isSelected || wv.isPeak
                        ? 'text-[#c3f400] font-bold'
                        : 'text-[#c4c9ac]'
                    }`}
                  >
                    {wv.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Chart Metric Drawer */}
        <div className="flex items-center justify-between bg-[#272a31] p-3 rounded-xl transition-all border border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Icon name="insights" size={18} className="text-[#c3f400]" />
            <span className="font-headline text-xs sm:text-sm text-white font-medium">
              {selectedBar.label}
            </span>
          </div>
          <span className="font-headline text-base sm:text-lg text-[#c3f400] font-bold">
            {selectedBar.tonnage}
          </span>
        </div>
      </section>

      {/* Consistency Heatmap & Calendar */}
      <section className="rounded-2xl bg-[#1d2026] p-4 sm:p-5 flex flex-col gap-3 shadow-md border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#272a31] flex items-center justify-center text-[#4ae176]">
              <Icon name="calendar_month" size={18} />
            </div>
            <div>
              <h2 className="font-headline text-base sm:text-lg text-white font-bold">
                Constancia Mensual
              </h2>
              <span className="font-body text-xs text-[#c4c9ac]">
                {profile.monthName.charAt(0).toUpperCase() + profile.monthName.slice(1)}:{' '}
                {activeDaysInMonth} días activos
              </span>
            </div>
          </div>
          <span className="font-headline text-xs font-bold bg-[#00b954] text-white px-2.5 py-1 rounded-full">
            {profile.weekGoalPercent}% Éxito
          </span>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 text-center font-headline text-xs text-[#c4c9ac] font-bold py-1">
          <span>L</span>
          <span>M</span>
          <span>X</span>
          <span>J</span>
          <span>V</span>
          <span>S</span>
          <span>D</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {monthCalendarDays.map((item, idx) => {
            const isSelected = selectedCalendarDay === item.day;

            if (item.isOtherMonth) {
              return (
                <div
                  key={idx}
                  className="h-8 rounded-lg bg-[#272a31] flex items-center justify-center font-headline text-xs text-[#c4c9ac] opacity-30"
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
                  className={`h-8 rounded-lg bg-[#c3f400] text-[#161e00] flex items-center justify-center font-headline text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95 ${
                    isSelected ? 'ring-2 ring-white shadow-[0_0_10px_#c3f400]' : ''
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
                  className={`h-8 rounded-lg bg-[#00b954] text-white flex items-center justify-center font-headline text-xs font-bold relative cursor-pointer hover:brightness-110 transition-all ${
                    isSelected ? 'ring-2 ring-[#c3f400]' : ''
                  }`}
                >
                  {item.day}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6bff8f] absolute bottom-1"></span>
                </button>
              );
            }

            return (
              <button
                key={idx}
                onClick={() => setSelectedCalendarDay(item.day)}
                className={`h-8 rounded-lg bg-[#272a31] text-[#c4c9ac] flex items-center justify-center font-headline text-xs hover:bg-[#32353c] cursor-pointer transition-colors ${
                  isSelected ? 'ring-1 ring-[#c3f400]' : ''
                }`}
              >
                {item.day}
              </button>
            );
          })}
        </div>
      </section>

      {/* Personal Records (1RM) Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon name="trophy" size={22} className="text-[#c3f400]" />
          <h2 className="font-headline text-base sm:text-lg text-white font-bold">
            Récords Personales (1 repetición máxima)
          </h2>
        </div>

        {/* PR Cards List */}
        <div className="flex flex-col gap-2">
          {personalRecords.map((pr) => {
            if (pr.isRecent) {
              return (
                <div
                  key={pr.id}
                  className="rounded-xl bg-[#272a31] p-3.5 flex items-center justify-between shadow-md relative overflow-hidden border border-white/[0.06]"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c3f400]"></div>
                  <div className="flex items-center gap-3 pl-1">
                    <div className="w-10 h-10 rounded-lg bg-[#1d2026] flex items-center justify-center text-[#c3f400] border border-white/[0.06]">
                      <Icon name={pr.iconName} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-sm sm:text-base text-white font-bold">
                          {pr.exercise}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-[10px] font-bold flex items-center gap-1">
                          <Icon name="emoji_events" size={12} />{' '}
                          Récord nuevo
                        </span>
                      </div>
                      <span className="font-body text-xs text-[#4ae176]">
                        Récord superado {pr.date} ({pr.delta})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="font-headline text-2xl sm:text-3xl text-[#c3f400] font-bold">
                        {pr.weight}
                      </span>
                      <span className="font-headline text-xs text-[#c4c9ac] font-semibold">
                        {pr.unit}
                      </span>
                    </div>
                    <span className="font-headline text-[10px] text-[#c4c9ac]">
                      1 rep máx
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pr.id}
                className="rounded-xl bg-[#1d2026] p-3.5 flex items-center justify-between shadow-sm border border-white/[0.04] hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#272a31] flex items-center justify-center text-white">
                    <Icon name={pr.iconName} size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline text-sm sm:text-base text-white font-semibold">
                      {pr.exercise}
                    </span>
                    <span className="font-body text-xs text-[#c4c9ac]">
                      Último test: {pr.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline text-2xl sm:text-3xl text-white font-bold">
                      {pr.weight}
                    </span>
                    <span className="font-headline text-xs text-[#c4c9ac] font-semibold">
                      {pr.unit}
                    </span>
                  </div>
                  <span className="font-headline text-[10px] text-[#c4c9ac]">
                    1 rep máx
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Measurement Evolution Card (Weight & Sparkline) */}
      <section className="rounded-2xl bg-[#1d2026] p-4 sm:p-5 flex flex-col gap-4 shadow-md border border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#272a31] flex items-center justify-center text-[#7bd0ff]">
              <Icon name="monitor_weight" size={18} />
            </div>
            <div>
              <h2 className="font-headline text-base sm:text-lg text-white font-bold">
                Peso Corporal
              </h2>
              <span className="font-body text-xs text-[#c4c9ac]">
                Definición controlada
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#272a31] px-2.5 py-1 rounded-full text-[#4ae176]">
            {profile.weightDelta !== null && profile.weightDelta !== 0 ? (
              <>
                <Icon
                  name={profile.weightDelta > 0 ? 'arrow_upward' : 'arrow_downward'}
                  size={14}
                />
                <span className="font-headline text-xs font-bold">
                  {profile.weightDelta > 0 ? '+' : ''}
                  {profile.weightDelta} kg
                </span>
              </>
            ) : (
              <span className="font-headline text-xs font-bold">Estable</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-3xl sm:text-4xl text-white font-bold">
                {currentWeight}
              </span>
              <span className="font-headline text-base text-[#c4c9ac] font-semibold">
                kg
              </span>
            </div>
            <span className="font-body text-xs text-[#c4c9ac]">
              Últimos 30 días
            </span>
          </div>

          {/* Sparkline SVG */}
          <div className="flex-1 h-14 relative flex items-center">
            <svg
              className="w-full h-full overflow-visible"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 160 50"
            >
              <path
                d="M0,15 Q30,22 55,20 T105,32 T160,42"
                fill="none"
                stroke="#4ae176"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* Data Points */}
              <circle cx="0" cy="15" fill="#4ae176" r="3" />
              <circle cx="55" cy="20" fill="#4ae176" r="3" />
              <circle cx="105" cy="32" fill="#4ae176" r="3" />
              <circle
                cx="160"
                cy="42"
                fill="#c3f400"
                r="4"
                className="shadow-[0_0_8px_#c3f400]"
              />
            </svg>
          </div>
        </div>

        {/* Quick Micro Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 bg-[#191c22] p-2.5 rounded-xl border border-white/[0.03]">
            <Icon name="water_drop" size={18} className="text-[#c4c9ac]" />
            <div className="flex flex-col">
              <span className="font-headline text-[10px] text-[#c4c9ac]">
                Grasa Estimada
              </span>
              <span className="font-headline text-xs text-white font-bold">
                {profile.bodyFatPercent !== null ? `${profile.bodyFatPercent}%` : '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#191c22] p-2.5 rounded-xl border border-white/[0.03]">
            <Icon name="accessibility_new" size={18} className="text-[#c4c9ac]" />
            <div className="flex flex-col">
              <span className="font-headline text-[10px] text-[#c4c9ac]">
                Masa Magra
              </span>
              <span className="font-headline text-xs text-white font-bold">
                {profile.leanMassKg !== null ? `${profile.leanMassKg} kg` : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Export CTA Button */}
      <div className="flex items-center justify-between pb-2">
        <button
          id="export-pdf-btn"
          onClick={onExportPdf}
          type="button"
          className="w-full py-3.5 px-4 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white font-headline text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer border border-white/[0.08]"
        >
          <Icon name="share" size={18} />
          Exportar Informe de Rendimiento (.PDF)
        </button>
      </div>
    </div>
  );
};
