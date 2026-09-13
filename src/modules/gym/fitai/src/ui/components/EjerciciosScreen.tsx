import React, { useState, useEffect, useMemo } from 'react';
import { DatasetExercise } from '../../types';
import { Exercise as UiExercise } from '../types';
import {
  loadExerciseDatabase,
  searchExercises,
  getAvailableCategories,
  getAvailableEquipment,
  getAvailableTargets,
  getExerciseGifUrl,
  getExerciseImageUrl,
  translateEquipment,
  translateTarget,
  datasetToRoutineExercise,
  EXERCISE_DATABASE,
} from '../../services/exerciseDatabaseService';
import { ExerciseDetailModal } from './modals/ExerciseDetailModal';
import { Icon } from './Icon';

interface EjerciciosScreenProps {
  onSelectExercise: (exercise: UiExercise) => void;
  favorites: string[];
  onToggleFavorite: (exerciseId: string) => void;
}

export const EjerciciosScreen: React.FC<EjerciciosScreenProps> = ({
  onSelectExercise,
  favorites,
  onToggleFavorite,
}) => {
  const [isLoading, setIsLoading] = useState(() => EXERCISE_DATABASE.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeEquipment, setActiveEquipment] = useState<string>('all');
  const [activeTarget, setActiveTarget] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const [selectedExercise, setSelectedExercise] = useState<DatasetExercise | null>(null);

  useEffect(() => {
    let mounted = true;
    if (EXERCISE_DATABASE.length === 0) {
      void loadExerciseDatabase()
        .then(() => {
          if (mounted) setIsLoading(false);
        })
        .catch(() => {
          if (mounted) setIsLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Filter Categories
  const categories = useMemo(() => {
    return [{ id: 'all', label: 'Todas las Categorías' }, ...getAvailableCategories()];
  }, [isLoading]);

  // Filter Equipment
  const equipmentList = useMemo(() => {
    return [{ id: 'all', label: 'Todo Equipamiento' }, ...getAvailableEquipment()];
  }, [isLoading]);

  // Filter Targets
  const targetsList = useMemo(() => {
    return [{ id: 'all', label: 'Todos los Músculos' }, ...getAvailableTargets()];
  }, [isLoading]);

  // Search results from service
  const { items: filteredExercises, total } = useMemo(() => {
    if (isLoading) return { items: [], total: 0 };
    return searchExercises({
      query: searchQuery,
      category: activeCategory,
      equipment: activeEquipment,
      target: activeTarget,
      limit: 1000,
      offset: 0,
    });
  }, [searchQuery, activeCategory, activeEquipment, activeTarget, isLoading]);

  const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
  const currentExercises = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExercises.slice(start, start + itemsPerPage);
  }, [filteredExercises, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddExerciseToRoutine = (item: DatasetExercise) => {
    const realEx = datasetToRoutineExercise(item);
    const targetReps = parseInt((realEx.reps.match(/\d+/) ?? ['10'])[0], 10) || 10;
    const uiEx: UiExercise = {
      id: realEx.id,
      name: realEx.name,
      targetMuscles: realEx.targetMuscles.join(', '),
      gifUrl: getExerciseGifUrl(realEx.gifUrl),
      imageUrl: getExerciseImageUrl(realEx.image),
      attribution: realEx.attribution,
      videoUrl: getExerciseGifUrl(realEx.gifUrl),
      notes: realEx.technicalCue,
      rpe: realEx.rpe,
      sets: Array.from({ length: Math.max(1, realEx.sets) }, (_, i) => ({
        id: i + 1,
        setNumber: i + 1,
        weight: realEx.suggestedWeightKg,
        reps: targetReps,
        targetReps,
        completed: false,
        isActive: i === 0,
      })),
    };
    onSelectExercise(uiEx);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28 pt-2">
      {/* Top Banner / Dataset Overview */}
      <section className="px-4 mb-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#191c22] p-4 shadow-md border border-white/[0.06]">
          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1d2026] text-[#c3f400] w-max border border-white/[0.06]">
                <Icon name="database" size={14} />
                <span className="font-headline text-[10px] font-bold uppercase tracking-wider">
                  Catálogo Oficial • 1,324 Ejercicios
                </span>
              </div>
              <h1 className="font-headline text-2xl sm:text-3xl text-white font-bold tracking-tight">
                Ejercicios
              </h1>
              <p className="font-body text-xs text-[#c4c9ac]">
                Explora la guía ilustrada con GIFs y técnica biomecánica oficial de Gym Visual.
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#272a31] shrink-0 flex items-center justify-center text-[#c3f400] border border-white/[0.08]">
              <Icon name="fitness_center" size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="px-4 flex flex-col gap-3">
        {/* Search Input */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c4c9ac]">
            <Icon name="search" size={20} />
          </div>
          <input
            id="exercise-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por ejercicio (ej. press banca, sentadilla, bíceps)..."
            className="w-full pl-10 pr-10 py-3 bg-[#1d2026] rounded-xl font-body text-sm text-[#e1e2eb] placeholder:text-[#c4c9ac]/70 focus:outline-none focus:ring-1 focus:ring-[#c3f400] transition-colors shadow-sm border border-white/[0.04]"
          />
          {searchQuery.length > 0 && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c4c9ac] hover:text-white transition-colors cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* Category Carousel Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => {
                setActiveCategory(cat.id);
                setCurrentPage(1);
              }}
              type="button"
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-headline text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#c3f400] text-[#161e00] shadow-[0_0_12px_rgba(195,244,0,0.25)]'
                  : 'bg-[#1d2026] text-[#c4c9ac] hover:text-white hover:bg-[#272a31] border border-white/[0.04]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Equipment & Target Dropdowns */}
        <div className="grid grid-cols-2 gap-2">
          <select
            id="equipment-filter-dropdown"
            value={activeEquipment}
            onChange={(e) => {
              setActiveEquipment(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#1d2026] rounded-xl font-headline text-xs text-[#e1e2eb] focus:outline-none focus:ring-1 focus:ring-[#c3f400] cursor-pointer border border-white/[0.04]"
          >
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.label}
              </option>
            ))}
          </select>

          <select
            id="target-filter-dropdown"
            value={activeTarget}
            onChange={(e) => {
              setActiveTarget(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#1d2026] rounded-xl font-headline text-xs text-[#e1e2eb] focus:outline-none focus:ring-1 focus:ring-[#c3f400] cursor-pointer border border-white/[0.04]"
          >
            {targetsList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results Counter & Pagination Info */}
      <section className="px-4 mt-3 mb-2">
        <div className="flex items-center justify-between">
          <span className="font-headline text-sm text-white font-semibold">
            {total} ejercicio{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </span>
          <span className="font-headline text-xs text-[#c4c9ac]">
            Página {currentPage} de {totalPages || 1}
          </span>
        </div>
      </section>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="px-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-[#1d2026] rounded-xl p-3 h-48 animate-pulse flex flex-col justify-between"
            >
              <div className="w-full h-24 bg-[#272a31] rounded-lg" />
              <div className="w-3/4 h-4 bg-[#272a31] rounded mt-2" />
              <div className="w-1/2 h-3 bg-[#272a31] rounded" />
            </div>
          ))}
        </div>
      ) : (
        /* Exercises Grid */
        <section className="px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentExercises.map((exercise) => {
              const gifUrl = getExerciseGifUrl(exercise.gif_url);
              const imageUrl = getExerciseImageUrl(exercise.image);
              const mediaUrl = gifUrl || imageUrl;
              const isFav = favorites.includes(exercise.id);

              return (
                <article
                  key={exercise.id}
                  className="group relative overflow-hidden bg-[#1d2026] rounded-xl p-3 shadow-sm hover:shadow-md border border-white/[0.05] hover:border-white/[0.12] transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Media Preview */}
                  <div
                    onClick={() => setSelectedExercise(exercise)}
                    className="relative aspect-square rounded-lg overflow-hidden bg-[#0b0e14] mb-2 cursor-pointer flex items-center justify-center group-hover:brightness-110 transition-all"
                  >
                    {mediaUrl ? (
                      <img
                        src={mediaUrl}
                        alt={exercise.name}
                        loading="lazy"
                        draggable={false}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Icon name="fitness_center" size={28} className="text-[#444933]" />
                    )}

                    {/* Attribution Tag */}
                    <span className="absolute bottom-0.5 right-1 px-1 py-0.5 bg-black/60 rounded text-[8px] text-white/70 font-headline select-none">
                      {exercise.attribution || '© Gym visual'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1 flex-1">
                    <h3
                      onClick={() => setSelectedExercise(exercise)}
                      className="font-headline text-xs sm:text-sm text-white font-bold capitalize line-clamp-1 cursor-pointer hover:text-[#c3f400] transition-colors"
                    >
                      {exercise.name}
                    </h3>
                    <p className="font-body text-[10px] text-[#c4c9ac] line-clamp-1">
                      {translateTarget(exercise.target)} • {translateEquipment(exercise.equipment)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      aria-label={`Favorito ${exercise.name}`}
                      onClick={() => onToggleFavorite(exercise.id)}
                      className="w-7 h-7 rounded-full bg-[#272a31] flex items-center justify-center transition-colors cursor-pointer hover:bg-[#32353c]"
                    >
                      <Icon
                        name={isFav ? 'favorite' : 'favorite_border'}
                        size={14}
                        className={isFav ? 'text-[#4ae176]' : 'text-[#c4c9ac]'}
                      />
                    </button>

                    <button
                      type="button"
                      aria-label={`Detalles de ${exercise.name}`}
                      onClick={() => setSelectedExercise(exercise)}
                      className="px-2 py-1 rounded-md bg-[#272a31] text-[#c4c9ac] hover:text-white font-headline text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Ver técnica
                    </button>

                    <button
                      type="button"
                      aria-label={`Añadir ${exercise.name}`}
                      onClick={() => handleAddExerciseToRoutine(exercise)}
                      className="w-7 h-7 rounded-full bg-[#c3f400] text-[#161e00] flex items-center justify-center hover:bg-[#b0dc00] transition-colors cursor-pointer"
                    >
                      <Icon name="add" size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!isLoading && filteredExercises.length === 0 && (
        <div
          id="no-results-state"
          className="mx-4 my-8 p-8 flex flex-col items-center justify-center text-center bg-[#1d2026] rounded-2xl border border-white/[0.04]"
        >
          <div className="w-14 h-14 rounded-full bg-[#272a31] flex items-center justify-center text-[#c4c9ac] mb-3">
            <Icon name="search_off" size={28} />
          </div>
          <h3 className="font-headline text-base text-white font-bold">
            No se encontraron ejercicios
          </h3>
          <p className="font-body text-xs text-[#c4c9ac] max-w-xs mt-1">
            Prueba a buscar con otros términos o limpia los filtros de equipamiento y músculo.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setActiveEquipment('all');
              setActiveTarget('all');
              setCurrentPage(1);
            }}
            type="button"
            className="mt-4 px-4 py-2 rounded-full bg-[#272a31] text-white font-headline text-xs font-semibold hover:bg-[#32353c] transition-colors cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 mt-6 mb-4">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              id="prev-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              type="button"
              className="w-8 h-8 rounded-full bg-[#1d2026] hover:bg-[#32353c] text-[#c4c9ac] hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_left" size={16} />
            </button>

            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 7) {
                if (currentPage > 4) {
                  p = currentPage - 3 + i;
                }
                if (p > totalPages) {
                  p = totalPages - (6 - i);
                }
              }
              return (
                <button
                  key={p}
                  id={`page-${p}`}
                  onClick={() => handlePageChange(p)}
                  type="button"
                  className={`w-8 h-8 rounded-full font-headline text-xs font-semibold transition-all cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#c3f400] text-[#161e00]'
                      : 'bg-[#1d2026] text-[#c4c9ac] hover:text-white hover:bg-[#32353c]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              id="next-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              type="button"
              className="w-8 h-8 rounded-full bg-[#1d2026] hover:bg-[#32353c] text-[#c4c9ac] hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="chevron_right" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        exercise={selectedExercise}
        onSelectExercise={(item) => {
          handleAddExerciseToRoutine(item);
        }}
        isFavorite={selectedExercise ? favorites.includes(selectedExercise.id) : false}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
};
