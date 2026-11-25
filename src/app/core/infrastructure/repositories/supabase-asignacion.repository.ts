import { Injectable } from '@angular/core';

import type {
  AsignacionRepository,
  AsignarVeedorDatos
} from '../../domain/repositories/asignacion.repository';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseAsignacionRepository
  implements AsignacionRepository {

  async asignar(
    datos: AsignarVeedorDatos
  ): Promise<void> {

    const { error } = await supabase

      .from('asignaciones')

      .insert({

        junta_id: datos.junta_id,
        veedor_id: datos.veedor_id,
        fecha_asignacion: new Date().toISOString(),
        activa: true

      })

      .abortSignal(AbortSignal.timeout(15000));

    if (error) {

      throw new Error(error.message);

    }

  }

  async retirar(
    asignacionId: string
  ): Promise<void> {

    const { data, error } = await supabase

      .from('asignaciones')

      .update({
        activa: false
      })

      .eq('id', asignacionId)

      .select('id')

      .abortSignal(AbortSignal.timeout(15000));

    if (error) {

      throw new Error(error.message);

    }

    if (!data?.length) {

      throw new Error(
        'No se pudo retirar la asignación.'
      );

    }

  }

}