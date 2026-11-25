import { Injectable } from '@angular/core';

import { supabase } from '../supabase/supabase.client';

function votosResumidos(actaId: string) {
  return supabase.from('votos_acta').select('organizacion_id, votos').eq('acta_id', actaId).abortSignal(AbortSignal.timeout(15000));
}

function actasPorJuntas(identificadores: string[]) {
  return supabase.from('actas').select('*').in('junta_id', identificadores).abortSignal(AbortSignal.timeout(15000));
}

function actasRegistradas(identificadores: string[]) {
  return supabase.from('actas').select('*').in('junta_id', identificadores).in('estado', ['registrada', 'corregida']).abortSignal(AbortSignal.timeout(15000));
}

function obtenerActas(identificador: string) {
  return supabase.from('actas').select('*').eq('id', identificador).single();
}

function votosDelActa(actaId: string) {
  return supabase.from('votos_acta').select('*').eq('acta_id', actaId);
}

function actasRegistradas2(identificadores: string[]) {
  return supabase.from('actas').select('*').in('junta_id', identificadores).in('estado', ['registrada', 'corregida']).order('updated_at', { ascending: false });
}

@Injectable({ providedIn: 'root' })
export class ActaConsultaDatosRepository {
  readonly votosResumidos: typeof votosResumidos = votosResumidos;
  readonly actasPorJuntas: typeof actasPorJuntas = actasPorJuntas;
  readonly actasRegistradas: typeof actasRegistradas = actasRegistradas;
  readonly obtenerActas: typeof obtenerActas = obtenerActas;
  readonly votosDelActa: typeof votosDelActa = votosDelActa;
  readonly actasRegistradas2: typeof actasRegistradas2 = actasRegistradas2;
}
