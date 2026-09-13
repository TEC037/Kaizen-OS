import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { TabType, Routine, Exercise } from './ui/types';
import { UiDataProvider, useUiData } from './ui/data/store';
import { Header } from './ui/components/Header';
import { BottomNav } from './ui/components/BottomNav';
import { EjerciciosScreen } from './ui/components/EjerciciosScreen';
import { RutinasScreen } from './ui/components/RutinasScreen';
import { EntrenarScreen } from './ui/components/EntrenarScreen';
import { AjustesScreen } from './ui/components/AjustesScreen';
import { AuthScreen } from './ui/components/AuthScreen';

// Modals
import { WeightModal } from './ui/components/modals/WeightModal';
import { QuickMealModal } from './ui/components/modals/QuickMealModal';
import { CoachNotesModal } from './ui/components/modals/CoachNotesModal';
import { HistoryModal } from './ui/components/modals/HistoryModal';
import { CreateRoutineModal } from './ui/components/modals/CreateRoutineModal';
import { FinishWorkoutModal } from './ui/components/modals/FinishWorkoutModal';
import { ExportPdfModal } from './ui/components/modals/ExportPdfModal';
import { VideoModal } from './ui/components/modals/VideoModal';
import { NotificationsModal } from './ui/components/modals/NotificationsModal';
import { ProfileModal } from './ui/components/modals/ProfileModal';

function AppShell() {
  const ui = useUiData();
  const [currentTab, setCurrentTab] = useState<TabType>('ejercicios');

  // Shared App State
  const [weight, setWeight] = useState<number>(ui.profile.weight);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>(['bench-press', '0001']);

  // Modal Visibility States
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isCoachNotesOpen, setIsCoachNotesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [isFinishWorkoutOpen, setIsFinishWorkoutOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Finish workout summary
  const [finishSummary, setFinishSummary] = useState({
    durationSeconds: 34 * 60 + 12,
    volumeKg: 4250,
    setsCompleted: 7,
  });

  const handleToggleFavorite = (exerciseId: string) => {
    setFavorites((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId]
    );
  };

  const handleStartRoutine = (routine: Routine) => {
    ui.startWorkoutRoutine(routine.dayNumber);
    setCurrentTab('entrenamiento');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectExerciseFromCatalog = () => {
    ui.startWorkoutRoutine(ui.nextSession?.routineDay);
    setCurrentTab('entrenamiento');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishWorkout = (summary: {
    durationSeconds: number;
    volumeKg: number;
    setsCompleted: number;
  }) => {
    setFinishSummary(summary);
    setIsFinishWorkoutOpen(true);
  };

  const handleConfirmFinishWorkout = () => {
    setIsFinishWorkoutOpen(false);
    // Avisa al host (p.ej. Kaizen OS) para otorgar puntos Kaizen si está embebida.
    window.dispatchEvent(
      new CustomEvent('punto-fuerte:workout-completed', { detail: finishSummary })
    );
    // Add burned calories to today's total
    const extraCalories = Math.round((finishSummary.durationSeconds / 60) * 8.5);
    ui.addExtraCalories(extraCalories);
    // Switch to ajustes screen to see results
    setCurrentTab('ajustes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenVideo = (exercise: Exercise) => {
    setVideoExercise(exercise);
    setIsVideoModalOpen(true);
  };

  const handleSaveRoutine = (newRoutine: Routine) => {
    ui.addCustomRoutine(newRoutine);
  };

  const handleSaveWeight = (newWeight: number) => {
    setWeight(newWeight);
    ui.saveWeight(newWeight);
  };

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Auth gate: si hay Supabase configurado, exigimos sesión antes de la app.
  if (ui.canUseEmailAuth && !ui.isAuthenticated) {
    if (ui.isHydrating) {
      return (
        <div className="min-h-screen bg-[#101319] text-[#e1e2eb] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#c3f400] animate-pulse shadow-[0_0_8px_#c3f400]"></span>
            <span className="font-headline text-sm text-[#c4c9ac] font-semibold">
              Preparando tu espacio…
            </span>
          </div>
        </div>
      );
    }
    return <AuthScreen />;
  }

  return (
    <div className="punto-fuerte-app min-h-screen bg-[#101319] text-[#e1e2eb] flex flex-col antialiased">
      {/* Fixed Global Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        hasUnreadNotifications={hasUnreadNotifications}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full pt-16 pb-20 overflow-x-hidden">
        {currentTab === 'ejercicios' && (
          <EjerciciosScreen
            onSelectExercise={handleSelectExerciseFromCatalog}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'rutina' && (
          <RutinasScreen
            onStartRoutine={handleStartRoutine}
            onCreateRoutineOpen={() => setIsCreateRoutineOpen(true)}
          />
        )}

        {currentTab === 'entrenamiento' && (
          <EntrenarScreen
            onFinishWorkout={handleFinishWorkout}
            onOpenVideoModal={handleOpenVideo}
          />
        )}

        {currentTab === 'ajustes' && (
          <AjustesScreen
            onExportPdf={() => setIsExportPdfOpen(true)}
            onOpenWeightModal={() => setIsWeightModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}
      </main>

      {/* Fixed Sticky Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isTrainingActive={true}
      />

      {/* Modals & Dialogs */}
      <WeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        currentWeight={weight}
        onSaveWeight={handleSaveWeight}
      />

      <QuickMealModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        onAddCalories={ui.addExtraCalories}
      />

      <CoachNotesModal
        isOpen={isCoachNotesOpen}
        onClose={() => setIsCoachNotesOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <CreateRoutineModal
        isOpen={isCreateRoutineOpen}
        onClose={() => setIsCreateRoutineOpen(false)}
        onSaveRoutine={handleSaveRoutine}
      />

      <FinishWorkoutModal
        isOpen={isFinishWorkoutOpen}
        onClose={() => setIsFinishWorkoutOpen(false)}
        summary={finishSummary}
        onConfirmFinish={handleConfirmFinishWorkout}
      />

      <ExportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        exercise={videoExercise}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onClear={() => setHasUnreadNotifications(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}

export default function App({ demoEdition = false }: { demoEdition?: boolean }) {
  return (
    <AppProvider demoEdition={demoEdition}>
      <UiDataProvider>
        <AppShell />
      </UiDataProvider>
    </AppProvider>
  );
}
