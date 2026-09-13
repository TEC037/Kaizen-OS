/**
 * @file src/modules/reading/ReadingPage.tsx
 * @description Pantalla completa del módulo de Lectura en Kaizen OS.
 * Gestiona libros en progreso, pendientes y registro rápido de páginas leídas.
 */

import React, { useState, useEffect } from 'react';
import { BookItem, INITIAL_BOOKS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { BookOpen, Plus, Check, Bookmark, ArrowUpRight } from 'lucide-react';

export const ReadingPage: React.FC = () => {
  const [books, setBooks] = useState<BookItem[]>(() =>
    loadCustomData<BookItem[]>('books_list', INITIAL_BOOKS)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [totalPages, setTotalPages] = useState(250);

  useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playTap();
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const updateBooks = (newBooks: BookItem[]) => {
    setBooks(newBooks);
    saveCustomData('books_list', newBooks);
    window.dispatchEvent(new Event('storage_reading_updated'));
  };

  const handleAddPages = (bookId: string, pagesToAdd: number) => {
    let bookTitle = '';
    let becameFinished = false;

    const updated = books.map((b) => {
      if (b.id !== bookId) return b;
      bookTitle = b.title;
      const nextPages = Math.min(b.totalPages, b.currentPage + pagesToAdd);
      const isFinished = nextPages >= b.totalPages;
      becameFinished = isFinished && b.status !== 'terminado';
      return {
        ...b,
        currentPage: nextPages,
        status: isFinished ? ('terminado' as const) : ('en_progreso' as const),
      };
    });
    updateBooks(updated);

    if (becameFinished) {
      soundEngine.playMilestone();
      awardKaizenPoints(45, 'reading', `¡Hito intelectual! Libro concluido: ${bookTitle}`);
    } else {
      soundEngine.playComplete();
      awardKaizenPoints(15, 'reading', `Lectura activa: +${pagesToAdd} págs en ${bookTitle}`);
    }

    kaizenBus.emit(KaizenContracts.ReadingSessionFinished, {
      bookTitle,
      pagesRead: pagesToAdd,
    });
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBook: BookItem = {
      id: `b-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Autor desconocido',
      status: 'en_progreso',
      currentPage: 0,
      totalPages: Math.max(10, totalPages),
    };

    soundEngine.playTap();
    updateBooks([newBook, ...books]);
    setNewTitle('');
    setNewAuthor('');
    setShowAddModal(false);
  };

  const inProgressBooks = books.filter((b) => b.status === 'en_progreso');
  const pendingBooks = books.filter((b) => b.status === 'pendiente');
  const finishedBooks = books.filter((b) => b.status === 'terminado');

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
              MÓDULO: /reading
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight flex items-center gap-2">
            <BookOpen size={20} />
            <span>Biblioteca y Sesiones de Lectura</span>
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Desarrollo intelectual mediante lectura deliberada y registro incremental de páginas.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setShowAddModal(!showAddModal);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Añadir libro</span>
          </button>
        </div>
      </div>

      {/* Modal / Formulario para añadir libro */}
      {showAddModal && (
        <form
          onSubmit={handleAddBook}
          className="border border-zinc-400 bg-zinc-50 p-4 space-y-3"
        >
          <div className="font-mono text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Añadir nuevo libro a la biblioteca
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Título del libro *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Solo una cosa"
                required
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Autor
              </label>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Ej: Gary Keller"
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Total páginas
              </label>
              <input
                type="number"
                min={10}
                value={totalPages}
                onChange={(e) => setTotalPages(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setShowAddModal(false);
              }}
              className="px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
            >
              Guardar libro
            </button>
          </div>
        </form>
      )}

      {/* Sección: Libros en Progreso */}
      <div className="space-y-3">
        <div className="border-b border-zinc-300 pb-1 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800">
            Libros en Progreso ({inProgressBooks.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgressBooks.map((book) => {
            const percent = Math.round((book.currentPage / book.totalPages) * 100);
            return (
              <div
                key={book.id}
                className="border border-zinc-300 bg-white p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                        {book.title}
                      </h3>
                      <span className="text-xs text-zinc-500">{book.author}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-800">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 h-2 border border-zinc-300 mt-2">
                    <div className="bg-zinc-800 h-full" style={{ width: `${percent}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mt-1">
                    <span>Pág {book.currentPage} / {book.totalPages}</span>
                    <span>Quedan {book.totalPages - book.currentPage} págs</span>
                  </div>
                </div>

                {/* Botones rápidos de registro de sesión */}
                <div className="pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">Registrar lectura:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddPages(book.id, 10)}
                      className="px-2 py-0.5 text-xs font-mono border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer text-zinc-800"
                    >
                      +10 págs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPages(book.id, 25)}
                      className="px-2 py-0.5 text-xs font-mono border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer text-zinc-800"
                    >
                      +25 págs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPages(book.id, book.totalPages - book.currentPage)}
                      className="px-2 py-0.5 text-xs font-mono border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
                    >
                      Terminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección: Libros Pendientes y Terminados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pendientes */}
        <div className="border border-zinc-300 bg-white p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-2">
            Libros Pendientes ({pendingBooks.length})
          </h3>
          <div className="divide-y divide-zinc-200">
            {pendingBooks.map((b) => (
              <div key={b.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900 block">{b.title}</span>
                  <span className="text-[11px] text-zinc-500">{b.author} ({b.totalPages} págs)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPages(b.id, 1)}
                  className="px-2 py-1 text-[11px] font-mono border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer"
                >
                  Comenzar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Terminados */}
        <div className="border border-zinc-300 bg-white p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-2">
            Libros Concluidos ({finishedBooks.length})
          </h3>
          <div className="divide-y divide-zinc-200">
            {finishedBooks.map((b) => (
              <div key={b.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900 block">{b.title}</span>
                  <span className="text-[11px] text-zinc-500">{b.author}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2">
                  Completado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
