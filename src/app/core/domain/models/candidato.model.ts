
export type Dignidad =
  | 'alcalde'
  | 'prefecto';

export interface Candidato {
  id: string;
  organizacion_id: string;
  nombre: string;
  dignidad: Dignidad;
}
