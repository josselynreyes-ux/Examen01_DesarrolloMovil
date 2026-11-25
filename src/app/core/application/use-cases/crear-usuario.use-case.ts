import type {
  CrearUsuarioDatos,
  CrearUsuarioResultado,
  UsuarioRepository
} from '../../domain/repositories/usuario.repository';
import { validarCedula } from '../../domain/validators/cedula.validator';

export class CrearUsuarioUseCase {

  constructor(
    private readonly repositorio: UsuarioRepository
  ) {}

  async ejecutar(
    datos: CrearUsuarioDatos
  ): Promise<CrearUsuarioResultado> {

    const usuario: CrearUsuarioDatos = {

      ...datos,

      cedula: datos.cedula.trim(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      telefono: datos.telefono.trim(),
      correo: datos.correo.trim().toLowerCase()

    };

    if (!validarCedula(usuario.cedula)) {

      throw new Error(
        'La cédula ecuatoriana ingresada no es válida.'
      );

    }

    if (!usuario.nombres || !usuario.apellidos) {

      throw new Error(
        'Debes ingresar los nombres y apellidos.'
      );

    }

    if (!/^\d{10}$/.test(usuario.telefono)) {

      throw new Error(
        'El teléfono debe contener 10 dígitos.'
      );

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correo)) {

      throw new Error(
        'El correo electrónico no es válido.'
      );

    }

    if (
      usuario.recinto_id !== undefined &&
      !usuario.recinto_id.trim()
    ) {

      throw new Error(
        'Debes seleccionar un recinto.'
      );

    }

    return this.repositorio.crear(usuario);

  }

}