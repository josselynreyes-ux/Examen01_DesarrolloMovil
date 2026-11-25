import type {
  AsignacionRepository,
  AsignarVeedorDatos
} from '../../domain/repositories/asignacion.repository';

export class AsignarVeedorUseCase {

  constructor(
    private readonly repositorio: AsignacionRepository
  ) {}

  async ejecutar(
    datos: AsignarVeedorDatos
  ): Promise<void> {

    if (!datos.junta_id.trim()) {

      throw new Error(
        'Debes seleccionar una junta electoral.'
      );

    }

    if (!datos.veedor_id.trim()) {

      throw new Error(
        'Debes seleccionar un veedor.'
      );

    }

    await this.repositorio.asignar(datos);

  }

  async retirar(
    asignacionId: string
  ): Promise<void> {

    if (!asignacionId.trim()) {

      throw new Error(
        'La asignación no es válida.'
      );

    }

    await this.repositorio.retirar(asignacionId);

  }

}