
export type RolUsuario =
  | 'coordinador_provincial'
  | 'coordinador_recinto'
  | 'veedor';

export interface Perfil {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  rol: RolUsuario;
  recinto_id: string | null;
  debe_cambiar_clave: boolean;
}
