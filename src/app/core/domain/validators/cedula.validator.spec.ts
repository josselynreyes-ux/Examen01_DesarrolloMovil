
import { describe, it, expect } from 'vitest';

import { validarCedula } from './cedula.validator';

describe('Validador de cedula ecuatoriana', () => {

  it('debe aceptar una cedula matematicamente valida', () => {
    expect(validarCedula('1700000001')).toBe(true);
  });

  it('debe rechazar una cedula con menos de 10 digitos', () => {
    expect(validarCedula('170000000')).toBe(false);
  });

  it('debe rechazar una cedula con mas de 10 digitos', () => {
    expect(validarCedula('17000000011')).toBe(false);
  });

  it('debe rechazar letras', () => {
    expect(validarCedula('ABCDEFGHIJ')).toBe(false);
  });

  it('debe rechazar una provincia invalida', () => {
    expect(validarCedula('9900000000')).toBe(false);
  });

  it('debe rechazar un tercer digito invalido', () => {
    expect(validarCedula('1760000000')).toBe(false);
  });

  it('debe rechazar un digito verificador incorrecto', () => {
    expect(validarCedula('1700000002')).toBe(false);
  });

  it('debe rechazar una cedula vacia', () => {
    expect(validarCedula('')).toBe(false);
  });

});
