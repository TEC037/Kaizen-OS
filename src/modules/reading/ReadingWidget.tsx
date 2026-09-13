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
import { BookOpen, ArrowRight, Plus, CheckCircle2, RefreshCw } from 'lucide-react';

export const ReadingWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [books, setBooks] = useState<BookItem[]>(() =>
    loadCustomData<BookItem[]>('books_list', INITIAL_BOOKS)
  );
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => {
      setBooks(loadCustomData<BookItem[]>('books_list', INITIAL_BOOKS));
    };
    window.addEventListener('storage_reading_updated', handleStorage);
    return () => window.removeEventListener('storage_reading_updated', handleStorage);
  }, []);

  const activeBook =
    (activeBookId && books.find((b) => b.id === activeBookId)) ||
    books.find((b) => b.status === 'en_progreso') ||
    books[0];

  const percent = activeBook ? Math.round((activeBook.currentPage / activeBook.totalPages) * 100) : 0;
  const isCompleted = Boolean(activeBook && activeBook.currentPage >= activeBook.totalPages);

  const cycleNextBook = () => {
    soundEngine.playTap();
    if (books.length <= 1) return;
    const currentIndex = books.findIndex((b) => b.id === activeBook?.id);
    const nextIndex = (currentIndex + 1) % books.length;
    setActiveBookId(books[nextIndex].id);
  };

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
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-900 block font-mono truncate">
                  {activeBook.title}
                </span>
                <span className="text-[11px] text-stone-500 font-sans truncate block">
                  {activeBook.author}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {books.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleNextBook}
                    className="p-1 border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 rounded-xs text-[10px] cursor-pointer"
                    title="Alternar entre libros de la biblioteca"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
                <span
                  className={`text-[10px] font-mono border px-1.5 py-0.2 rounded-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-white text-stone-800 border-stone-300'
                  }`}
                >
                  {percent}%
                </span>
              </div>
            </div>

            <div className="w-full bg-stone-200 h-1.5 rounded-xs overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-xs ${
                  isCompleted ? 'bg-emerald-600' : 'bg-indigo-700'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600">
              <span>Página <strong>{activeBook.currentPage}</strong> de {activeBook.totalPages}</span>
              <span>
                {isCompleted ? 'Finalizado' : `${activeBook.totalPages - activeBook.currentPage} págs restantes`}
              </span>
            </div>

            {/* Micro-acciones rápidas o estado completado */}
            {isCompleted ? (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                  <span>¡Lectura concluida! (+45 pts)</span>
                </div>
                {books.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleNextBook}
                    className="px-2 py-0.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 rounded-xs text-[10px] font-bold cursor-pointer"
                  >
                    Siguiente libro →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <span className="text-[10px] text-stone-500">Avance rápido:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => advancePages(Math.min(5, activeBook.totalPages - activeBook.currentPage))}
                    className="px-2 py-0.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 rounded-xs text-[10px] font-bold cursor-pointer transition-colors"
                    title={`Registrar ${Math.min(5, activeBook.totalPages - activeBook.currentPage)} páginas leídas (+15 pts Kaizen)`}
                  >
                    +{Math.min(5, activeBook.totalPages - activeBook.currentPage)} págs
                  </button>
                  {activeBook.totalPages - activeBook.currentPage > 5 && (
                    <button
                      type="button"
                      onClick={() => advancePages(Math.min(10, activeBook.totalPages - activeBook.currentPage))}
                      className="px-2 py-0.5 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 rounded-xs text-[10px] font-bold cursor-pointer transition-colors"
                      title={`Registrar ${Math.min(10, activeBook.totalPages - activeBook.currentPage)} páginas leídas (+15 pts Kaizen)`}
                    >
                      +{Math.min(10, activeBook.totalPages - activeBook.currentPage)} págs
                    </button>
                  )}
                </div>
              </div>
            )}
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
            onClick={() => {
              soundEngine.playTap();
              onNavigate('/reading');
            }}
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
