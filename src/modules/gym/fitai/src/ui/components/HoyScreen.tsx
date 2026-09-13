import React from 'react';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

interface HoyScreenProps {
  onStartWorkout: () => void;
  onOpenWeightModal: () => void;
  onOpenMealModal: () => void;
  onOpenCoachNotes: () => void;
  onOpenHistory: () => void;
  todayCalories: number;
}

export const HoyScreen: React.FC<HoyScreenProps> = ({
  onStartWorkout,
  onOpenWeightModal,
  onOpenMealModal,
  onOpenCoachNotes,
  onOpenHistory,
  todayCalories,
}) => {
  const { profile, nextSession, recentActivity, weekSchedule } = useUiData();
  const session = nextSession;

  const completedCount = weekSchedule.filter((d) => d.completed).length;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 gap-5 pb-28 pt-2">
      {/* Status & Greeting Section */}
      <section className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center justify-between">
          <span className="font-headline text-xs font-semibold uppercase tracking-wider text-[#c3f400] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse shadow-[0_0_8px_#c3f400]"></span>
            {profile.status}
          </span>
          <span className="font-headline text-xs text-[#c4c9ac] bg-[#1d2026] px-2.5 py-1 rounded-full border border-white/[0.06]">
            {profile.phase}
          </span>
        </div>

        <h1 className="font-headline text-3xl sm:text-4xl text-[#e1e2eb] tracking-tight font-bold">
          ¡A por ello, {profile.firstName}!
        </h1>

        <p className="font-body text-sm text-[#c4c9ac] flex items-center gap-2">
          <span>Semana en curso</span>
          <span className="w-1 h-1 rounded-full bg-[#444933]"></span>
          <span className="text-white font-medium">Día: {session?.focus ?? 'Prepárate'}</span>
        </p>
      </section>

      {/* Telemetry Metric Cards */}
      <section className="grid grid-cols-3 gap-2.5">
        {/* Streak */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[#1d2026] border border-white/[0.05] shadow-md hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline text-[10px] text-[#c4c9ac] uppercase tracking-wider font-bold">
              Racha
            </span>
            <span className="text-sm select-none">🔥</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg text-white font-bold tracking-tight">
              {profile.currentStreakDays} Días
            </span>
            <span className="font-headline text-[11px] text-[#4ae176] font-semibold">
              Imparable
            </span>
          </div>
        </div>

        {/* Calories Today */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[#1d2026] border border-white/[0.05] shadow-md hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline text-[10px] text-[#c4c9ac] uppercase tracking-wider font-bold">
              Hoy
            </span>
            <Icon name="local_fire_department" size={18} className="text-[#c3f400]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg text-white font-bold tracking-tight">
              {todayCalories}
            </span>
            <span className="font-body text-[11px] text-[#c4c9ac]">
              kcal quemadas
            </span>
          </div>
        </div>

        {/* Weekly Duration */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[#1d2026] border border-white/[0.05] shadow-md hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-headline text-[10px] text-[#c4c9ac] uppercase tracking-wider font-bold">
              Semana
            </span>
            <Icon name="timer" size={18} className="text-[#7bd0ff]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg text-white font-bold tracking-tight">
              {profile.weekDuration}
            </span>
            <span className="font-body text-[11px] text-[#c4c9ac]">
              {profile.weekGoalPercent}% del objetivo
            </span>
          </div>
        </div>
      </section>

      {/* Siguiente Sesión Banner Card */}
      {session ? (
      <section className="relative overflow-hidden rounded-2xl bg-[#272a31] border border-white/[0.08] shadow-xl">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#c3f400]/10 blur-3xl pointer-events-none"></div>

        <div className="relative p-4 sm:p-5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c3f400]/15 text-[#c3f400] font-headline text-[11px] font-semibold tracking-wider uppercase border border-[#c3f400]/20">
<Icon name="bolt" size={15} />
              Siguiente Sesión
            </span>
            <span className="font-headline text-xs text-[#c4c9ac]">
              Hoy • 18:30
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-xl sm:text-2xl text-white font-bold tracking-tight">
              {session.title}
            </h2>
            <div className="flex items-center flex-wrap gap-2 text-xs text-[#c4c9ac]">
              <span className="flex items-center gap-1 text-white font-medium">
                <Icon name="schedule" size={16} className="text-[#c3f400]" />
                {session.durationLabel}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon name="fitness_center" size={16} />
                {session.exercisesCount} ejercicios
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-[#1d2026] text-[#c4c9ac] font-headline text-[10px] uppercase font-semibold">
                {session.difficulty}
              </span>
            </div>
          </div>

          {/* Photo Banner with Gym Athlete */}
          <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#0b0e14] border border-white/[0.06]">
            <img
              className="w-full h-full object-cover opacity-60"
              alt="Atleta entrenando fuerza en gimnasio oscuro"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6kgC4viI2sw8REitFkEC2LuOfor75A2fuP77nJ8jNvtwUFzOrY-YiSreSGc5xUYolNWGXKr6bF83t9_rG17XfoZanO5XbBOLfNzrndKJS3BFwSY9WGCXc2q4glQIspfnlOacYm1SsZeqNtbIyruGN5bEhCirLBrklTGxaODMzx906hODQEikwGo9xBUcFujkjN6T_kJPjMYNzybGogs9rKKs_HYIbizEmTYmSib5REipslhw2P-v-FQ"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d2026] via-[#1d2026]/40 to-transparent flex items-end p-3">
              <p className="font-headline text-xs text-[#e1e2eb] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400]"></span>
                Objetivo de hoy: Sobrecarga progresiva en Press Banca
              </p>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            id="start-workout-main-btn"
            onClick={onStartWorkout}
            type="button"
            className="w-full h-13 py-3 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-base font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(195,244,0,0.35)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Icon name="play_arrow" size={24} />
            <span>Comenzar Entrenamiento Ahora</span>
          </button>
        </div>
      </section>
      ) : (
      <section className="relative overflow-hidden rounded-2xl bg-[#1d2026] border border-white/[0.06] shadow-md">
        <div className="p-4 sm:p-5 flex flex-col gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c4c9ac]/15 text-[#c4c9ac] font-headline text-[11px] font-semibold tracking-wider uppercase border border-white/[0.08]">
            <Icon name="bolt" size={15} />
            Siguiente Sesión
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-lg sm:text-xl text-white font-bold tracking-tight">
              Aún no tienes una sesión programada
            </h2>
            <p className="font-body text-sm text-[#c4c9ac]">
              Ve a Rutinas para crear tu primera rutina personalizada y
              empezar a entrenar.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Consistencia Semanal */}
      <section className="flex flex-col gap-3 p-4 rounded-xl bg-[#1d2026] border border-white/[0.05] shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="event_available" size={20} className="text-[#c3f400]" />
            <h3 className="font-headline text-base text-white font-bold">
              Consistencia Semanal
            </h3>
          </div>
          <span className="font-headline text-xs text-[#4ae176] font-bold">
            {completedCount} / 7 DÍAS
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weekSchedule.map((item) => (
            <div
              key={item.day}
              title={`${item.day}: ${item.completed ? 'Entrenado' : 'Descanso'}`}
              className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all ${
                item.isToday
                  ? 'bg-[#c3f400]/15 ring-1 ring-[#c3f400]/40 shadow-[0_0_12px_rgba(195,244,0,0.18)]'
                  : 'bg-[#191c22]'
              } ${!item.completed && !item.isToday ? 'opacity-60' : ''}`}
            >
              <span
                className={`font-headline text-[11px] font-bold ${
                  item.isToday ? 'text-[#c3f400]' : 'text-[#c4c9ac]'
                }`}
              >
                {item.day}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  item.completed
                    ? 'bg-[#c3f400] text-[#161e00]'
                    : item.isToday
                    ? 'bg-[#c3f400] text-[#161e00] animate-bounce'
                    : 'bg-[#32353c] text-[#c4c9ac]'
                }`}
              >
                {item.completed ? (
                  <Icon name="check" size={16} />
                ) : item.isToday ? (
                  <Icon name="fitness_center" size={16} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#444933]"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actividad Reciente */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-base text-white font-bold">
            Actividad Reciente
          </h3>
          <button
            id="view-history-btn"
            onClick={onOpenHistory}
            className="font-headline text-xs text-[#c3f400] hover:underline font-semibold"
          >
            Ver historial
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#1d2026] border border-white/[0.05] hover:border-white/[0.12] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-lg bg-[#272a31] flex items-center justify-center"
                  style={{ color: item.color }}
                >
                  <Icon name={item.icon} size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-sm text-white font-semibold">
                    {item.title}
                  </span>
                  <span className="font-body text-xs text-[#c4c9ac]">
                    {item.dateLabel} • {item.calories}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {item.tag ? (
                  <span
                    className="px-2 py-0.5 rounded-full bg-[#4ae176]/15 text-[#4ae176] font-headline text-[10px] font-bold flex items-center gap-1 border border-[#4ae176]/20"
                  >
                    <Icon name="emoji_events" size={13} />
                    {item.tag}
                  </span>
                ) : (
                  <span className="font-headline text-[10px] text-[#4ae176] font-bold">
                    Completado
                  </span>
                )}
                <span className="font-headline text-[11px] text-[#c4c9ac] mt-1">
                  {item.volume} vol
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="flex flex-col gap-2 pt-1">
        <span className="font-headline text-[11px] text-[#c4c9ac] uppercase tracking-wider font-bold">
          Acciones Rápidas
        </span>
        <div className="grid grid-cols-3 gap-2">
          {/* Quick Action: Peso */}
          <button
            id="quick-action-weight"
            onClick={onOpenWeightModal}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1d2026] hover:bg-[#272a31] border border-white/[0.05] transition-all active:scale-95 text-center cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#272a31] group-hover:bg-[#101319] flex items-center justify-center text-[#c3f400] transition-colors">
              <Icon name="monitor_weight" size={20} />
            </div>
            <span className="font-headline text-xs text-[#e1e2eb] font-semibold leading-tight">
              Registrar Peso
            </span>
          </button>

          {/* Quick Action: Comida */}
          <button
            id="quick-action-food"
            onClick={onOpenMealModal}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1d2026] hover:bg-[#272a31] border border-white/[0.05] transition-all active:scale-95 text-center cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#272a31] group-hover:bg-[#101319] flex items-center justify-center text-[#4ae176] transition-colors">
              <Icon name="restaurant" size={20} />
            </div>
            <span className="font-headline text-xs text-[#e1e2eb] font-semibold leading-tight">
              Comida Rápida
            </span>
          </button>

          {/* Quick Action: Coach */}
          <button
            id="quick-action-coach"
            onClick={onOpenCoachNotes}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#1d2026] hover:bg-[#272a31] border border-white/[0.05] transition-all active:scale-95 text-center cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#272a31] group-hover:bg-[#101319] flex items-center justify-center text-[#7bd0ff] transition-colors">
              <Icon name="sticky_note_2" size={20} />
            </div>
            <span className="font-headline text-xs text-[#e1e2eb] font-semibold leading-tight">
              Notas Coach
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};
