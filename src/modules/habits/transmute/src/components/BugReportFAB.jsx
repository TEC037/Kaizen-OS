import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { SystemRepository } from '../repositories/SystemRepository';
import { toast } from 'sonner';
import { AlertCircle, Send, X } from 'lucide-react';

function BugReportFAB() {
  const { session } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSending(true);
    try {
      await SystemRepository.reportBug(
        session?.user?.id || null,
        description,
        { path: window.location.pathname }
      );
      toast.success("Error reportado", { description: "Tus hallazgos han sido enviados al Atanor." });
      setDescription('');
      setIsOpen(false);
    } catch (e) {
      toast.error("Error al enviar reporte");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[100] w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
      >
        <AlertCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-red-600 p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-black uppercase tracking-tighter">Reportar Hallazgo</h3>
                  <button onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>
                <p className="text-xs opacity-80">Describe el error para que los alquimistas puedan transmutarlo.</p>
              </div>

              <div className="p-6">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="¿Qué sucedió? ¿Cómo podemos replicarlo?"
                  rows={4}
                  className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-1 focus:ring-red-600/20 outline-none resize-none mb-4"
                />

                <button
                  disabled={!description.trim() || isSending}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-30 transition-all"
                >
                  <Send size={14} />
                  {isSending ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BugReportFAB;
