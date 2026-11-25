import { Injectable } from '@angular/core';

import type { Recinto } from '../../domain/models/recinto.model';
import { supabase } from '../supabase/supabase.client';

function obtenerRecintos(recintoId: string) {
  return supabase.from('recintos').select('*').eq('id', recintoId).abortSignal(AbortSignal.timeout(15000)).single();
}

function listarRecintos() {
  return supabase.from('recintos').select('*').order('nombre').abortSignal(AbortSignal.timeout(15000));
}

function crearRecintos(datos: Omit<Recinto, 'id' | 'latitud' | 'longitud'>) {
  return supabase.from('recintos').insert(datos).abortSignal(AbortSignal.timeout(15000));
}

function actualizarRecintos(datos: Omit<Recinto, 'id' | 'latitud' | 'longitud'>, identificador: string) {
  return supabase.from('recintos').update(datos).eq('id', identificador).select('id').abortSignal(AbortSignal.timeout(15000));
}


@Injectable({ providedIn: 'root' })
export class RecintoDatosRepository {
  readonly obtenerRecintos: typeof obtenerRecintos = obtenerRecintos;
  readonly listarRecintos: typeof listarRecintos = listarRecintos;
  readonly crearRecintos: typeof crearRecintos = crearRecintos;
  readonly actualizarRecintos: typeof actualizarRecintos = actualizarRecintos;
}
