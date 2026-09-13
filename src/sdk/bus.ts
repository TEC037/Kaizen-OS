/**
 * @file src/sdk/bus.ts
 * @description Bus de comunicación tipado y validado entre módulos de Kaizen OS.
 *
 * Garantías:
 * - Los eventos se emiten como CustomEvent reales en `window`, por lo que el bus
 *   es 100% retro-compatible con listens de `window.addEventListener` existentes.
 * - `emit` valida el payload contra el contrato (zod) ANTES de despachar; si es
 *   inválido lo descarta con un warning (nunca crashea).
 * - `on` se suscribe y devuelve un cleanup; el hook `useBusEvent` lo integra
 *   con el ciclo de vida de React.
 *
 * Filosofía: los módulos NO deben tocar `window` directamente; todo pasa por el
 * bus, que además sirve de registro/diagnóstico para el Inspector.
 */

import { useEffect, useRef } from 'react';
import type { z } from 'zod';

/** Contrato de un evento: nombre + validador de payload opcional. */
export interface EventContract<TPayload = unknown> {
  name: string;
  validate?: z.ZodType<TPayload>;
}

export interface BusEventDetail<TPayload = unknown> extends CustomEvent<TPayload> {
  detail: TPayload;
}

interface KaizenBusOptions {
  name?: string;
  log?: boolean;
}

export interface KaizenBus {
  /** Emite un evento con payload tipado (validado si el contrato lo declara). */
  emit<TPayload>(contract: EventContract<TPayload>, payload: TPayload): void;
  /** Se suscribe a un evento; devuelve función para desuscribirse. */
  on<TPayload>(contract: EventContract<TPayload>, handler: (payload: TPayload) => void): () => void;
}

/**
 * Crea una instancia de bus sobre `window`. `log: true` emite trazas en
 * consola para diagnóstico del Inspector.
 */
export function createBus(options: KaizenBusOptions = {}): KaizenBus {
  const busName = options.name ?? 'kaizen-os';
  const log = options.log ?? false;

  return {
    emit<TPayload>(contract: EventContract<TPayload>, payload: TPayload): void {
      let detail: TPayload = payload;
      if (contract.validate) {
        const result = contract.validate.safeParse(payload);
        if (!result.success) {
          console.warn(
            `[bus:${busName}] Evento "${contract.name}" descartado (payload inválido):`,
            result.error.issues
          );
          return;
        }
        detail = result.data;
      }
      window.dispatchEvent(new CustomEvent(contract.name, { detail }));
      if (log) {
        console.debug(`[bus:${busName}] emit →`, contract.name, detail);
      }
    },

    on<TPayload>(
      contract: EventContract<TPayload>,
      handler: (payload: TPayload) => void
    ): () => void {
      const listener = (e: Event) => {
        handler((e as BusEventDetail<TPayload>).detail);
        if (log) {
          console.debug(`[bus:${busName}] recv ←`, contract.name);
        }
      };
      window.addEventListener(contract.name, listener);
      if (log) {
        console.debug(`[bus:${busName}] suscrito →`, contract.name);
      }
      return () => {
        window.removeEventListener(contract.name, listener);
        if (log) {
          console.debug(`[bus:${busName}] desuscrito →`, contract.name);
        }
      };
    },
  };
}

/** Contrato: para un evento cuyo payload no necesita validación. */
export const contract = <TPayload = unknown>(name: string): EventContract<TPayload> => ({ name });

/** Bus global compartido por el shell y los módulos. */
export const kaizenBus = createBus({ name: 'kaizen-os', log: true });

/**
 * Hook de React: se suscribe al evento durante el montaje y se limpia al
 * desmontar. El handler se captura en un ref para no re-suscribirse en cada render.
 */
export function useBusEvent<TPayload>(
  bus: KaizenBus,
  eventContract: EventContract<TPayload>,
  handler: (payload: TPayload) => void
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const contractRef = useRef(eventContract);
  contractRef.current = eventContract;

  useEffect(() => {
    return bus.on(contractRef.current, (payload) => handlerRef.current(payload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]);
}