import type { Dignidad } from '../models/candidato.model';

export interface VotoRegistro {
  organizacion_id: string;
  votos: number;
}

export interface DatosVotos {
  votos_nulos: number;
  votos_blancos: number;
  total_sufragantes: number;
  votos: VotoRegistro[];
}

export interface RegistrarActaDatos extends DatosVotos {
  junta_id: string;
  dignidad: Dignidad;
}

export interface CorregirActaDatos extends DatosVotos {
  acta_id: string;
}

export interface ActaRepository {

  registrar(
    datos: RegistrarActaDatos
  ): Promise<string>;

  corregir(
    datos: CorregirActaDatos
  ): Promise<string>;

}