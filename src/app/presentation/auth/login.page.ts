
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonText,
    IonSpinner
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  mensajeError = signal('');

  formulario = this.fb.nonNullable.group({
    cedula: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]
    ],
    contrasena: ['', Validators.required]
  });

  async iniciarSesion(): Promise<void> {

    if (this.formulario.invalid || this.cargando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {

      const { cedula, contrasena } =
        this.formulario.getRawValue();

      await this.authService.iniciarSesion(
        cedula,
        contrasena
      );

      const perfil =
        await this.authService.obtenerPerfil();

      if (!perfil) {
        throw new Error('No se encontró el perfil');
      }

      if (perfil.debe_cambiar_clave) {

        await this.router.navigateByUrl(
          '/cambiar-clave',
          { replaceUrl: true }
        );

        return;
      }

      switch (perfil.rol) {

        case 'coordinador_provincial':

          await this.router.navigateByUrl(
            '/provincial',
            { replaceUrl: true }
          );

          break;

        case 'coordinador_recinto':

          await this.router.navigateByUrl(
            '/recinto',
            { replaceUrl: true }
          );

          break;

        case 'veedor':

          await this.router.navigateByUrl(
            '/veedor',
            { replaceUrl: true }
          );

          break;

        default:

          throw new Error('Rol no reconocido');

      }

    } catch (error) {

      console.error('Error de autenticación:', error);

      this.mensajeError.set(
        'No se pudo iniciar sesión. Verifica tus credenciales.'
      );

    } finally {

      this.cargando.set(false);

    }

  }

  async recuperarContrasena(): Promise<void> {

    if (this.cargando()) {
      return;
    }

    await this.router.navigateByUrl(
      '/recuperar-clave'
    );

  }

}
