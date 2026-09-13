import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/constants';

/**
 * Cliente Supabase cargado bajo demanda (dynamic import). Si faltan las variables
 * de entorno la app funciona en modo demo (isSupabaseEnabled === false) y nunca
 * se descarga el módulo Supabase.
 */
export const isSupabaseEnabled =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_ANON_KEY);

let clientPromise: Promise<SupabaseClient | null> | undefined;

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        })
      )
      .catch((err) => {
        clientPromise = undefined;
        throw err;
      });
  }
  return clientPromise;
}

export function _resetSupabaseClientForTesting(): void {
  clientPromise = undefined;
}