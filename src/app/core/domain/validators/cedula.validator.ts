
export function validarCedula(cedula: string): boolean {

  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  const provincia = Number(cedula.substring(0, 2));

  if (
    (provincia < 1 || provincia > 24) &&
    provincia !== 30
  ) {
    return false;
  }

  const tercerDigito = Number(cedula[2]);

  if (tercerDigito > 5) {
    return false;
  }

  let suma = 0;

  for (let i = 0; i < 9; i++) {

    let digito = Number(cedula[i]);

    if (i % 2 === 0) {

      digito = digito * 2;

      if (digito > 9) {
        digito = digito - 9;
      }

    }

    suma = suma + digito;

  }

  const digitoVerificador =
    (10 - (suma % 10)) % 10;

  return digitoVerificador === Number(cedula[9]);

}
