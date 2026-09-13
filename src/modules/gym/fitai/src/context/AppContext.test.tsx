import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, PersistedWorkoutState } from './AppContext';
import { useApp } from './useApp';
import { STORAGE_KEYS } from '../config/constants';
import { ChatMessage, DailyRoutine, Exercise, WorkoutSessionLog } from '../types';

function readPersistedChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function Harness() {
  const { chatMessages, sendCoachMessage } = useApp();
  return (
    <div>
      <span data-testid="count">{chatMessages.length}</span>
      <button onClick={() => sendCoachMessage('Hola coach')}>send</button>
    </div>
  );
}

describe('AppContext chat persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
  });

  it('persiste los mensajes del chat en localStorage', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    const initialCount = readPersistedChat().length;
    fireEvent.click(screen.getByText('send'));

    await waitFor(() => {
      const saved = readPersistedChat();
      expect(saved).toHaveLength(initialCount + 1);
      expect(saved[saved.length - 1].text).toBe('Hola coach');
      expect(saved[saved.length - 1].sender).toBe('user');
    });
  });

  it('almacena el timestamp del chat en HH:MM determinista (sin AM/PM)', async () => {
    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('send'));

    await waitFor(() => {
      const saved = readPersistedChat();
      const last = saved[saved.length - 1];
      expect(last.sender).toBe('user');
      expect(last.timestamp).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('restaura el chat guardado al montar el provider', () => {
    const persisted: ChatMessage[] = [
      { id: 'c1', sender: 'coach', text: 'Mensaje restaurado', timestamp: '10:00' },
      { id: 'u1', sender: 'user', text: '¿Y ahora qué?', timestamp: '10:01' },
    ];
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(persisted));

    render(
      <AppProvider>
        <Harness />
      </AppProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('2');
  });
});

const DEMO_EXERCISE: Exercise = {
  id: 'ex1',
  name: 'Press de Banca',
  primaryMuscle: 'Pecho',
  targetMuscles: ['Pectoral'],
  sets: 4,
  reps: '8-10',
  suggestedWeightKg: 80,
  restSeconds: 90,
  rpe: 8,
  technicalCue: 'Retrae las escápulas.',
  fullInstructions: [],
  commonMistakes: [],
  equipment: 'Barra',
  difficulty: 'intermedio',
  iconType: 'barbell',
};

const DEMO_ROUTINE: DailyRoutine = {
  dayNumber: 1,
  name: 'Empuje Dinámico',
  focus: 'Pecho y Tríceps',
  description: 'Sesión de empuje',
  estimatedMinutes: 45,
  difficulty: 'intermedio',
  targetMuscles: ['Pecho'],
  exercises: [DEMO_EXERCISE],
};

function WorkoutHarness() {
  const { isWorkoutActive, activeRoutine, workoutElapsedTime, startWorkout, cancelWorkout } =
    useApp();
  return (
    <div>
      <span data-testid="active">{String(isWorkoutActive)}</span>
      <span data-testid="routine-name">{activeRoutine?.name ?? 'ninguna'}</span>
      <span data-testid="elapsed">{workoutElapsedTime}</span>
      <button onClick={() => startWorkout(1)}>start</button>
      <button onClick={cancelWorkout}>cancel</button>
    </div>
  );
}

function SetsHarness() {
  const { activeWorkoutSets, startWorkout, logActiveSet } = useApp();
  return (
    <div>
      <span data-testid="sets-count">{activeWorkoutSets.length}</span>
      <button onClick={() => startWorkout(1)}>start-sets</button>
      <button onClick={() => logActiveSet(80, 8, 8, 'ok')}>log-set</button>
    </div>
  );
}

function FinishHarness() {
  const { startWorkout, finishWorkout } = useApp();
  return (
    <div>
      <button onClick={() => startWorkout(1)}>start-finish</button>
      <button onClick={() => finishWorkout('bien', 8)}>finish</button>
    </div>
  );
}

function DuplicateHarness() {
  const { routines, duplicateRoutineDay } = useApp();
  const copy = routines.find((r) => r.dayNumber !== 1);
  return (
    <div>
      <span data-testid="days">{routines.map((r) => r.dayNumber).join(',')}</span>
      <span data-testid="copy-name">{copy?.name ?? 'none'}</span>
      <span data-testid="copy-ex-id">{copy?.exercises[0]?.id ?? 'none'}</span>
      <button onClick={() => duplicateRoutineDay(1)}>dup</button>
    </div>
  );
}

function RecordsHarness() {
  const { personalRecords, startWorkout, logActiveSet, finishWorkout } = useApp();
  return (
    <div>
      <span data-testid="pr-count">{personalRecords.length}</span>
      <span data-testid="pr-value">{personalRecords[0]?.recordValue ?? 'none'}</span>
      <button onClick={() => startWorkout(1)}>start-records</button>
      <button onClick={() => logActiveSet(80, 8, 8, 'ok')}>log-records</button>
      <button onClick={() => finishWorkout('ok', 8)}>finish-records</button>
    </div>
  );
}

function readHistory(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? (JSON.parse(raw) as WorkoutSessionLog[]) : [];
  } catch {
    return [];
  }
}

function readWorkoutSnapshot(): PersistedWorkoutState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKOUT);
    return raw ? (JSON.parse(raw) as PersistedWorkoutState) : null;
  } catch {
    return null;
  }
}

describe('AppContext workout persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify([DEMO_ROUTINE]));
  });

  it('persiste una sesión activa al iniciar entrenamiento', async () => {
    render(
      <AppProvider>
        <WorkoutHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('start'));

    await waitFor(() => {
      const snapshot = readWorkoutSnapshot();
      expect(snapshot).not.toBeNull();
      expect(snapshot?.isWorkoutActive).toBe(true);
      expect(snapshot?.activeRoutine?.name).toBe('Empuje Dinámico');
      expect(snapshot?.workoutStartedAt).toBeGreaterThan(0);
    });
  });

  it('restaura la sesión activa y deriva el tiempo transcurrido del epoch', () => {
    const twoMinutesAgo = Date.now() - 120_000;
    const snapshot: PersistedWorkoutState = {
      isWorkoutActive: true,
      activeRoutine: DEMO_ROUTINE,
      activeExerciseIndex: 0,
      activeSetIndex: 2,
      activeWorkoutSets: [
        {
          exerciseId: 'ex1',
          exerciseName: 'Press de Banca',
          setNumber: 1,
          weightKg: 80,
          reps: 8,
          rpe: 8,
          completedAt: '10:00',
        },
      ],
      workoutStartedAt: twoMinutesAgo,
      restTimerDeadline: 0,
      isRestTimerActive: false,
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(snapshot));

    render(
      <AppProvider>
        <WorkoutHarness />
      </AppProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('true');
    expect(screen.getByTestId('routine-name').textContent).toBe('Empuje Dinámico');
    const elapsed = Number(screen.getByTestId('elapsed').textContent);
    expect(elapsed).toBeGreaterThanOrEqual(118);
    expect(elapsed).toBeLessThanOrEqual(122);
  });

  it('no restaura la rutina cuando el snapshot está inactivo', () => {
    const snapshot: PersistedWorkoutState = {
      isWorkoutActive: false,
      activeRoutine: DEMO_ROUTINE,
      activeExerciseIndex: 0,
      activeSetIndex: 1,
      activeWorkoutSets: [],
      workoutStartedAt: 0,
      restTimerDeadline: 0,
      isRestTimerActive: false,
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(snapshot));

    render(
      <AppProvider>
        <WorkoutHarness />
      </AppProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('false');
    expect(screen.getByTestId('routine-name').textContent).toBe('ninguna');
  });

  it('restaura el temporizador de descanso en curso', () => {
    const snapshot: PersistedWorkoutState = {
      isWorkoutActive: true,
      activeRoutine: DEMO_ROUTINE,
      activeExerciseIndex: 0,
      activeSetIndex: 1,
      activeWorkoutSets: [],
      workoutStartedAt: Date.now() - 60_000,
      restTimerDeadline: Date.now() + 30_000,
      isRestTimerActive: true,
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(snapshot));

    render(
      <AppProvider>
        <WorkoutHarness />
      </AppProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('true');
  });

  it('cancela y limpia la sesión persistida', async () => {
    render(
      <AppProvider>
        <WorkoutHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('start'));
    await waitFor(() => expect(readWorkoutSnapshot()?.isWorkoutActive).toBe(true));

    fireEvent.click(screen.getByText('cancel'));

    await waitFor(() => {
      const snapshot = readWorkoutSnapshot();
      expect(snapshot?.isWorkoutActive).toBe(false);
      expect(snapshot?.activeRoutine).toBeNull();
    });
    expect(screen.getByTestId('active').textContent).toBe('false');
  });

  it('almacena el completedAt de una serie en HH:MM determinista (formatClock)', async () => {
    render(
      <AppProvider>
        <SetsHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('start-sets'));
    await waitFor(() => expect(readWorkoutSnapshot()?.isWorkoutActive).toBe(true));

    fireEvent.click(screen.getByText('log-set'));

    await waitFor(() => {
      const snapshot = readWorkoutSnapshot();
      expect(snapshot?.activeWorkoutSets).toHaveLength(1);
      expect(snapshot?.activeWorkoutSets[0].completedAt).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('deriva un récord personal desde la sesión terminada', async () => {
    render(
      <AppProvider>
        <RecordsHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('start-records'));
    await waitFor(() => expect(readWorkoutSnapshot()?.isWorkoutActive).toBe(true));

    fireEvent.click(screen.getByText('log-records'));
    fireEvent.click(screen.getByText('finish-records'));

    await waitFor(() => {
      expect(screen.getByTestId('pr-count').textContent).toBe('1');
    });
    expect(screen.getByTestId('pr-value').textContent).toBe('80 kg (x8 reps)');
  });

  it('duplica un día de rutina reasignando dayNumber e ids de ejercicios', async () => {
    render(
      <AppProvider>
        <DuplicateHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('dup'));

    await waitFor(() => {
      expect(screen.getByTestId('days').textContent).toBe('1,2');
    });
    expect(screen.getByTestId('copy-name').textContent).toBe('Copia de Empuje Dinámico');
    expect(screen.getByTestId('copy-ex-id').textContent).toMatch(/^ex1_dup_\d+_0$/);
  });

  it('guarda la sesión terminada con fecha local YYYY-MM-DD (sin sesgo UTC)', async () => {
    render(
      <AppProvider>
        <FinishHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('start-finish'));
    await waitFor(() => expect(readWorkoutSnapshot()?.isWorkoutActive).toBe(true));

    fireEvent.click(screen.getByText('finish'));

    await waitFor(() => {
      const history = readHistory();
      expect(history[0]).toBeDefined();
      expect(history[0].routineName).toContain('Empuje Dinámico');
      expect(history[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});

function ImportHarness() {
  const { routines, selectedDay, importRoutines } = useApp();
  return (
    <div>
      <span data-testid="import-names">{routines.map((r) => r.name).join('|')}</span>
      <span data-testid="import-selected">{selectedDay}</span>
      <button
        onClick={() =>
          importRoutines([{ ...DEMO_ROUTINE, name: 'Rutina Importada' }])
        }
      >
        import
      </button>
    </div>
  );
}

describe('AppContext importRoutines', () => {
  beforeEach(() => {
    localStorage.clear();
    window.scrollTo = () => {};
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify([DEMO_ROUTINE]));
  });

  it('reemplaza la rutina actual y selecciona el primer día importado', () => {
    render(
      <AppProvider>
        <ImportHarness />
      </AppProvider>
    );

    expect(screen.getByTestId('import-names').textContent).toBe('Empuje Dinámico');
    fireEvent.click(screen.getByRole('button', { name: 'import' }));

    expect(screen.getByTestId('import-names').textContent).toBe('Rutina Importada');
    expect(screen.getByTestId('import-selected').textContent).toBe('1');
  });
});
