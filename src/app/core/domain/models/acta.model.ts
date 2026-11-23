
import { Dignidad } from './candidato.model';
import { EstadoRegistro } from './junta.model';

export interface Acta {
  id: string;
  junta_id: string;
  dignidad: Dignidad;
  votos_nulos: number;
  votos_blancos: number;
  total_sufragantes: number;
  foto_ruta: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: EstadoRegistro;
  updated_at: string;
}
