import type {
  ActaRepository,
  RegistrarActaDatos
} from '../../domain/repositories/acta.repository';
import { validarVotos } from '../../domain/validators/votos.validator';

export class RegistrarActaUseCase {

  constructor(
    private readonly repositorio: ActaRepository
  ) {}

  async ejecutar(
    datos: RegistrarActaDatos
  ): Promise<string> {

    if (!datos.junta_id.trim()) {

      throw new Error(
        'Debes seleccionar una junta electoral.'
      );

    }

    if (
      datos.dignidad !== 'alcalde' &&
      datos.dignidad !== 'prefecto'
    ) {

      throw new Error(
        'La dignidad seleccionada no es válida.'
      );

    }

    validarVotos(datos);

    return this.repositorio.registrar(datos);

  }

}