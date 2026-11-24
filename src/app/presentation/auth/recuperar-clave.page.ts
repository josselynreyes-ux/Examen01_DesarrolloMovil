
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { AuthService } from '../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-recuperar-clave',
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './recuperar-clave.page.html',
  styleUrls: ['./recuperar-clave.page.scss']
})
export class RecuperarClavePage {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  paso = signal<1 | 2 | 3 | 4>(1);

  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  private correoRecuperacion = '';
  private recuperacionVerificada = false;

  formularioCorreo = this.fb.nonNullable.group({
    correo: [
      '',
      [Validators.required, Validators.email]
    ]
  });

  formularioCodigo = this.fb.nonNullable.group({
    codigo: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]
    ]
  });

  formularioContrasena = this.fb.nonNullable.group({
    contrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],
    confirmar: [
      '',
      [Validators.required]
    ]
  });

  async enviarCodigo(): Promise<void> {

    if (this.formularioCorreo.invalid || this.cargando()) {
      this.formularioCorreo.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {

      const correo =
        this.formularioCorreo.getRawValue().correo.trim();

      await this.authService.solicitarRecuperacion(correo);

      this.correoRecuperacion = correo;

      this.mensajeExito.set(
        'Si el correo está registrado, recibirás un código de recuperación.'
      );

      this.paso.set(2);

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }

  }

  async verificarCodigo(): Promise<void> {

    if (
      this.formularioCodigo.invalid ||
      this.cargando() ||
      !this.correoRecuperacion
    ) {
      this.formularioCodigo.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {

      const codigo =
        this.formularioCodigo.getRawValue().codigo;

      await this.authService.verificarCodigoRecuperacion(
        this.correoRecuperacion,
        codigo
      );

      this.recuperacionVerificada = true;

      this.mensajeExito.set(
        'Código verificado correctamente'
      );

      this.paso.set(3);

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }

  }

  async reenviarCodigo(): Promise<void> {

    if (this.cargando() || !this.correoRecuperacion) {
      return;
    }

    this.cargando.set(true);
    this.limpiarMensajes();

    try {

      await this.authService.solicitarRecuperacion(
        this.correoRecuperacion
      );

      this.formularioCodigo.reset();

      this.mensajeExito.set(
        'Si el correo está registrado, recibirás un nuevo código'
      );

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }

  }

  async guardarContrasena(): Promise<void> {

    if (
      this.formularioContrasena.invalid ||
      this.cargando() ||
      !this.recuperacionVerificada
    ) {
      this.formularioContrasena.markAllAsTouched();
      return;
    }

    this.limpiarMensajes();

    const { contrasena, confirmar } =
      this.formularioContrasena.getRawValue();

    if (contrasena !== confirmar) {

      this.mensajeError.set(
        'Las contraseñas no coinciden'
      );

      return;

    }

    if (contrasena === 'Ecuador2026') {

      this.mensajeError.set(
        'No puedes utilizar la contraseña inicial'
      );

      return;

    }

    this.cargando.set(true);

    try {

      await this.authService.actualizarContrasena(
        contrasena
      );

      await this.authService.cerrarSesion();

      this.recuperacionVerificada = false;

      this.formularioContrasena.reset();
      this.formularioCodigo.reset();

      this.mensajeExito.set(
        'Tu contraseña se actualizó correctamente'
      );

      this.paso.set(4);

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }

  }

  cambiarCorreo(): void {

    if (this.cargando()) {
      return;
    }

    this.correoRecuperacion = '';

    this.formularioCodigo.reset();

    this.limpiarMensajes();

    this.paso.set(1);

  }

  async regresarLogin(): Promise<void> {

    if (this.cargando()) {
      return;
    }

    try {

      if (this.recuperacionVerificada) {

        await this.authService.cerrarSesion();

        this.recuperacionVerificada = false;

      }

      await this.router.navigateByUrl(
        '/login',
        { replaceUrl: true }
      );

    } catch (error) {

      this.mostrarError(error);

    }

  }

  private limpiarMensajes(): void {

    this.mensajeError.set('');
    this.mensajeExito.set('');

  }

  private mostrarError(error: unknown): void {

    this.mensajeError.set(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado'
    );

  }

}
