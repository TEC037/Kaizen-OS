import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { SocialRepository } from '../repositories/SocialRepository';
import { haptics } from '../utils/haptics';
import { toast } from 'sonner';
import { Search, Zap, Users, Globe, UserMinus, Flame, Shield, Crown } from 'lucide-react';
import MonolithText from './MonolithText';
import CollectiveGeode from './CollectiveGeode';
import AdeptFirmament from './AdeptFirmament';


const tiempoRelativo = (fecha) => {
  if (!fecha) return '';
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins}m`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `Hace ${horas}h`;
  return new Date(fecha).toLocaleDateString();
};

const getTipoEvento = (type) => {
  switch (type) {
    case 'habit_completed': return { etiqueta: 'Transmutación', icono: Zap, color: 'text-amber-500' };
    case 'streak_milestone': return { etiqueta: 'Racha Épica', icono: Flame, color: 'text-orange-500' };
    case 'level_up': return { etiqueta: 'Ascensión de Nivel', icono: Shield, color: 'text-blue-500' };
    case 'rank_achieved': return { etiqueta: 'Rango Alcanzado', icono: Crown, color: 'text-purple-500' };
    default: return { etiqueta: 'Evento', icono: Zap, color: 'text-gray-400' };
  }
};


function EventoCard({ evento, sessionUserId, onReaccionar }) {
  const [reaccionado, setReaccionado] = useState(false);
  const perfil = evento.profiles || {};
  const nombre = perfil.display_name || 'Adepto';
  const nivel = perfil.level || 1;
  const inicial = nombre[0]?.toUpperCase() || 'A';
  const tipo = getTipoEvento(evento.type);
  const Icono = tipo.icono;

  const payload = evento.payload || {};
  const detalle = payload.habitName
    ? `${payload.habitName}${payload.streak > 0 ? ` · Racha ${payload.streak}` : ''}`
    : payload.newLevel
    ? `Nivel ${payload.newLevel} alcanzado`
    : null;

  const handleReaccion = (e) => {
    if (reaccionado || evento.user_id === sessionUserId) return;
    setReaccionado(true);
    if (onReaccionar) onReaccionar(evento.id, e.clientX, e.clientY);
  };

  const handleVerPerfil = () => {
    if (window.onInspectAdept) window.onInspectAdept(evento.user_id);
  };

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 border border-[var(--color-midnight)]/5 flex items-start gap-3"
    >
      <div className="flex-shrink-0 relative cursor-pointer" onClick={handleVerPerfil}>
        <div className="w-10 h-10 rounded-full bg-[var(--color-midnight)]/8 border border-[var(--color-midnight)]/10 flex items-center justify-center font-black font-serif text-sm text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-colors">
          {inicial}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--bg-porcelain)] flex items-center justify-center border border-[var(--color-midnight)]/10 shadow-sm">
          <Icono size={8} className={tipo.color} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-black font-serif text-[var(--color-midnight)] truncate">{nombre}</span>
          <span className="text-[8px] font-semibold opacity-30 uppercase tracking-widest">Nv.{nivel}</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${tipo.color} opacity-80 block mt-0.5`}>
          {tipo.etiqueta}
        </span>
        {detalle && <p className="text-[10px] opacity-60 mt-1 font-serif truncate">{detalle}</p>}
        <span className="text-[8px] opacity-30 font-semibold mt-1 block">{tiempoRelativo(evento.created_at)}</span>
      </div>

      {evento.user_id !== sessionUserId && (
        <motion.button
          whileTap={{ scale: 0.85 }} onClick={handleReaccion}
          className={`flex-shrink-0 flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all
            ${reaccionado ? 'text-[var(--color-gold)] bg-[var(--color-gold)]/10' : 'opacity-30 hover:opacity-100'}`}
        >
          <Zap size={14} />
          <span className="text-[7px] font-black uppercase tracking-widest">Resonar</span>
        </motion.button>
      )}
    </motion.div>
  );
}


function PanelColectivo({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {[
        { label: 'Adeptos Activos', valor: stats?.totalUsers ?? '—' },
        { label: 'Transmutaciones', valor: stats?.totalCompletions ?? '—' },
      ].map(({ label, valor }) => (
        <div key={label} className="glass-card p-4 border border-[var(--color-midnight)]/5">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 font-serif block mb-1">{label}</span>
          <span className="text-2xl font-black font-serif text-[var(--color-midnight)]">
            {loading ? '···' : valor.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}


function Conclave() {
  const { session, triggerPulse } = useStore();
  const userId = session?.user?.id;

  const [tab, setTab] = useState('feed');
  const [feed, setFeed] = useState([]);
  const [aliados, setAliados] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [inspectedAdeptId, setInspectedAdeptId] = useState(null);

  
  useEffect(() => {
    window.onInspectAdept = (id) => setInspectedAdeptId(id);
    return () => delete window.onInspectAdept;
  }, []);

  
  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      setLoading(true);
      try {
        const [f, a, s] = await Promise.all([
          SocialRepository.getAllyFeed(userId),
          SocialRepository.getAlliances(userId),
          SocialRepository.getCollectiveStats()
        ]);
        setFeed(f);
        setAliados(a);
        setStats(s);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };

    init();

    const channel = SocialRepository.subscribeToFeed((event) => {
      setFeed(prev => [event, ...prev].slice(0, 50));
      if (event.user_id !== userId) haptics.impactLight();
    });

    return () => channel?.unsubscribe();
  }, [userId]);

  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        const results = await SocialRepository.searchGlobal(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleReaccionar = async (id, x, y) => {
    if (x && y) triggerPulse(x, y);
    await SocialRepository.emitReaction(userId, id, 'resonance');
  };

  const handleFollow = async (id) => {
    const success = await SocialRepository.forgeAlliance(userId, id);
    if (success) {
      toast.success("Alianza Forjada");
      const list = await SocialRepository.getAlliances(userId);
      setAliados(list);
      setSearchQuery('');
    }
  };

  const handleUnfollow = async (id) => {
    await SocialRepository.dissolveAlliance(userId, id);
    setAliados(prev => prev.filter(a => (a.profiles?.id || a.id) !== id));
    toast.success("Alianza Disuelta");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {}
      <header className="py-12 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-midnight)] opacity-30 font-serif block mb-2">
          La Cámara de Sincronía
        </span>
        <h1 className="text-4xl font-black font-serif text-[var(--color-midnight)] tracking-tighter uppercase mb-2">
          <MonolithText text="Conclave" isActive={true} />
        </h1>
        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-gold)] font-serif">
          Sincronía Colectiva
        </p>
      </header>

      {}
      <div className="flex gap-1 mb-8 bg-[var(--color-midnight)]/5 p-1 rounded-2xl">
        {[
          { id: 'feed', icon: Zap, label: 'Flujo' },
          { id: 'aliados', icon: Users, label: 'Aliados' },
          { id: 'colectivo', icon: Globe, label: 'Atanor' }
        ].map(t => (
          <button
            key={t.id} onClick={() => { setTab(t.id); haptics.impactLight(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all
              ${tab === t.id ? 'bg-[var(--bg-porcelain)] shadow-sm text-[var(--color-midnight)]' : 'opacity-40 text-[var(--color-midnight)]'}`}
          >
            <t.icon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {}
      <AnimatePresence mode="wait">
        {tab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
            {feed.map(ev => <EventoCard key={ev.id} evento={ev} sessionUserId={userId} onReaccionar={handleReaccionar} />)}
            {feed.length === 0 && !loading && (
              <div className="glass-card p-12 text-center border-dashed border-2 border-[var(--color-midnight)]/5 opacity-40">
                <p className="font-serif italic text-sm">El flujo está en calma. Forja alianzas para ver la actividad.</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'aliados' && (
          <motion.div key="aliados" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {/* Buscador de Adeptos */}
            <div className="glass-card bg-[var(--color-midnight)] text-[var(--bg-porcelain)] p-6 mb-8 border border-[var(--color-gold)]/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Users size={64} />
              </div>
              <h3 className="text-lg font-serif font-black uppercase mb-1">Forjar Alianzas</h3>
              <p className="text-[10px] font-sans font-black uppercase tracking-widest opacity-40 mb-6 max-w-xs">Encuentra a otros adeptos para sincronizar voluntades y potenciar la Gran Obra.</p>
              
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                <input
                  type="text" 
                  placeholder="Buscar adepto por nombre..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-[var(--color-gold)]/50 transition-all font-serif placeholder:text-white/20"
                />
                {isSearching && <Zap className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-gold)]" size={16} />}
              </div>
            </div>

            {/* Resultados de Búsqueda */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-10 flex flex-col gap-3">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 px-2 mb-2 italic">Revelaciones del Atanor</h4>
                  {searchResults.map(res => {
                    const isAlly = aliados.some(a => (a.profiles?.id || a.following_id) === res.id);
                    if (res.id === userId) return null;
                    return (
                      <div key={res.id} className="glass-card p-5 flex items-center justify-between border border-[var(--color-midnight)]/5 shadow-sm hover:border-[var(--color-gold)]/30 transition-all">
                        <div className="flex flex-col">
                          <span className="text-sm font-black font-serif text-[var(--color-midnight)]">{res.display_name}</span>
                          <span className="text-[9px] font-black uppercase opacity-20 tracking-widest">Nivel {res.level || 1}</span>
                        </div>
                        {isAlly ? (
                          <div className="flex items-center gap-2 text-[var(--color-gold)] opacity-50">
                            <span className="text-[9px] font-black uppercase tracking-widest">Aliado</span>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleFollow(res.id)} 
                            className="px-6 py-2 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[var(--color-gold)] hover:text-[var(--color-midnight)] transition-all shadow-md"
                          >
                            Aliar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {}
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-2">Tus Alianzas Actuales</h4>
              {aliados.map(a => (
                <div key={a.profiles?.id || a.id} className="glass-card p-4 flex items-center justify-between border border-[var(--color-midnight)]/5">
                  <span className="text-sm font-black font-serif">{a.profiles?.display_name || 'Adepto'}</span>
                  <button onClick={() => handleUnfollow(a.profiles?.id || a.id)} className="opacity-20 hover:opacity-100 hover:text-red-500 transition-all"><UserMinus size={16} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'colectivo' && (
          <motion.div key="colectivo" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <PanelColectivo stats={stats} loading={loading} />
            <div className="glass-card p-6 border border-[var(--color-midnight)]/5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-center mb-6 opacity-30">Atanor Colectivo</h4>
              <div className="h-64 flex items-center justify-center">
                <CollectiveGeode points={feed.length * 10} />
              </div>
              <p className="text-[10px] text-center opacity-40 italic mt-6 px-8">
                El Atanor Colectivo brilla con la suma de todas nuestras voluntades. Cada transmutación alimenta el fuego común.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {inspectedAdeptId && (
          <AdeptFirmament 
            userId={inspectedAdeptId} 
            onClose={() => setInspectedAdeptId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Conclave;
