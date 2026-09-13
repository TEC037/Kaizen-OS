import React from 'react';
import { useUiData } from '../../data/store';
import { Icon } from '../Icon';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { history } = useUiData();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="history" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Historial de Entrenamientos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Icon name="history" size={32} className="text-[#444933]" />
              <p className="font-body text-sm text-[#c4c9ac]">
                Aún no hay entrenamientos registrados.
              </p>
            </div>
          ) : (
            history.map((w) => (
            <div
              key={w.id}
              className="p-3.5 rounded-xl bg-[#191c22] border border-white/[0.04] flex items-center justify-between hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${w.color}20`, color: w.color }}
                >
                  <Icon name={w.icon} size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-headline text-sm text-white font-semibold">
                    {w.title}
                  </span>
                  <span className="font-body text-xs text-[#c4c9ac]">
                    {w.dateLabel} • {w.duration}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-headline text-xs font-bold text-white">
                  {w.volume}
                </span>
                <span className="font-headline text-[10px] text-[#c4c9ac]">
                  {w.calories}
                </span>
              </div>
            </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white font-headline text-xs font-bold transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
