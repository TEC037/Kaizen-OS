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
import { ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { KzButton, KzBadge } from '../../components/ui';

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
          <div className="p-3 border border-kz-line bg-kz-surface-2 rounded-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-bold text-kz-ink block font-mono truncate">
                  {activeBook.title}
                </span>
                <span className="text-[11px] text-kz-ink-soft font-sans truncate block">
                  {activeBook.author}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {books.length > 1 && (
                  <KzButton
                    variant="craft"
                    size="sm"
                    className="p-1 min-w-0 h-6"
                    onClick={cycleNextBook}
                    icon={<RefreshCw size={11} />}
                    title="Alternar entre libros de la biblioteca"
                  />
                )}
                <KzBadge variant={isCompleted ? 'success' : 'default'}>
                  {percent}%
                </KzBadge>
              </div>
            </div>

            <div className="w-full bg-kz-line h-1.5 rounded-xs overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-xs ${
                  isCompleted ? 'bg-kz-success' : 'bg-kz-accent'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-kz-ink-soft">
              <span>Página <strong className="text-kz-ink">{activeBook.currentPage}</strong> de {activeBook.totalPages}</span>
              <span>
                {isCompleted ? 'Finalizado' : `${activeBook.totalPages - activeBook.currentPage} págs restantes`}
              </span>
            </div>

            {/* Micro-acciones rápidas o estado completado */}
            {isCompleted ? (
              <div className="flex items-center justify-between pt-1 border-t border-kz-line/60">
                <div className="flex items-center gap-1.5 text-kz-success font-bold text-[11px]">
                  <CheckCircle2 size={13} className="text-kz-success shrink-0" />
                  <span>¡Lectura concluida! (+45 pts)</span>
                </div>
                {books.length > 1 && (
                  <KzButton
                    variant="craft"
                    size="sm"
                    onClick={cycleNextBook}
                  >
                    Siguiente libro →
                  </KzButton>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-kz-line/60">
                <span className="text-[10px] text-kz-ink-dim">Avance rápido:</span>
                <div className="flex items-center gap-1.5">
                  <KzButton
                    variant="craft"
                    size="sm"
                    onClick={() => advancePages(Math.min(5, activeBook.totalPages - activeBook.currentPage))}
                    title={`Registrar ${Math.min(5, activeBook.totalPages - activeBook.currentPage)} páginas leídas (+15 pts Kaizen)`}
                  >
                    +{Math.min(5, activeBook.totalPages - activeBook.currentPage)} págs
                  </KzButton>
                  {activeBook.totalPages - activeBook.currentPage > 5 && (
                    <KzButton
                      variant="primary"
                      size="sm"
                      onClick={() => advancePages(Math.min(10, activeBook.totalPages - activeBook.currentPage))}
                      title={`Registrar ${Math.min(10, activeBook.totalPages - activeBook.currentPage)} páginas leídas (+15 pts Kaizen)`}
                    >
                      +{Math.min(10, activeBook.totalPages - activeBook.currentPage)} págs
                    </KzButton>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-kz-ink-dim italic py-2">
            No hay libros en progreso actualmente.
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-kz-ink-soft">
            Biblioteca: <strong className="text-kz-ink">{books.length} libros</strong>
          </span>
          <KzButton
            variant="ghost"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onNavigate('/reading');
            }}
          >
            <span>Ver biblioteca</span>
            <ArrowRight size={12} />
          </KzButton>
        </div>
      </div>
    </ModuleWidget>
  );
};
