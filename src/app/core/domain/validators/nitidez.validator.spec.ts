import { describe, expect, it } from 'vitest';

import { validarNitidez } from './nitidez.validator';

describe('Validador de nitidez', () => {

  function crearImagen(
    ancho: number,
    alto: number,
    obtenerIntensidad: (
      x: number,
      y: number
    ) => number
  ): Uint8ClampedArray {

    const pixeles = new Uint8ClampedArray(
      ancho * alto * 4
    );

    for (let y = 0; y < alto; y++) {

      for (let x = 0; x < ancho; x++) {

        const posicion = (y * ancho + x) * 4;

        const intensidad = obtenerIntensidad(x, y);

        pixeles[posicion] = intensidad;
        pixeles[posicion + 1] = intensidad;
        pixeles[posicion + 2] = intensidad;
        pixeles[posicion + 3] = 255;

      }

    }

    return pixeles;

  }

  it('debe rechazar una imagen uniforme', () => {

    const imagen = crearImagen(
      10,
      10,
      () => 128
    );

    const resultado = validarNitidez(
      imagen,
      10,
      10
    );

    expect(resultado.esNitida).toBe(false);

    expect(resultado.puntuacion).toBe(0);

  });

  it('debe aceptar una imagen con bordes definidos', () => {

    const imagen = crearImagen(
      10,
      10,
      (x, y) => (x + y) % 2 === 0 ? 0 : 255
    );

    const resultado = validarNitidez(
      imagen,
      10,
      10
    );

    expect(resultado.esNitida).toBe(true);

    expect(resultado.puntuacion).toBeGreaterThan(100);

  });

  it('debe rechazar una imagen de intensidad gradual', () => {

    const imagen = crearImagen(
      10,
      10,
      x => x * 20
    );

    const resultado = validarNitidez(
      imagen,
      10,
      10
    );

    expect(resultado.esNitida).toBe(false);

  });

  it('debe rechazar dimensiones incorrectas', () => {

    const imagen = new Uint8ClampedArray(16);

    expect(() =>
      validarNitidez(imagen, 2, 2)
    ).toThrow();

  });

  it('debe rechazar una cantidad incorrecta de pixeles', () => {

    const imagen = new Uint8ClampedArray(10);

    expect(() =>
      validarNitidez(imagen, 10, 10)
    ).toThrow();

  });

  it('debe permitir configurar el umbral de nitidez', () => {

    const imagen = crearImagen(
      10,
      10,
      (x, y) => (x + y) % 2 === 0 ? 0 : 255
    );

    const resultado = validarNitidez(
      imagen,
      10,
      10,
      2000000
    );

    expect(resultado.esNitida).toBe(false);

  });

});