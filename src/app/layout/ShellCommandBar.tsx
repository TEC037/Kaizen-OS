/**
 * @file src/app/layout/ShellCommandBar.tsx
 * @description Omnibar / Centro de Mando Global (Cmd+K / Ctrl+K).
 * Captura rápida universal, navegación ágil y ejecución de comandos sin levantar las manos del teclado.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  CheckSquare,
  Dumbbell,
  Hammer,
  BookOpen,
  Wallet,
  LayoutDashboard,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Star,
  Code2,
  Download,
  Upload,
} from 'lucide-react';
import { KzHotKey } from '../../components/ui/KzHotKey';
import { soundEngine } from '../../core/sound';
import { exportKaizenBackup, importKaizenBackup } from '../../core/backup';

export interface CommandItem {
  id: string;
  title: string;
  category: 'Acciones Rápidas' | 'Navegación' | 'Sistema';
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
}

interface ShellCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenScoreModal: () => void;
  onOpenInspector: () => void;
}

export const ShellCommandBar: React.FC<ShellCommandBarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  zenMode,
  onToggleZenMode,
  soundEnabled,
  onToggleSound,
  onOpenScoreModal,
  onOpenInspector,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Leer hábitos pendientes de hoy para ofrecer marcación instantánea
  const pendingHabits = useMemo(() => {
    if (!isOpen) return [];
    try {
      const raw = localStorage.getItem('transmute-storage');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const habits: Array<{ id: string; name: string; completedDays?: Record<string, boolean> }> =
        parsed?.state?.habits ?? [];
      const today = new Date().toISOString().split('T')[0];
      return habits.filter((h) => !h.completedDays?.[today]).slice(0, 4);
    } catch {
      return [];
    }
  }, [isOpen]);

  // Lista consolidada de comandos disponibles
  const allCommands = useMemo<CommandItem[]>(() => {
    const commands: CommandItem[] = [];

    // Acciones de hábitos pendientes
    pendingHabits.forEach((habit) => {
      commands.push({
        id: `habit-${habit.id}`,
        title: `Marcar hábito: "${habit.name}"`,
        category: 'Acciones Rápidas',
        icon: <CheckSquare size={15} className="text-teal-600" />,
        action: () => {
          import('../../modules/habits/transmute/src/store/useStore')
            .then(({ useStore }) => {
              const today = new Date().toISOString().split('T')[0];
              useStore.getState().toggleHabit(habit.id, today);
              soundEngine.playComplete();
            })
            .catch(() => {});
          onClose();
        },
      });
    });

    // Acciones de módulos
    commands.push(
      {
        id: 'action-gym-start',
        title: 'Iniciar entrenamiento en Punto Fuerte',
        category: 'Acciones Rápidas',
        icon: <Dumbbell size={15} className="text-red-600" />,
        shortcut: ['G', 'G'],
        action: () => {
          onNavigate('/gym');
          onClose();
        },
      },
      {
        id: 'action-forja-task',
        title: 'Nueva acción o proyecto en FORJA',
        category: 'Acciones Rápidas',
        icon: <Hammer size={15} className="text-amber-600" />,
        shortcut: ['G', 'F'],
        action: () => {
          onNavigate('/projects');
          onClose();
        },
      },
      {
        id: 'action-reading-log',
        title: 'Registrar sesión de Lectura',
        category: 'Acciones Rápidas',
        icon: <BookOpen size={15} className="text-sky-600" />,
        shortcut: ['G', 'R'],
        action: () => {
          onNavigate('/reading');
          onClose();
        },
      },
      {
        id: 'action-finance-expense',
        title: 'Registrar movimiento en Finanzas',
        category: 'Acciones Rápidas',
        icon: <Wallet size={15} className="text-emerald-600" />,
        shortcut: ['G', 'B'],
        action: () => {
          onNavigate('/finance');
          onClose();
        },
      }
    );

    // Navegación directa
    commands.push(
      {
        id: 'nav-dashboard',
        title: 'Ir al Dashboard Principal',
        category: 'Navegación',
        icon: <LayoutDashboard size={15} className="text-stone-700" />,
        shortcut: ['G', 'D'],
        action: () => {
          onNavigate('/');
          onClose();
        },
      },
      {
        id: 'nav-habits',
        title: 'Ir a TRANSMUTE (Hábitos)',
        category: 'Navegación',
        icon: <CheckSquare size={15} className="text-stone-700" />,
        shortcut: ['G', 'H'],
        action: () => {
          onNavigate('/habits');
          onClose();
        },
      },
      {
        id: 'nav-projects',
        title: 'Ir a FORJA (Taller de Proyectos)',
        category: 'Navegación',
        icon: <Hammer size={15} className="text-stone-700" />,
        shortcut: ['G', 'F'],
        action: () => {
          onNavigate('/projects');
          onClose();
        },
      },
      {
        id: 'nav-gym',
        title: 'Ir a Punto Fuerte (Gimnasio)',
        category: 'Navegación',
        icon: <Dumbbell size={15} className="text-stone-700" />,
        shortcut: ['G', 'G'],
        action: () => {
          onNavigate('/gym');
          onClose();
        },
      },
      {
        id: 'nav-modules',
        title: 'Ir a Mis Módulos y Catálogo',
        category: 'Navegación',
        icon: <Layers size={15} className="text-stone-700" />,
        shortcut: ['G', 'M'],
        action: () => {
          onNavigate('/modules');
          onClose();
        },
      }
    );

    // Sistema y preferencias
    commands.push(
      {
        id: 'sys-zen-toggle',
        title: zenMode ? 'Desactivar Modo Zen (mostrar barras)' : 'Activar Modo Zen (enfoque total)',
        category: 'Sistema',
        icon: zenMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />,
        shortcut: ['Z'],
        action: () => {
          onToggleZenMode();
          onClose();
        },
      },
      {
        id: 'sys-sound-toggle',
        title: soundEnabled ? 'Silenciar sonidos de feedback' : 'Activar paisajes sonoros',
        category: 'Sistema',
        icon: soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />,
        shortcut: ['M'],
        action: () => {
          onToggleSound();
          onClose();
        },
      },
      {
        id: 'sys-score-modal',
        title: 'Ver desglose de Puntos Kaizen e historial',
        category: 'Sistema',
        icon: <Star size={15} className="text-amber-500" />,
        action: () => {
          onOpenScoreModal();
          onClose();
        },
      },
      {
        id: 'sys-inspector',
        title: 'Abrir Inspector de Arquitectura Modular',
        category: 'Sistema',
        icon: <Code2 size={15} className="text-emerald-500" />,
        action: () => {
          onOpenInspector();
          onClose();
        },
      },
      {
        id: 'sys-backup-export',
        title: 'Exportar respaldo de datos (Descargar JSON)',
        category: 'Sistema',
        icon: <Download size={15} className="text-stone-700" />,
        action: () => {
          exportKaizenBackup();
          onClose();
        },
      },
      {
        id: 'sys-backup-import',
        title: 'Restaurar respaldo de datos (Subir JSON)',
        category: 'Sistema',
        icon: <Upload size={15} className="text-stone-700" />,
        action: () => {
          fileInputRef.current?.click();
        },
      }
    );

    return commands;
  }, [
    pendingHabits,
    zenMode,
    soundEnabled,
    onNavigate,
    onToggleZenMode,
    onToggleSound,
    onOpenScoreModal,
    onOpenInspector,
    onClose,
  ]);

  // Filtrado por búsqueda
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Enfocar input automáticamente al abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Manejo de teclas de navegación (flechas y enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          soundEngine.playTap();
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playTap();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-xl bg-[#fffdf8] border border-stone-300 shadow-2xl rounded-sm overflow-hidden font-mono text-xs flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de entrada */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-[#faf8f1]">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Escribe un comando, hábito o navega..."
            className="w-full bg-transparent border-none outline-none text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm"
          />
          <KzHotKey keys="Esc" size="sm" />
        </div>

        {/* Lista de resultados */}
        <div className="overflow-y-auto p-2 divide-y divide-stone-100 flex-1">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-stone-500 italic">
              No se encontraron comandos para &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={command.id}
                  onClick={() => {
                    soundEngine.playTap();
                    command.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-sm cursor-pointer transition-colors ${
                    isSelected ? 'bg-amber-100/70 text-amber-950 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="shrink-0">{command.icon}</span>
                    <span className="truncate">{command.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-600">
                      {command.category}
                    </span>
                    {command.shortcut && <KzHotKey keys={command.shortcut} size="sm" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer del Omnibar */}
        <div className="border-t border-stone-200 bg-[#faf8f1] px-3 py-2 flex items-center justify-between text-[10px] text-stone-600">
          <div className="flex items-center gap-2">
            <span>Usa ↑ ↓ para seleccionar</span>
            <span>•</span>
            <span>↵ para ejecutar</span>
          </div>
          <span>KAIZEN OS OMNIBAR</span>
        </div>

        {/* Input oculto para restauración de copia de seguridad */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            importKaizenBackup(file).then((res) => {
              if (res.success) {
                alert(`Copia de seguridad restaurada exitosamente (${res.count} registros).`);
                window.location.reload();
              } else {
                alert(`Error al restaurar respaldo: ${res.error || 'Formato no reconocido'}`);
              }
            });
            onClose();
          }}
        />
      </div>
    </div>
  );
};
