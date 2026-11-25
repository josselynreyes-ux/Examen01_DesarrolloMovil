import { Injectable } from '@angular/core';

import type {
  ActaRepository,
  CorregirActaDatos,
  RegistrarActaDatos
} from '../../domain/repositories/acta.repository';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseActaRepository
  implements ActaRepository {

  async registrar(
    datos: RegistrarActaDatos
  ): Promise<string> {

    const { data, error } = await supabase
      .rpc('registrar_acta', {

        p_junta_id: datos.junta_id,
        p_dignidad: datos.dignidad,
        p_votos_nulos: datos.votos_nulos,
        p_votos_blancos: datos.votos_blancos,
        p_total_sufragantes: datos.total_sufragantes,
        p_votos: datos.votos

      })
      .abortSignal(AbortSignal.timeout(20000));

    if (error) {

      throw new Error(error.message);

    }

    if (typeof data !== 'string' || !data) {

      throw new Error(
        'No se confirmó el registro del acta.'
      );

    }

    return data;

  }

  async corregir(
    datos: CorregirActaDatos
  ): Promise<string> {

    const { data, error } = await supabase
      .rpc('corregir_acta', {

        p_acta_id: datos.acta_id,
        p_votos_nulos: datos.votos_nulos,
        p_votos_blancos: datos.votos_blancos,
        p_total_sufragantes: datos.total_sufragantes,
        p_votos: datos.votos

      })
      .abortSignal(AbortSignal.timeout(20000));

    if (error) {

      throw new Error(error.message);

    }

    if (typeof data !== 'string' || !data) {

      throw new Error(
        'No se confirmó la corrección del acta.'
      );

    }

    return data;

  }

}