import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Exercise, ExerciseSet } from '../types';
import { useUiData } from '../data/store';
import { ExerciseImage } from './ExerciseImage';
import { Icon } from './Icon';

interface EntrenarScreenProps {
  onFinishWorkout: (summary: { durationSeconds: number; volumeKg: number; setsCompleted: number }) => void;
  onOpenVideoModal: (exercise: Exercise) => void;
}

export const EntrenarScreen: React.FC<EntrenarScreenProps> = ({
  onFinishWorkout,
  onOpenVideoModal,
}) => {
  const { activeExercises, activeWorkoutTitle } = useUiData();
  // Session Chronometer (ticking seconds)
  const [sessionSeconds, setSessionSeconds] = useState(34 * 60 + 12);
  const [isSessionPaused, setIsSessionPaused] = useState(false);

  // Active exercises list (allows adding sets or swapping active exercise)
  const [exercises, setExercises] = useState<Exercise[]>(() => activeExercises);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);

  // Rest Timer State
  const initialRest = 90;
  const [restRemaining, setRestRemaining] = useState<number>(71); // Starts at 01:11
  const [isRestActive, setIsRestActive] = useState<boolean>(true);
  const [currentSetTransition, setCurrentSetTransition] = useState<string>('Serie 2 → Serie 3');

  // Input states for the active set
  const currentExercise = exercises[activeExerciseIndex] || exercises[0];
  const activeSet = currentExercise.sets.find((s) => s.isActive) || currentExercise.sets.find((s) => !s.completed) || currentExercise.sets[0];
  
  const [inputWeight, setInputWeight] = useState<number>(activeSet?.weight ?? 82.5);
  const [inputReps, setInputReps] = useState<number>(activeSet?.reps ?? 8);

  // Sync inputs when active exercise changes
  useEffect(() => {
    if (activeSet) {
      setInputWeight(activeSet.weight);
      setInputReps(activeSet.reps);
    }
  }, [activeExerciseIndex, activeSet?.id]);

  // Session timer tick
  useEffect(() => {
    if (isSessionPaused) return;
    const interval = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionPaused]);

  // Rest countdown tick
  useEffect(() => {
    if (!isRestActive || restRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          setIsRestActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestActive, restRemaining]);

  // Format helpers
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddRestTime = () => {
    setRestRemaining((prev) => prev + 30);
    setIsRestActive(true);
  };

  const handleSkipRest = () => {
    setRestRemaining(0);
    setIsRestActive(false);
  };

  // Complete active set
  const handleCompleteActiveSet = () => {
    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#c3f400', '#4ae176', '#ffffff'],
      });
    } catch {
      // Ignore if canvas not supported
    }

    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[activeExerciseIndex] };
      const currentSetIndex = ex.sets.findIndex((s) => s.id === activeSet.id);

      if (currentSetIndex !== -1) {
        ex.sets[currentSetIndex] = {
          ...ex.sets[currentSetIndex],
          completed: true,
          isActive: false,
          weight: inputWeight,
          reps: inputReps,
        };

        // Activate next set if exists
        if (currentSetIndex + 1 < ex.sets.length) {
          ex.sets[currentSetIndex + 1] = {
            ...ex.sets[currentSetIndex + 1],
            isActive: true,
          };
          setCurrentSetTransition(`Serie ${currentSetIndex + 1} → Serie ${currentSetIndex + 2}`);
        } else {
          setCurrentSetTransition(`¡Ejercicio ${activeExerciseIndex + 1} completado!`);
        }
      }

      updated[activeExerciseIndex] = ex;
      return updated;
    });

    // Reset and start rest timer
    setRestRemaining(90);
    setIsRestActive(true);
  };

  // Toggle or edit a set manually
  const handleToggleSetComplete = (setId: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[activeExerciseIndex] };
      ex.sets = ex.sets.map((s) =>
        s.id === setId ? { ...s, completed: !s.completed } : s
      );
      updated[activeExerciseIndex] = ex;
      return updated;
    });
  };

  // Add new set to active exercise
  const handleAddSet = () => {
    setExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[activeExerciseIndex] };
      const nextSetNumber = ex.sets.length + 1;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ExerciseSet = {
        id: Date.now(),
        setNumber: nextSetNumber,
        weight: lastSet ? lastSet.weight : 80,
        reps: lastSet ? lastSet.reps : 8,
        completed: false,
        isActive: false,
      };
      ex.sets = [...ex.sets, newSet];
      updated[activeExerciseIndex] = ex;
      return updated;
    });
  };

  // Calculate stats for finish summary
  const totalVolume = exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((sAcc, s) => {
        return s.completed ? sAcc + s.weight * s.reps : sAcc;
      }, 0)
    );
  }, 0);

  const totalCompletedSets = exercises.reduce((acc, ex) => {
    return acc + ex.sets.filter((s) => s.completed).length;
  }, 0);

  const handleFinish = () => {
    onFinishWorkout({
      durationSeconds: sessionSeconds,
      volumeKg: totalVolume > 0 ? totalVolume : 4250,
      setsCompleted: totalCompletedSets,
    });
  };

  // Progress bar calculation for rest
  const restPercentage = Math.min(100, Math.max(0, (restRemaining / initialRest) * 100));

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 gap-5 pb-28 pt-2">
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="w-16 h-16 rounded-full bg-[#1d2026] border border-white/[0.06] flex items-center justify-center text-[#c4c9ac]">
            <Icon name="fitness_center" size={32} />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-lg text-white font-bold">
              Aún no hay ejercicios
            </h2>
            <p className="font-body text-sm text-[#c4c9ac] max-w-xs">
              Configura tu primera rutina en la pestaña Rutinas para comenzar a entrenar.
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
      {exercises.length > 0 && (
        <>
      {/* Session Top Telemetry Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ae176] animate-pulse shadow-[0_0_8px_#4ae176]"></span>
            <span className="font-headline text-xs uppercase tracking-wider text-[#4ae176] font-bold">
              En Vivo
            </span>
          </div>
          <h1 className="font-headline text-2xl text-white font-bold tracking-tight truncate">
            {activeWorkoutTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Glowing Digital Chrono Pill */}
          <button
            onClick={() => setIsSessionPaused(!isSessionPaused)}
            title={isSessionPaused ? 'Reanudar cronómetro' : 'Pausar cronómetro'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#272a31] border border-white/[0.08] shadow-[0_0_14px_rgba(195,244,0,0.18)] hover:bg-[#32353c] transition-all cursor-pointer"
          >
            <Icon
              name="timelapse"
              size={18}
              className={`text-[#c3f400] ${!isSessionPaused ? 'animate-spin' : ''}`}
              style={{ animationDuration: '8s' }}
            />
            <span className="font-headline text-sm text-[#c3f400] tabular-nums font-bold">
              {formatTime(sessionSeconds)}
            </span>
          </button>

          {/* Finish Session Button */}
          <button
            id="finish-session-btn"
            onClick={handleFinish}
            className="flex items-center justify-center h-9 px-3.5 rounded-full bg-[#32353c] hover:bg-[#3d424b] text-white font-headline text-xs font-semibold border border-white/[0.08] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Ambient Rest Timer HUD Widget */}
      <div className="relative overflow-hidden rounded-2xl bg-[#272a31] p-4 shadow-lg flex flex-col gap-3 border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Icon name="snooze" size={18} className="text-[#c3f400]" />
            <span className="font-headline text-xs uppercase text-[#c4c9ac] font-bold tracking-wider">
              Tiempo de Descanso
            </span>
          </div>
          <span className="font-headline text-xs text-[#4ae176] font-semibold px-2.5 py-0.5 rounded-full bg-[#0b0e14]/80 border border-[#4ae176]/20">
            {currentSetTransition}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-4xl sm:text-5xl text-[#c3f400] font-bold tabular-nums tracking-tight drop-shadow-[0_0_10px_rgba(195,244,0,0.3)]">
              {formatTime(restRemaining)}
            </span>
            <span className="font-headline text-xs text-[#c4c9ac] uppercase font-bold">
              seg
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="add-rest-btn"
              onClick={handleAddRestTime}
              className="h-9 px-3 rounded-full bg-[#32353c] hover:bg-[#3d424b] text-white font-headline text-xs font-semibold active:scale-95 transition-all cursor-pointer"
            >
              +30s
            </button>
            <button
              id="skip-rest-btn"
              onClick={handleSkipRest}
              className="h-9 px-3 rounded-full bg-[#0b0e14] hover:bg-[#1d2026] text-[#c4c9ac] hover:text-white font-headline text-xs font-semibold active:scale-95 transition-all cursor-pointer border border-white/[0.06]"
            >
              Saltar
            </button>
          </div>
        </div>

        {/* Active Timer Progress Bar */}
        <div className="w-full h-2 rounded-full bg-[#0b0e14] overflow-hidden">
          <div
            className="h-full bg-[#c3f400] rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(195,244,0,0.8)]"
            style={{ width: `${restPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Focused Active Exercise Card */}
      <div className="rounded-2xl bg-[#1d2026] p-4 sm:p-5 flex flex-col gap-4 shadow-md border border-white/[0.06] relative">
        {/* Exercise Header info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-headline text-[10px] uppercase text-[#c3f400] tracking-wider px-2.5 py-0.5 rounded-full bg-[#272a31] font-bold">
                Ejercicio {activeExerciseIndex + 1} de {exercises.length}
              </span>
              {currentExercise.pr && (
                <span className="flex items-center gap-1 text-[#4ae176] font-headline text-xs font-semibold">
                  <Icon name="workspace_premium" size={13} />
                  {currentExercise.pr}
                </span>
              )}
            </div>
            <h2 className="font-headline text-xl sm:text-2xl text-white font-bold">
              {currentExercise.name}
            </h2>
            <p className="font-body text-xs text-[#c4c9ac] mt-0.5">
              Enfoque: {currentExercise.targetMuscles}
            </p>
          </div>

          <button
            id="exercise-video-btn"
            onClick={() => onOpenVideoModal(currentExercise)}
            title="Ver demostración animada"
            className="w-10 h-10 rounded-full bg-[#272a31] hover:bg-[#32353c] flex items-center justify-center text-[#c4c9ac] hover:text-[#c3f400] transition-colors border border-white/[0.06] cursor-pointer"
          >
            <Icon name="videocam" size={20} />
          </button>
        </div>

        {/* Demostración animada del ejercicio (dataset Gym Visual) */}
        {(currentExercise.gifUrl || currentExercise.imageUrl) && (
          <div className="rounded-xl overflow-hidden border border-white/[0.06] shadow-md">
            <ExerciseImage
              gifUrl={currentExercise.gifUrl}
              imageUrl={currentExercise.imageUrl}
              alt={currentExercise.name}
              attribution={currentExercise.attribution}
              className="aspect-video w-full"
            />
          </div>
        )}

        {/* Interactive Sets Table */}
        <div className="flex flex-col gap-2 mt-1">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[#c4c9ac] font-headline text-[11px] uppercase tracking-wider font-bold">
            <span className="col-span-2 text-center">Set</span>
            <span className="col-span-3 text-center">Peso</span>
            <span className="col-span-3 text-center">Reps</span>
            <span className="col-span-4 text-center">Estado</span>
          </div>

          {/* Sets List */}
          {currentExercise.sets.map((set) => {
            const isThisSetActive = set.id === activeSet?.id;

            if (isThisSetActive && !set.completed) {
              // ACTIVE FOCUSED SET ROW
              return (
                <div
                  key={set.id}
                  className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-[#272a31] border border-[#c3f400]/40 shadow-[0_0_18px_rgba(195,244,0,0.14)]"
                >
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <span className="font-headline text-2xl text-[#c3f400] font-bold">
                      {set.setNumber}
                    </span>
                    <span className="font-headline text-[9px] uppercase text-[#c3f400] font-bold">
                      Activa
                    </span>
                  </div>

                  {/* Weight Stepper & Input */}
                  <div className="col-span-3 flex flex-col items-center justify-center bg-[#0b0e14] rounded-xl py-1.5 px-1 border border-white/[0.08]">
                    <span className="font-headline text-[9px] text-[#c4c9ac] font-bold">
                      PESO
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        id="set-weight-input"
                        type="number"
                        step="0.5"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(parseFloat(e.target.value) || 0)}
                        className="w-13 text-center bg-transparent font-headline text-xl text-white focus:outline-none tabular-nums font-bold"
                      />
                    </div>
                    <span className="font-headline text-[10px] text-[#c4c9ac]">
                      kg
                    </span>
                  </div>

                  {/* Reps Stepper & Input */}
                  <div className="col-span-3 flex flex-col items-center justify-center bg-[#0b0e14] rounded-xl py-1.5 px-1 border border-white/[0.08]">
                    <span className="font-headline text-[9px] text-[#c4c9ac] font-bold">
                      REPS
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        id="set-reps-input"
                        type="number"
                        value={inputReps}
                        onChange={(e) => setInputReps(parseInt(e.target.value) || 0)}
                        className="w-10 text-center bg-transparent font-headline text-xl text-white focus:outline-none tabular-nums font-bold"
                      />
                    </div>
                    <span className="font-body text-[10px] text-[#c4c9ac]">
                      meta {set.targetReps ?? set.reps}
                    </span>
                  </div>

                  {/* Complete Action Button */}
                  <div className="col-span-4 flex justify-center">
                    <button
                      id="complete-set-active-btn"
                      onClick={handleCompleteActiveSet}
                      title="Marcar serie completada"
                      className="w-12 h-12 rounded-full bg-[#c3f400] text-[#161e00] flex items-center justify-center shadow-[0_0_16px_rgba(195,244,0,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                    >
                      <Icon name="done" size={28} />
                    </button>
                  </div>
                </div>
              );
            }

            // COMPLETED SET ROW
            if (set.completed) {
              return (
                <div
                  key={set.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#191c22] border border-white/[0.04] transition-colors"
                >
                  <div className="col-span-2 flex items-center justify-center font-headline text-base text-[#c4c9ac] font-bold">
                    {set.setNumber}
                  </div>
                  <div className="col-span-3 text-center font-headline text-sm text-white tabular-nums font-semibold">
                    {set.weight}{' '}
                    <span className="text-xs text-[#c4c9ac] font-normal">kg</span>
                  </div>
                  <div className="col-span-3 text-center font-headline text-sm text-white tabular-nums font-semibold">
                    {set.reps}
                  </div>
                  <div className="col-span-4 flex justify-center">
                    <button
                      onClick={() => handleToggleSetComplete(set.id)}
                      title="Serie completada. Clic para desmarcar"
                      className="w-9 h-9 rounded-full bg-[#00b954] text-white flex items-center justify-center shadow-[0_0_10px_rgba(0,185,84,0.3)] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
<Icon name="check" size={20} />
                    </button>
                  </div>
                </div>
              );
            }

            // PENDING SET ROW
            return (
              <div
                key={set.id}
                className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#191c22]/70 border border-white/[0.03] opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="col-span-2 flex items-center justify-center font-headline text-base text-[#c4c9ac]">
                  {set.setNumber}
                </div>
                <div className="col-span-3 text-center font-headline text-sm text-[#c4c9ac] tabular-nums">
                  {set.weight}{' '}
                  <span className="text-xs text-[#8e9379]">kg</span>
                </div>
                <div className="col-span-3 text-center font-headline text-sm text-[#c4c9ac] tabular-nums">
                  {set.reps}
                </div>
                <div className="col-span-4 flex justify-center">
                  <button
                    onClick={() => handleToggleSetComplete(set.id)}
                    title="Clic para marcar serie"
                    className="w-9 h-9 rounded-full bg-[#32353c] text-[#8e9379] hover:text-[#c3f400] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Icon name="radio_button_unchecked" size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
          <button
            id="add-set-btn"
            onClick={handleAddSet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#272a31] hover:bg-[#32353c] text-[#c4c9ac] hover:text-white font-headline text-xs font-semibold transition-colors active:scale-95 cursor-pointer"
          >
            <Icon name="add" size={18} />
            Añadir Serie
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191c22] text-[#c4c9ac]">
            <Icon name="bolt" size={16} className="text-[#c3f400]" />
            <span className="font-headline text-xs font-medium">
              Esfuerzo objetivo: {currentExercise.rpe ?? 8.5}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Exercises Queue */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="queue_play_next" size={20} className="text-[#c4c9ac]" />
            <h3 className="font-headline text-base text-white font-bold">
              Siguientes Ejercicios
            </h3>
          </div>
          <span className="font-headline text-xs text-[#c4c9ac] uppercase font-bold">
            {exercises.length - (activeExerciseIndex + 1)} pendientes
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {exercises.map((ex, idx) => {
            if (idx === activeExerciseIndex) return null; // Already shown active
            return (
              <button
                key={ex.id}
                onClick={() => setActiveExerciseIndex(idx)}
                title={`Cambiar a ${ex.name}`}
                className="w-full text-left p-3.5 rounded-xl bg-[#191c22] border border-white/[0.04] flex items-center justify-between gap-3 hover:bg-[#272a31] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/[0.06] group-hover:border-[#c3f400]/40 transition-colors">
                    <ExerciseImage
                      gifUrl={ex.gifUrl}
                      imageUrl={ex.imageUrl}
                      alt={ex.name}
                      showAttribution={false}
                      className="w-full h-full"
                    />
                    <span className="absolute bottom-0 right-0 text-[9px] font-headline text-[#161e00] bg-[#c3f400]/90 px-1 rounded-tl-md font-bold">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline text-sm text-white font-semibold truncate">
                      {ex.name}
                    </span>
                    <span className="font-body text-xs text-[#c4c9ac]">
                      {ex.sets.length} series • {ex.targetMuscles}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[#c4c9ac]">
                  <span className="text-xs text-[#c3f400] opacity-0 group-hover:opacity-100 transition-opacity font-headline font-semibold">
                    Entrenar ahora
                  </span>
                  <Icon name="drag_indicator" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
