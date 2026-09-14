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
import { BookOpen, Plus } from 'lucide-react';
import { KzButton, KzCard, KzBadge } from '../../components/ui';

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
      {/* Encabezado del Módulo con delegación de layout al AppShell */}
      <KzCard variant="surface" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-kz-line">
        <div>
          <div className="flex items-center gap-2">
            <KzBadge variant="info">MÓDULO: /reading</KzBadge>
            <KzBadge variant="dim">v1.0.0</KzBadge>
          </div>
          <h1 className="text-xl font-bold text-kz-ink mt-1 tracking-tight flex items-center gap-2 font-mono">
            <BookOpen size={20} className="text-kz-accent" />
            <span>Biblioteca y Sesiones de Lectura</span>
          </h1>
          <p className="text-xs text-kz-ink-soft mt-0.5">
            Desarrollo intelectual mediante lectura deliberada y registro incremental de páginas (+1% intelectual).
          </p>
        </div>

        <div>
          <KzButton
            variant="primary"
            size="md"
            icon={<Plus size={14} />}
            onClick={() => {
              soundEngine.playTap();
              setShowAddModal(!showAddModal);
            }}
          >
            Añadir libro
          </KzButton>
        </div>
      </KzCard>

      {/* Modal / Formulario para añadir libro */}
      {showAddModal && (
        <KzCard variant="sunken" className="p-4 space-y-3 border-kz-line-strong">
          <form onSubmit={handleAddBook} className="space-y-3">
            <div className="font-mono text-xs font-bold text-kz-ink uppercase tracking-wider">
              Añadir nuevo libro a la biblioteca
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-kz-ink-soft mb-1">
                  Título del libro *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Solo una cosa"
                  required
                  className="w-full px-3 py-1.5 text-xs font-mono border border-kz-line bg-kz-surface text-kz-ink rounded-sm focus:outline-none focus:border-kz-line-strong"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-kz-ink-soft mb-1">
                  Autor
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ej: Gary Keller"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-kz-line bg-kz-surface text-kz-ink rounded-sm focus:outline-none focus:border-kz-line-strong"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-kz-ink-soft mb-1">
                  Total páginas
                </label>
                <input
                  type="number"
                  min={10}
                  value={totalPages}
                  onChange={(e) => setTotalPages(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-kz-line bg-kz-surface text-kz-ink rounded-sm focus:outline-none focus:border-kz-line-strong"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <KzButton
                variant="craft"
                size="sm"
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setShowAddModal(false);
                }}
              >
                Cancelar
              </KzButton>
              <KzButton
                variant="primary"
                size="sm"
                type="submit"
              >
                Guardar libro
              </KzButton>
            </div>
          </form>
        </KzCard>
      )}

      {/* Sección: Libros en Progreso */}
      <div className="space-y-3">
        <div className="border-b border-kz-line pb-1 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-kz-ink">
            Libros en Progreso ({inProgressBooks.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgressBooks.map((book) => {
            const percent = Math.round((book.currentPage / book.totalPages) * 100);
            return (
              <KzCard
                key={book.id}
                variant="surface"
                className="border-kz-line p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-kz-ink tracking-tight font-mono">
                        {book.title}
                      </h3>
                      <span className="text-xs text-kz-ink-soft">{book.author}</span>
                    </div>
                    <KzBadge variant={percent >= 100 ? 'success' : 'default'}>
                      {percent}%
                    </KzBadge>
                  </div>

                  <div className="w-full bg-kz-line h-2 rounded-xs overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all duration-300 rounded-xs ${percent >= 100 ? 'bg-kz-success' : 'bg-kz-ink'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-kz-ink-soft mt-1">
                    <span>Pág {book.currentPage} / {book.totalPages}</span>
                    <span>Quedan {book.totalPages - book.currentPage} págs</span>
                  </div>
                </div>

                {/* Botones rápidos de registro de sesión */}
                <div className="pt-2 border-t border-kz-line flex items-center justify-between">
                  <span className="text-[11px] text-kz-ink-dim font-mono">Registrar lectura:</span>
                  <div className="flex items-center gap-1.5">
                    <KzButton
                      variant="craft"
                      size="sm"
                      onClick={() => handleAddPages(book.id, 10)}
                    >
                      +10 págs
                    </KzButton>
                    <KzButton
                      variant="craft"
                      size="sm"
                      onClick={() => handleAddPages(book.id, 25)}
                    >
                      +25 págs
                    </KzButton>
                    <KzButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleAddPages(book.id, book.totalPages - book.currentPage)}
                    >
                      Terminar
                    </KzButton>
                  </div>
                </div>
              </KzCard>
            );
          })}
        </div>
      </div>

      {/* Sección: Libros Pendientes y Terminados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pendientes */}
        <KzCard variant="surface" className="border-kz-line p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-kz-ink border-b border-kz-line pb-2">
            Libros Pendientes ({pendingBooks.length})
          </h3>
          <div className="divide-y divide-kz-line">
            {pendingBooks.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-kz-ink font-mono block">{b.title}</span>
                  <span className="text-[11px] text-kz-ink-soft">{b.author} ({b.totalPages} págs)</span>
                </div>
                <KzButton
                  variant="craft"
                  size="sm"
                  onClick={() => handleAddPages(b.id, 1)}
                >
                  Comenzar
                </KzButton>
              </div>
            ))}
          </div>
        </KzCard>

        {/* Terminados */}
        <KzCard variant="surface" className="border-kz-line p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-kz-ink border-b border-kz-line pb-2">
            Libros Concluidos ({finishedBooks.length})
          </h3>
          <div className="divide-y divide-kz-line">
            {finishedBooks.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-kz-ink font-mono block">{b.title}</span>
                  <span className="text-[11px] text-kz-ink-soft">{b.author}</span>
                </div>
                <KzBadge variant="success">
                  Completado
                </KzBadge>
              </div>
            ))}
          </div>
        </KzCard>
      </div>
    </div>
  );
};
