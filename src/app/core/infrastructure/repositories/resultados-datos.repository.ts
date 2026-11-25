import { Injectable } from '@angular/core';

import { supabase } from '../supabase/supabase.client';

function pagina(tablaNombre: string, fin: number, desde: number) {
  return supabase.from(tablaNombre).select('*').order('id').range(desde, fin).abortSignal(AbortSignal.timeout(15000));
}

@Injectable({ providedIn: 'root' })
export class ResultadosDatosRepository {
  readonly pagina: typeof pagina = pagina;
}
