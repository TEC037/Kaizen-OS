import React, { useState, useMemo } from 'react';
import { Routine } from '../types';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

interface RutinasScreenProps {
  onStartRoutine: (routine: Routine) => void;
  onCreateRoutineOpen: () => void;
  routinesList?: Routine[];
}

export const RutinasScreen: React.FC<RutinasScreenProps> = ({
  onStartRoutine,
  onCreateRoutineOpen,
  routinesList,
}) => {
  const { routines: storeRoutines } = useUiData();
  const routines = routinesList ?? storeRoutines;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');
  const [bookmarked, setBookmarked] = useState(true);

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'fuerza', label: 'Fuerza & Hipertrofia' },
    { id: 'cardio', label: 'Cardio / Intervalos' },
    { id: 'ppl', label: 'Empuje · Tirón · Pierna' },
    { id: 'movilidad', label: 'Movilidad' },
  ];

  const featuredRoutine = routines.find((r) => r.isFeatured) || routines[0];

  // Filter routines based on search and category
  const filteredRoutines = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return routines
      .filter((routine) => {
        // Exclude featured banner from normal list if wanted, or include
        if (routine.isFeatured) return false;

        const matchesQuery =
          !query ||
          routine.title.toLowerCase().includes(query) ||
          routine.description?.toLowerCase().includes(query) ||
          routine.tag.toLowerCase().includes(query) ||
          routine.difficulty.toLowerCase().includes(query);

        const matchesCategory =
          activeCategory === 'all' ||
          routine.category === activeCategory ||
          (activeCategory === 'fuerza' && (routine.category === 'fuerza' || routine.category === 'ppl'));

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.durationMinutes - b.durationMinutes;
        } else if (sortOrder === 'desc') {
          return b.durationMinutes - a.durationMinutes;
        }
        return 0;
      });
  }, [routines, searchQuery, activeCategory, sortOrder]);

  if (routines.length === 0) {
    return (
      <div className="flex flex-col w-full max-w-2xl mx-auto pb-32 pt-10 min-h-screen">
        <section className="px-4 flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20 rounded-full bg-[#272a31] flex items-center justify-center text-[#c4c9ac]">
            <Icon name="fitness_center" size={40} />
          </div>
          <h3 className="font-headline text-xl text-white font-bold">
            Tu plan aún no tiene rutinas
          </h3>
          <p className="font-body text-sm text-[#c4c9ac] max-w-sm">
            Crea tu primera rutina personalizada y empieza a entrenar. La podrás
            recuperar en cualquier momento.
          </p>
          <button
            id="create-first-routine-btn"
            onClick={onCreateRoutineOpen}
            type="button"
            className="mt-2 px-6 py-3 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-sm font-bold hover:brightness-105 transition-all cursor-pointer"
          >
            Crear mi primera rutina
          </button>
        </section>

        <div className="fixed bottom-20 inset-x-0 px-4 max-w-2xl mx-auto z-30 pointer-events-none">
          <button
            id="create-custom-routine-btn"
            onClick={onCreateRoutineOpen}
            type="button"
            className="pointer-events-auto w-full py-3.5 px-6 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-sm sm:text-base font-bold shadow-[0_4px_24px_rgba(195,244,0,0.38)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-105 cursor-pointer"
          >
            <Icon name="add_circle" size={24} />
            <span>Crear Rutina Personalizada</span>
          </button>
        </div>
      </div>
    );
  }

  const toggleSort = () => {
    if (sortOrder === 'default') setSortOrder('asc');
    else if (sortOrder === 'asc') setSortOrder('desc');
    else setSortOrder('default');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-32 pt-2">
      {/* Search & Active Filters Section */}
      <section className="px-4 flex flex-col gap-3">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c4c9ac]">
            <Icon name="search" size={20} />
          </div>
          <input
            id="search-routines-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ejercicio, músculo o rutina..."
            className="w-full pl-10 pr-10 py-3 bg-[#1d2026] rounded-xl font-body text-sm text-[#e1e2eb] placeholder:text-[#c4c9ac]/70 focus:outline-none focus:ring-1 focus:ring-[#c3f400] transition-colors shadow-sm border border-white/[0.04]"
          />
          {searchQuery.length > 0 && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c4c9ac] hover:text-white transition-colors cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>

        {/* Category Pills Filter Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
                className={`whitespace-nowrap px-4 py-2 rounded-full font-headline text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#c3f400] text-[#161e00] shadow-[0_0_14px_rgba(195,244,0,0.25)]'
                    : 'bg-[#1d2026] text-[#c4c9ac] hover:text-white hover:bg-[#272a31] border border-white/[0.04]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Routine Banner */}
      <section className="px-4 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-[#191c22] border border-white/[0.08] shadow-md flex flex-col">
          <div
            className="h-36 w-full bg-cover bg-center relative"
            style={{
              backgroundImage: `url('${featuredRoutine.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBBhroT9yGD5MVdzHxZYev9OBKeHu6aWxzeqqJG-8d5whs8zV1s8rOZaz_aXjfSnidr_LnsFbB6c_LK1hnHZHZ2qamycMeOxODfaj63fY9ALBcLrkRSYdVSCBHSvOtIz4Du5vZAFNDQtLBVckrzZ_kbvUHLY4-FKGsKW7ihGZs0jCmS1Sn852EO9Yk3i5sg0ApbqS9PLFsxAwklKls71I-MfHI4auXB2zQwgieGXjp1oWUdKvtni8HCg'}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#191c22] via-[#191c22]/60 to-transparent"></div>

            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-[10px] uppercase tracking-wider font-bold shadow-sm">
                <Icon name="local_fire_department" size={13} />
                Más Popular
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1">
              <button
                id="bookmark-featured-btn"
                aria-label="Guardar rutina destacada"
                type="button"
                onClick={() => setBookmarked(!bookmarked)}
                className={`w-8 h-8 rounded-full bg-[#101319]/70 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                  bookmarked ? 'text-[#c3f400]' : 'text-white hover:text-[#c3f400]'
                }`}
              >
                <Icon name="bookmark" size={18} />
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-1 -mt-2 relative z-10">
            <h2 className="font-headline text-lg sm:text-xl text-white font-bold tracking-tight">
              {featuredRoutine.title}
            </h2>
            <p className="font-body text-xs text-[#c4c9ac] line-clamp-1">
              {featuredRoutine.description}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 bg-[#0b0e14]/60 rounded-xl px-3 py-2 border border-white/[0.04]">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1 text-[#c4c9ac]">
                  <Icon name="timer" size={16} className="text-[#c3f400]" />
                  <span className="font-headline text-xs text-white font-semibold">
                    {featuredRoutine.durationMinutes} min/sesión
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[#c4c9ac]">
                  <Icon name="calendar_month" size={16} className="text-[#4ae176]" />
                  <span className="font-headline text-xs text-white font-semibold">
                    {featuredRoutine.daysPerWeek ?? 4} días/sem
                  </span>
                </div>
              </div>

              <button
                id="start-featured-routine-btn"
                onClick={() => onStartRoutine(featuredRoutine)}
                type="button"
                className="flex items-center gap-1 text-[#c3f400] font-headline text-xs font-bold hover:underline cursor-pointer"
              >
                <span>Iniciar</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Routine Cards List Header */}
      <section className="px-4 mt-6 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-headline text-base text-white font-bold">
            Rutinas Disponibles
          </h3>
          <span
            id="routines-counter"
            className="px-2 py-0.5 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-bold"
          >
            {filteredRoutines.length}
          </span>
        </div>

        <button
          id="sort-difficulty-btn"
          onClick={toggleSort}
          type="button"
          className="flex items-center gap-1 text-[#c4c9ac] hover:text-white transition-colors font-headline text-xs font-semibold cursor-pointer"
        >
          <Icon name="swap_vert" size={18} />
          <span>
            {sortOrder === 'asc' ? 'Duración ↑' : sortOrder === 'desc' ? 'Duración ↓' : 'Dificultad'}
          </span>
        </button>
      </section>

      {/* Routines Cards List */}
      <section className="px-4 flex flex-col gap-3">
        {filteredRoutines.map((routine) => (
          <article
            key={routine.id}
            className="group relative overflow-hidden bg-[#1d2026] rounded-xl p-4 shadow-sm hover:shadow-md border border-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full font-headline text-[10px] uppercase font-bold tracking-wider ${
                      routine.tag === 'FUERZA'
                        ? 'bg-[#c3f400]/15 text-[#c3f400]'
                        : routine.tag === 'HIPERTROFIA'
                        ? 'bg-[#7bd0ff]/20 text-[#7bd0ff]'
                        : routine.tag === 'VOLUMEN'
                        ? 'bg-[#c3f400] text-[#556d00] font-extrabold'
                        : 'bg-[#4ae176]/20 text-[#4ae176]'
                    }`}
                  >
                    {routine.tag}
                  </span>

                  <span
                    className={`inline-flex items-center gap-0.5 font-headline text-[11px] font-bold ${
                      routine.difficulty === 'Extrema'
                        ? 'text-[#ffb4ab]'
                        : 'text-[#4ae176]'
                    }`}
                  >
<Icon
                      name={routine.difficulty === 'Extrema' ? 'whatshot' : 'bolt'}
                      size={13}
                    />
                    {routine.difficulty}
                  </span>
                </div>

                <h4 className="font-headline text-base text-white font-bold truncate">
                  {routine.title}
                </h4>
              </div>

              <button
                aria-label="Opciones de rutina"
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31] transition-colors cursor-pointer"
              >
                <Icon name="more_vert" size={20} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[#c4c9ac]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 font-body text-xs">
                  <Icon name="fitness_center" size={16} />
                  <span>{routine.exercisesCount} ejercicios</span>
                </div>
                <div className="flex items-center gap-1 font-body text-xs">
                  <Icon name="schedule" size={16} />
                  <span>{routine.durationMinutes} min</span>
                </div>
              </div>

              {/* Muscle Focus Mini Icons */}
              <div className="flex items-center gap-1">
                {routine.muscleIcons.map((icon, i) => (
                  <span
                    key={i}
                    className="w-6 h-6 rounded-md bg-[#272a31] flex items-center justify-center text-[#c4c9ac] group-hover:text-[#c3f400] transition-colors"
                  >
                    <Icon name={icon} size={14} />
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action Row */}
            <div className="mt-3.5 pt-2.5 flex items-center justify-between bg-[#191c22] rounded-lg px-3 py-2 border border-white/[0.03]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    routine.recordNote
                      ? 'bg-[#00b954]'
                      : routine.lastPerformed?.includes('hace')
                      ? 'bg-[#4ae176]'
                      : 'bg-[#c4c9ac]/40'
                  }`}
                ></span>
                <span className="font-headline text-[11px] text-[#c4c9ac]">
                  {routine.recordNote
                    ? routine.recordNote
                    : routine.lastPerformed
                    ? routine.lastPerformed.includes('hace')
                      ? `Última vez: ${routine.lastPerformed}`
                      : routine.lastPerformed
                    : 'Lista para entrenar'}
                </span>
              </div>

              <button
                onClick={() => onStartRoutine(routine)}
                type="button"
                className="px-3.5 py-1 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold hover:scale-[0.98] transition-transform cursor-pointer shadow-sm"
              >
                Comenzar
              </button>
            </div>
          </article>
        ))}

        {/* Empty state container */}
        {filteredRoutines.length === 0 && (
          <div
            id="no-results-state"
            className="px-4 py-12 flex flex-col items-center justify-center text-center bg-[#1d2026] rounded-2xl border border-white/[0.04]"
          >
            <div className="w-16 h-16 rounded-full bg-[#272a31] flex items-center justify-center text-[#c4c9ac] mb-3">
              <Icon name="manage_search" size={32} />
            </div>
            <h5 className="font-headline text-base text-white font-bold">
              No se encontraron rutinas
            </h5>
            <p className="font-body text-xs text-[#c4c9ac] max-w-xs mt-1">
              Intenta con otros términos de búsqueda o borra los filtros de
              categoría activos.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              type="button"
              className="mt-4 px-4 py-2 rounded-full bg-[#272a31] text-white font-headline text-xs font-semibold hover:bg-[#32353c] transition-colors cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </section>

      {/* Bottom Sticky Action Zone */}
      <div className="fixed bottom-20 inset-x-0 px-4 max-w-2xl mx-auto z-30 pointer-events-none">
        <button
          id="create-custom-routine-btn"
          onClick={onCreateRoutineOpen}
          type="button"
          className="pointer-events-auto w-full py-3.5 px-6 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-sm sm:text-base font-bold shadow-[0_4px_24px_rgba(195,244,0,0.38)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-105 cursor-pointer"
        >
          <Icon name="add_circle" size={24} />
          <span>Crear Rutina Personalizada</span>
        </button>
      </div>
    </div>
  );
};
