/**
 * @file src/modules/reading/ReadingWidget.tsx
 * @description Widget de Lectura para el Dashboard de Kaizen OS.
 * Incluye avance rápido de páginas con 1 tap (+5 / +10 págs) y puntos Kaizen inmediatos.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { BookItem, INITIAL_BOOKS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { awardKaizenPoints } from '../../core/scoring';
import { BookOpen, ArrowRight, Plus } from 'lucide-react';

export const ReadingWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [books, setBooks] = useState<BookItem[]>(() =>
    loadCustomData<BookItem[]>('books_list', INITIAL_BOOKS)
  );

  useEffect(() => {
    const handleStorage = () => {
      setBooks(loadCustomData<BookItem[]>('books_list', INITIAL_BOOKS));
    };
    window.addEventListener('storage_reading_updated', handleStorage);
    return () => window.removeEventListener('storage_reading_updated', handleStorage);
  }, []);

  const activeBook = books.find((b) => b.status === 'en_progreso') || books[0];
  const percent = activeBook ? Math.round((activeBook.currentPage / activeBook.totalPages) * 100) : 0;

  const advancePages = (pages: number) => {
    if (!activeBook) return;
    const nextCurrent = Math.min(activeBook.totalPages, activeBook.currentPage + pages);
    const isCompleted = nextCurrent >= activeBook.totalPages;

    const updated = books.map((b) => {
      if (b.id === activeBook.id) {
        return {
          ...b,
          currentPage: nextCurrent,
          status: isCompleted ? ('terminado' as const) : b.status,
        };
      }
      return b;
    });

    setBooks(updated);
    saveCustomData('books_list', updated);
    window.dispatchEvent(new Event('storage_reading_updated'));

    soundEngine.playComplete();
    const pts = isCompleted ? 45 : 15;
    const reason = isCompleted
      ? `Hito de Lectura: ¡Libro "${activeBook.title}" completado!`
      : `Lectura: +${pages} páginas en "${activeBook.title}"`;
    awardKaizenPoints(pts, 'reading', reason);

    kaizenBus.emit(KaizenContracts.ReadingSessionFinished, {
      bookTitle: activeBook.title,
      pagesRead: pages,
    });
  };

  return (
    <ModuleWidget
      id="reading-active"
      moduleId="reading"
      title="Lectura Activa"
      targetPath="/reading"
      onNavigate={onNavigate}
    >
      <div className="space-y-3 font-mono text-xs">
        {activeBook ? (
          <div className="p-3 border border-stone-200 bg-[#faf8f1] rounded-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-stone-900 block font-mono">
                  {activeBook.title}
                </span>
                <span className="text-[11px] text-stone-500 font-sans">
                  {activeBook.author}
                </span>
              </div>
              <span className="text-[10px] font-mono border border-stone-300 px-1.5 py-0.2 bg-white text-stone-800 rounded-xs font-bold">
                {percent}%
              </span>
            </div>

            <div className="w-full bg-stone-200 h-1.5 rounded-xs overflow-hidden">
              <div
                className="bg-indigo-700 h-full transition-all duration-300 rounded-xs"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600">
              <span>Página <strong>{activeBook.currentPage}</strong> de {activeBook.totalPages}</span>
              <span>{activeBook.totalPages - activeBook.currentPage} págs restantes</span>
            </div>

            {/* Micro-acciones rápidas de lectura (+5 y +10 págs) */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
              <span className="text-[10px] text-stone-500">Avance rápido:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => advancePages(5)}
                  disabled={activeBook.currentPage >= activeBook.totalPages}
                  className="px-2 py-0.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 rounded-xs text-[10px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
                  title="Registrar 5 páginas leídas (+15 pts Kaizen)"
                >
                  +5 págs
                </button>
                <button
                  type="button"
                  onClick={() => advancePages(10)}
                  disabled={activeBook.currentPage >= activeBook.totalPages}
                  className="px-2 py-0.5 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 rounded-xs text-[10px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
                  title="Registrar 10 páginas leídas (+15 pts Kaizen)"
                >
                  +10 págs
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic py-2">
            No hay libros en progreso actualmente.
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-stone-600">
            Biblioteca: <strong className="text-stone-900">{books.length} libros</strong>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/reading')}
            className="text-xs text-stone-700 hover:text-stone-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Ver biblioteca</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};
