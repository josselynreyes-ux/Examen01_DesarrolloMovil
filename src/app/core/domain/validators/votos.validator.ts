import type { DatosVotos } from '../repositories/acta.repository';

export function validarVotos(datos: DatosVotos): void {

  if (datos.votos.length === 0) {

    throw new Error(
      'Debes ingresar los votos de los candidatos.'
    );

  }

  const valores = [
    ...datos.votos.map(voto => voto.votos),
    datos.votos_nulos,
    datos.votos_blancos,
    datos.total_sufragantes
  ];

  const valoresValidos = valores.every(valor =>
    Number.isInteger(valor) &&
    valor >= 0 &&
    valor <= 2147483647
  );

  if (!valoresValidos) {

    throw new Error(
      'Los votos deben ser números enteros no negativos.'
    );

  }

  const organizaciones = datos.votos.map(
    voto => voto.organizacion_id
  );

  if (organizaciones.some(id => !id.trim())) {

    throw new Error(
      'Existe una organización inválida.'
    );

  }

  if (
    new Set(organizaciones).size !== organizaciones.length
  ) {

    throw new Error(
      'Existen organizaciones duplicadas.'
    );

  }

  const totalValidos = datos.votos.reduce(
    (total, voto) => total + voto.votos,
    0
  );

  const total =
    totalValidos +
    datos.votos_nulos +
    datos.votos_blancos;

  if (total !== datos.total_sufragantes) {

    throw new Error(
      'La suma de votos no coincide con el total de sufragantes.'
    );

  }

}