import React from 'react';
import { useUiData } from '../../data/store';
import { Icon } from '../Icon';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({ isOpen, onClose }) => {
  const { profile, personalRecords } = useUiData();
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = [
      ['Atleta', profile.name],
      ['Email', profile.email],
      ['Tonelaje Mensual (kg)', profile.monthlyTonnageKg],
      ['Sesiones Mensuales', profile.monthlySessions],
      ['Racha actual (dias)', profile.currentStreakDays],
      ['Peso actual (kg)', profile.weight],
      [],
      ['Ejercicio', 'Peso', 'Unidad', 'Fecha'],
      ...personalRecords.map((pr) => [pr.exercise, pr.weight, pr.unit, pr.date]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_rendimiento_${profile.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#1d2026] p-6 border border-white/[0.1] shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="picture_as_pdf" size={24} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Informe de Rendimiento Punto Fuerte
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* PDF Document Preview Sheet */}
        <div className="bg-[#101319] p-5 rounded-xl border border-white/[0.08] flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <span className="font-headline text-lg font-bold text-white tracking-tight">
                Punto Fuerte Athletic Report
              </span>
              <p className="font-body text-xs text-[#c4c9ac]">
                Atleta: {profile.name} • Período: {profile.monthName}
              </p>
            </div>
            <span className="font-headline text-[10px] px-2.5 py-1 rounded-full bg-[#c3f400]/20 text-[#c3f400] font-bold">
              ESTADO ÓPTIMO
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[#191c22] rounded-lg">
              <span className="font-headline text-xs text-[#c4c9ac]">Tonelaje Mensual</span>
              <p className="font-headline text-base font-bold text-white mt-0.5">
                {profile.monthlyTonnageKg.toLocaleString()} kg
              </p>
            </div>
            <div className="p-2.5 bg-[#191c22] rounded-lg">
              <span className="font-headline text-xs text-[#c4c9ac]">Sesiones Completadas</span>
              <p className="font-headline text-base font-bold text-[#4ae176] mt-0.5">
                {profile.monthlySessions} / {profile.weekGoalPercent}%
              </p>
            </div>
            <div className="p-2.5 bg-[#191c22] rounded-lg">
              <span className="font-headline text-xs text-[#c4c9ac]">Tiempo Acumulado</span>
              <p className="font-headline text-base font-bold text-white mt-0.5">
                {profile.monthlyTotalTime}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-headline text-xs font-bold text-[#c3f400] uppercase tracking-wider mb-2">
              Récords Personales Registrados (1 repetición máxima)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="p-2 bg-[#191c22] rounded-lg flex items-center justify-between"
                >
                  <span className="font-headline text-xs text-white">{pr.exercise}</span>
                  <span className="font-headline text-xs font-bold text-[#c3f400]">
                    {pr.weight} {pr.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-3 flex items-center justify-between text-xs text-[#c4c9ac]">
            <span>
              Grasa estimada: {profile.bodyFatPercent !== null ? `${profile.bodyFatPercent}%` : '—'}
            </span>
            <span>
              Masa magra: {profile.leanMassKg !== null ? `${profile.leanMassKg} kg` : '—'}
            </span>
            <span>Peso: {profile.weight} kg</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex-1 py-2.5 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-semibold hover:text-white"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full sm:w-auto flex-1 py-2.5 rounded-full bg-[#272a31] hover:bg-[#32363e] text-[#c3f400] font-headline text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <Icon name="download" size={16} />
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto flex-1 py-2.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold hover:brightness-105 shadow-md flex items-center justify-center gap-1.5"
          >
            <Icon name="print" size={16} />
            Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
};
