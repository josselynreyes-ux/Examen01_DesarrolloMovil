import { Injectable } from '@angular/core';

import { supabase } from '../supabase/supabase.client';

function activasPorJuntas(identificadores: string[]) {
  return supabase.from('asignaciones').select('*').in('junta_id', identificadores).eq('activa', true).abortSignal(AbortSignal.timeout(15000));
}

function juntasDelVeedor(veedorId: string) {
  return supabase.from('asignaciones').select('junta_id').eq('veedor_id', veedorId).eq('activa', true).abortSignal(AbortSignal.timeout(15000));
}

@Injectable({ providedIn: 'root' })
export class AsignacionConsultaDatosRepository {
  readonly activasPorJuntas: typeof activasPorJuntas = activasPorJuntas;
  readonly juntasDelVeedor: typeof juntasDelVeedor = juntasDelVeedor;
}
