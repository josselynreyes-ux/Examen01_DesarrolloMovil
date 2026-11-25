import type { Perfil } from '../models/perfil.model';

export interface CrearUsuarioDatos {

  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  recinto_id?: string;

}

export interface CrearUsuarioResultado {

  correo_enviado: boolean;
  usuario: Omit<Perfil, 'debe_cambiar_clave'>;

}

export interface UsuarioRepository {

  crear(
    datos: CrearUsuarioDatos
  ): Promise<CrearUsuarioResultado>;

}