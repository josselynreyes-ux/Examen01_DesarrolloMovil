
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
import { supabase } from '../../core/infrastructure/supabase/supabase.client';

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
    nuevaClave: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    confirmarClave: ['', Validators.required]
  });

  async cambiarClave() {
    if (this.formulario.invalid || this.cargando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { nuevaClave, confirmarClave } =
      this.formulario.getRawValue();

    if (nuevaClave !== confirmarClave) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    try {
      const { data: usuario, error: usuarioError } =
        await supabase.auth.getUser();

      if (usuarioError || !usuario.user) {
        throw new Error('Sesión no válida');
      }

      
        const { error: claveError } =
        await supabase.auth.updateUser({
            password: nuevaClave
        });

        if (claveError) {
        throw new Error(claveError.message);
        }

        // Confirmar el cambio en el perfil
        const { error: perfilError } =
        await supabase.rpc('confirmar_cambio_clave');

        if (perfilError) {
        throw new Error(
            'La contraseña cambió, pero no se pudo actualizar el perfil'
        );
        }


      // El cambio de contraseña se realizó.
      // Todavía debemos actualizar el indicador
      // mediante una función segura del servidor.
      this.mensajeExito =
        'Contraseña actualizada correctamente.';

      // Cerramos la sesión hasta completar
      // la sincronización del perfil.
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
