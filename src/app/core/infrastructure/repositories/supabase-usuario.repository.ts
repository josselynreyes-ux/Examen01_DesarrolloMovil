import { Injectable } from '@angular/core';

import type {
  CrearUsuarioDatos,
  CrearUsuarioResultado,
  UsuarioRepository
} from '../../domain/repositories/usuario.repository';
import { supabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class SupabaseUsuarioRepository
  implements UsuarioRepository {

  async crear(
    datos: CrearUsuarioDatos
  ): Promise<CrearUsuarioResultado> {

    const { data, error } =
      await supabase.functions.invoke('crear-usuario', {

        body: datos,
        signal: AbortSignal.timeout(30000)

      });

    if (error) {

      let mensaje = error.message;

      if (error.context instanceof Response) {

        const respuesta = await error.context
          .json()
          .catch(() => null);

        mensaje = respuesta?.error ?? mensaje;

      }

      throw new Error(mensaje);

    }

    if (data?.error) {

      throw new Error(data.error);

    }

    if (!data?.usuario?.id) {

      throw new Error(
        'No se confirmó el registro.'
      );

    }

    return {
      usuario: data.usuario,
      correo_enviado: data.correo_enviado === true
    };

  }

}