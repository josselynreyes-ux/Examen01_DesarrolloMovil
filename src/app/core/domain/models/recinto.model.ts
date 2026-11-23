
export interface Recinto {
  id: string;
  provincia: string;
  canton: string;
  parroquia: string;
  nombre: string;
  cantidad_jrv: number;
  latitud: number | null;
  longitud: number | null;
}
