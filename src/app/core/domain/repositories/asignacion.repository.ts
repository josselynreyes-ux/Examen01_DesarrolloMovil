export interface AsignarVeedorDatos {

  junta_id: string;
  veedor_id: string;

}

export interface AsignacionRepository {

  asignar(
    datos: AsignarVeedorDatos
  ): Promise<void>;

  retirar(
    asignacionId: string
  ): Promise<void>;

}