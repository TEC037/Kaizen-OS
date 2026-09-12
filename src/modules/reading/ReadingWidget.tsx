/**
 * @file src/modules/reading/ReadingWidget.tsx
 * @description Widget de Lectura para el Dashboard de Kaizen OS.
 * Se renderiza automáticamente una vez instalado el módulo.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { BookItem, INITIAL_BOOKS } from '../../data/demoData';
import { loadCustomData } from '../../core/storage';
import { BookOpen, ArrowRight } from 'lucide-react';

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

  return (
    <ModuleWidget
      id="reading-active"
      moduleId="reading"
      title="Lectura Activa"
      targetPath="/reading"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        {activeBook ? (
          <div className="p-3 border border-zinc-200 bg-zinc-50/50 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">
                  {activeBook.title}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {activeBook.author}
                </span>
              </div>
              <span className="text-[10px] font-mono border border-zinc-200 px-1 py-0.2 bg-white text-zinc-700">
                {percent}%
              </span>
            </div>

            <div className="w-full bg-zinc-200 h-1.5 border border-zinc-300">
              <div className="bg-zinc-800 h-full" style={{ width: `${percent}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600">
              <span>Página {activeBook.currentPage} de {activeBook.totalPages}</span>
              <span>{activeBook.totalPages - activeBook.currentPage} págs restantes</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic py-2">
            No hay libros en progreso actualmente.
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono text-zinc-600">
            Libros en biblioteca: <strong className="text-zinc-900">{books.length}</strong>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/reading')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Ver biblioteca completa</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};
