
import { Injectable } from '@angular/core';

import { supabase } from './supabase.client';

import type { Perfil } from '../../domain/models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  async iniciarSesion(
    cedula: string,
    contrasena: string
  ): Promise<void> {

    const { data, error } = await supabase.functions.invoke(
      'login-cedula',
      {
        body: { cedula, contrasena }
      }
    );

    if (error || !data?.access_token || !data?.refresh_token) {
      throw new Error('Cédula o contraseña incorrecta');
    }

    const { error: sessionError } =
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      });

    if (sessionError) {
      throw new Error('No se pudo establecer la sesión');
    }

  }

  async obtenerPerfil(): Promise<Perfil | null> {

    const { data: usuario, error: authError } =
      await supabase.auth.getUser();

    if (authError || !usuario.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', usuario.user.id)
      .single();

    if (error) {
      throw new Error('No se pudo obtener el perfil');
    }

    return data as Perfil;

  }

  async solicitarRecuperacion(
    correo: string
  ): Promise<void> {

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        correo.trim()
      );

    if (error) {
      throw new Error(
        'No se pudo solicitar el código. Intenta nuevamente más tarde.'
      );
    }

  }

  async verificarCodigoRecuperacion(
    correo: string,
    codigo: string
  ): Promise<void> {

    const { data, error } =
      await supabase.auth.verifyOtp({
        email: correo.trim(),
        token: codigo.trim(),
        type: 'recovery'
      });

    if (error || !data.session) {
      throw new Error(
        'El código es incorrecto o ha expirado'
      );
    }

  }

  async actualizarContrasena(
    contrasena: string
  ): Promise<void> {

    const { error } =
      await supabase.auth.updateUser({
        password: contrasena
      });

    if (error) {
      throw new Error(
        'No se pudo actualizar la contraseña. Verifica que sea diferente de la anterior.'
      );
    }

  }

  async cerrarSesion(): Promise<void> {

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error('No se pudo cerrar sesión');
    }

  }

  async obtenerSesion() {

    const { data } = await supabase.auth.getSession();

    return data.session;

  }

}
