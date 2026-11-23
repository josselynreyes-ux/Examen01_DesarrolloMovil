
export type EstadoRegistro =
  | 'pendiente'
  | 'registrada'
  | 'corregida';

export interface Junta {
  id: string;
  recinto_id: string;
  numero_jrv: number;
  estado: EstadoRegistro;
}
