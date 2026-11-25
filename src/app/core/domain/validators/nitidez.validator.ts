export interface ResultadoNitidez {

  puntuacion: number;
  esNitida: boolean;

}

export const UMBRAL_NITIDEZ = 100;

export function validarNitidez(
  pixeles: Uint8ClampedArray,
  ancho: number,
  alto: number,
  umbral: number = UMBRAL_NITIDEZ
): ResultadoNitidez {

  if (
    !Number.isInteger(ancho) ||
    !Number.isInteger(alto) ||
    ancho < 3 ||
    alto < 3 ||
    pixeles.length !== ancho * alto * 4
  ) {

    throw new Error(
      'No se pudo analizar la imagen.'
    );

  }

  // Convertir los píxeles a escala de grises

  const grises = new Float32Array(ancho * alto);

  for (let i = 0; i < grises.length; i++) {

    const posicion = i * 4;

    const rojo = pixeles[posicion];
    const verde = pixeles[posicion + 1];
    const azul = pixeles[posicion + 2];

    grises[i] =
      rojo * 0.299 +
      verde * 0.587 +
      azul * 0.114;

  }

  let suma = 0;
  let sumaCuadrados = 0;
  let cantidad = 0;

  // Aplicar el operador Laplaciano

  for (let y = 1; y < alto - 1; y++) {

    for (let x = 1; x < ancho - 1; x++) {

      const posicion = y * ancho + x;

      const laplaciano =
        grises[posicion - ancho] +
        grises[posicion + ancho] +
        grises[posicion - 1] +
        grises[posicion + 1] -
        4 * grises[posicion];

      suma += laplaciano;

      sumaCuadrados +=
        laplaciano * laplaciano;

      cantidad++;

    }

  }

  // Calcular la varianza

  const promedio = suma / cantidad;

  const varianza = Math.max(
    0,
    sumaCuadrados / cantidad -
    promedio * promedio
  );

  return {

    puntuacion: Number(varianza.toFixed(2)),

    esNitida: varianza >= umbral

  };

}