import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-cambiar-clave',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonText,
    IonSpinner
  ],
  templateUrl: './cambiar-clave.page.html',
  styleUrls: ['./cambiar-clave.page.scss']
})
export class CambiarClavePage {


  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  cargando = false;
  mensajeError = '';
  mensajeExito = '';

  formulario = this.fb.nonNullable.group({

    nuevaClave: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],

    confirmarClave: [
      '',
      Validators.required
    ]

  });

  async cambiarClave(): Promise<void> {

    if (this.formulario.invalid || this.cargando) {

      this.formulario.markAllAsTouched();
      return;

    }

    const { nuevaClave, confirmarClave } =
      this.formulario.getRawValue();

    if (nuevaClave !== confirmarClave) {

      this.mensajeError =
        'Las contraseñas no coinciden';

      return;

    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    try {

      await this.authService.cambiarClaveObligatoria(nuevaClave);

      this.mensajeExito =
        'Contraseña actualizada correctamente.';

      // Cerrar la sesión después del cambio.
      await this.authService.cerrarSesion();

      setTimeout(() => {

        void this.router.navigateByUrl('/login', {
          replaceUrl: true
        });

      }, 1500);

    } catch (error) {

      console.error(error);

      this.mensajeError =
        'No se pudo actualizar la contraseña';

    } finally {

      this.cargando = false;

    }

  }

}