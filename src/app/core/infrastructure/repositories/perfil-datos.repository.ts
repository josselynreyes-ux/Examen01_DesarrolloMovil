import { Injectable } from '@angular/core';

import { supabase } from '../supabase/supabase.client';

function listarVeedores(recintoId: string) {
  return supabase.from('perfiles').select('*').eq('rol', 'veedor').eq('recinto_id', recintoId).order('apellidos').abortSignal(AbortSignal.timeout(15000));
}

function listarCoordinadores() {
  return supabase.from('perfiles').select('*').eq('rol', 'coordinador_recinto').order('apellidos').abortSignal(AbortSignal.timeout(15000));
}

@Injectable({ providedIn: 'root' })
export class PerfilDatosRepository {
  readonly listarVeedores: typeof listarVeedores = listarVeedores;
  readonly listarCoordinadores: typeof listarCoordinadores = listarCoordinadores;
}
