/**
 * @file src/core/backup.ts
 * @description Utilidad minimalista y sin dependencias externas para exportar e importar
 * el estado integral de Kaizen OS (copia de seguridad local en JSON).
 */

import { soundEngine } from './sound';

export interface KaizenBackupPayload {
  version: number;
  app: 'Kaizen-OS';
  exportedAt: string;
  totalKeys: number;
  data: Record<string, string>;
}

const KAIZEN_KEY_PREFIXES = [
  'kz:',
  'kaizen',
  'transmute',
  'forja',
  'fitai',
  'reading',
  'finance',
  'gym',
  'favorites',
];

export function exportKaizenBackup(): { success: boolean; totalKeys: number } {
  try {
    const data: Record<string, string> = {};
    let count = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const isKaizenKey = KAIZEN_KEY_PREFIXES.some((prefix) =>
        key.toLowerCase().startsWith(prefix.toLowerCase())
      );

      if (isKaizenKey) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          data[key] = val;
          count++;
        }
      }
    }

    const payload: KaizenBackupPayload = {
      version: 1,
      app: 'Kaizen-OS',
      exportedAt: new Date().toISOString(),
      totalKeys: count,
      data,
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const filename = `kaizen-os-backup-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    soundEngine.playMilestone();
    return { success: true, totalKeys: count };
  } catch (err) {
    console.error('[KaizenOS:Backup] Error exportando respaldo:', err);
    return { success: false, totalKeys: 0 };
  }
}

export function importKaizenBackup(
  file: File
): Promise<{ success: boolean; count: number; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ success: false, count: 0, error: 'Archivo vacío.' });
          return;
        }

        const parsed = JSON.parse(text) as Partial<KaizenBackupPayload>;
        if (parsed.app !== 'Kaizen-OS' || !parsed.data || typeof parsed.data !== 'object') {
          resolve({
            success: false,
            count: 0,
            error: 'Formato inválido. El archivo debe ser un respaldo válido de Kaizen OS.',
          });
          return;
        }

        let restoredCount = 0;
        Object.entries(parsed.data).forEach(([key, val]) => {
          if (typeof val === 'string') {
            localStorage.setItem(key, val);
            restoredCount++;
          }
        });

        soundEngine.playMilestone();
        resolve({ success: true, count: restoredCount });
      } catch (err) {
        resolve({
          success: false,
          count: 0,
          error: err instanceof Error ? err.message : 'Error al procesar el archivo JSON.',
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, count: 0, error: 'Error de lectura de archivo.' });
    };

    reader.readAsText(file);
  });
}
