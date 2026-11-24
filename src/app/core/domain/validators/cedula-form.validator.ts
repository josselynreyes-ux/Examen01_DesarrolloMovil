
import type {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { validarCedula } from './cedula.validator';

export function cedulaFormValidator(
  control: AbstractControl
): ValidationErrors | null {

  const cedula = String(control.value ?? '');

  if (!cedula) {
    return null;
  }

  return validarCedula(cedula)
    ? null
    : { cedulaInvalida: true };

}
