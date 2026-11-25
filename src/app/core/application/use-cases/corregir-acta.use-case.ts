import type {
  ActaRepository,
  CorregirActaDatos
} from '../../domain/repositories/acta.repository';
import { validarVotos } from '../../domain/validators/votos.validator';

export class CorregirActaUseCase {

  constructor(
    private readonly repositorio: ActaRepository
  ) {}

  async ejecutar(
    datos: CorregirActaDatos
  ): Promise<string> {

    if (!datos.acta_id.trim()) {

      throw new Error(
        'Debes seleccionar un acta electoral.'
      );

    }

    validarVotos(datos);

    return this.repositorio.corregir(datos);

  }

}