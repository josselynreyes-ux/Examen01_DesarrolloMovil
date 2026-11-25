import { Injectable } from '@angular/core';

import type { Junta } from '../../domain/models/junta.model';
import { supabase } from '../supabase/supabase.client';

function juntasDelRecinto(recintoId: string) {
  return supabase.from('juntas').select('*').eq('recinto_id', recintoId).order('numero_jrv').abortSignal(AbortSignal.timeout(15000));
}

function juntasPorIds(identificadores: string[]) {
  return supabase.from('juntas').select('*').in('id', identificadores).order('numero_jrv').abortSignal(AbortSignal.timeout(15000));
}

function juntasPorIds2(identificadores: string[]) {
  return supabase.from('juntas').select('*').in('id', identificadores).abortSignal(AbortSignal.timeout(15000));
}

function juntasDelRecinto2(recintoId: string) {
  return supabase.from('juntas').select('*').eq('recinto_id', recintoId).order('numero_jrv');
}

function generarJuntas(datos: Omit<Junta, 'id'>[]) {
  return supabase.from('juntas').upsert(datos, { onConflict: 'recinto_id,numero_jrv', ignoreDuplicates: true }).abortSignal(AbortSignal.timeout(15000));
}

function numerosDelRecinto(recintoId: string) {
  return supabase.from('juntas').select('numero_jrv').eq('recinto_id', recintoId).abortSignal(AbortSignal.timeout(15000));
}

function ultimoNumero(identificador: string) {
  return supabase.from('juntas').select('numero_jrv').eq('recinto_id', identificador).order('numero_jrv', { ascending: false }).limit(1).abortSignal(AbortSignal.timeout(15000));
}


@Injectable({ providedIn: 'root' })
export class JuntaDatosRepository {
  readonly juntasDelRecinto: typeof juntasDelRecinto = juntasDelRecinto;
  readonly juntasPorIds: typeof juntasPorIds = juntasPorIds;
  readonly juntasPorIds2: typeof juntasPorIds2 = juntasPorIds2;
  readonly juntasDelRecinto2: typeof juntasDelRecinto2 = juntasDelRecinto2;
  readonly generarJuntas: typeof generarJuntas = generarJuntas;
  readonly numerosDelRecinto: typeof numerosDelRecinto = numerosDelRecinto;
  readonly ultimoNumero: typeof ultimoNumero = ultimoNumero;
}
