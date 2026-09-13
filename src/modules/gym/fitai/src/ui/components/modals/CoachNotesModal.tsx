import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../../context/useApp';
import { Icon } from '../Icon';

interface CoachNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachNotesModal: React.FC<CoachNotesModalProps> = ({ isOpen, onClose }) => {
  const { chatMessages, sendCoachMessage, isCoachTyping } = useApp();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages, isCoachTyping, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isCoachTyping) return;
    sendCoachMessage(text);
    setDraft('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="smart_toy" size={22} className="text-[#7bd0ff]" />
            <div>
              <h3 className="font-headline text-lg text-white font-bold">
                Coach IA
              </h3>
              <span className="font-headline text-[10px] text-[#c4c9ac]">
                Técnica, descanso, sustituciones y programación
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar chat del coach"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex flex-col gap-2.5 overflow-y-auto min-h-0 pr-1"
          style={{ maxHeight: '50vh' }}
        >
          {chatMessages.length === 0 ? (
            <p className="font-body text-xs text-[#c4c9ac] leading-relaxed p-3.5 rounded-xl bg-[#272a31]">
              Pregúntame sobre técnica, tiempos de descanso, sustituciones o ajustes de
              tu rutina. Tus mensajes se guardan en tu perfil.
            </p>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'self-end bg-[#272a31] text-[#e1e2eb]'
                    : 'self-start bg-[#191c22] border-l-4 border-[#c3f400]'
                }`}
              >
                {msg.sender === 'coach' && (
                  <span className="font-headline text-[10px] font-bold text-[#c3f400] uppercase tracking-wide block mb-1">
                    Coach IA
                  </span>
                )}
                <p className="font-body text-xs leading-relaxed">{msg.text}</p>
                <span className="font-headline text-[10px] text-[#c4c9ac] block mt-1.5 text-right">
                  {msg.timestamp}
                </span>
              </div>
            ))
          )}

          {isCoachTyping && (
            <div className="p-3 rounded-xl self-start bg-[#191c22] border-l-4 border-[#c3f400]">
              <span className="font-headline text-[10px] font-bold text-[#c3f400] uppercase tracking-wide block mb-1">
                Coach IA
              </span>
              <span className="font-body text-xs text-[#c4c9ac]">Escribiendo…</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Escribe tu pregunta…"
            aria-label="Mensaje al coach"
            className="flex-1 rounded-full bg-[#272a31] px-4 py-2.5 text-sm text-white placeholder-[#c4c9ac] outline-none focus:ring-2 focus:ring-[#c3f400]/40 border border-transparent"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isCoachTyping || draft.trim().length === 0}
            aria-label="Enviar mensaje"
            className="w-11 h-11 shrink-0 rounded-full bg-[#c3f400] text-[#171a1f] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <Icon name="send" size={20} />
          </button>
        </div>

        <p className="font-body text-[10px] text-[#c4c9ac] leading-relaxed">
          El Coach IA no sustituye la valoración de un profesional de la salud ni del
          entrenamiento. Ante dolor, mareos o signos de alarma, detén el ejercicio y
          consulta a un profesional.
        </p>
      </div>
    </div>
  );
};