
import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import type { Perfil } from '../../../core/domain/models/perfil.model';
import type { Recinto } from '../../../core/domain/models/recinto.model';
import { cedulaFormValidator } from '../../../core/domain/validators/cedula-form.validator';
import { supabase } from '../../../core/infrastructure/supabase/supabase.client';

@Component({
  selector: 'app-coordinadores',
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './coordinadores.page.html',
  styleUrls: ['./coordinadores.page.scss']
})
export class CoordinadoresPage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  coordinadores = signal<Perfil[]>([]);
  recintos = signal<Recinto[]>([]);

  cargando = signal(false);
  guardando = signal(false);
  mostrarFormulario = signal(false);

  mensajeError = signal('');
  mensajeExito = signal('');

  formulario = this.fb.nonNullable.group({

    cedula: [
      '',
      [
        Validators.required,
        cedulaFormValidator
      ]
    ],

    nombres: ['', Validators.required],

    apellidos: ['', Validators.required],

    telefono: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]
    ],

    correo: [
      '',
      [Validators.required, Validators.email]
    ],

    recinto_id: ['', Validators.required]

  });

  async ngOnInit(): Promise<void> {

    await this.cargarDatos();

  }

  async cargarDatos(): Promise<void> {

    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {

      const [resultadoRecintos, resultadoCoordinadores] =
        await Promise.all([

          supabase
            .from('recintos')
            .select('*')
            .order('nombre')
            .abortSignal(AbortSignal.timeout(15000)),

          supabase
            .from('perfiles')
            .select('*')
            .eq('rol', 'coordinador_recinto')
            .order('apellidos')
            .abortSignal(AbortSignal.timeout(15000))

        ]);

      if (resultadoRecintos.error) {
        throw resultadoRecintos.error;
      }

      if (resultadoCoordinadores.error) {
        throw resultadoCoordinadores.error;
      }

      this.recintos.set(
        (resultadoRecintos.data ?? []) as Recinto[]
      );

      this.coordinadores.set(
        (resultadoCoordinadores.data ?? []) as Perfil[]
      );

    } catch (error) {

      console.error(error);

      this.mensajeError.set(
        'No se pudieron cargar los datos.'
      );

    } finally {

      this.cargando.set(false);

    }

  }

  nuevoCoordinador(): void {

    this.formulario.reset();
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarFormulario.set(true);

  }

  cancelar(): void {

    this.formulario.reset();
    this.mostrarFormulario.set(false);
    this.mensajeError.set('');

  }

  async guardarCoordinador(): Promise<void> {

    if (this.formulario.invalid || this.guardando()) {

      this.formulario.markAllAsTouched();

      return;

    }

    const datos = this.formulario.getRawValue();

    if (
      this.coordinadores().some(
        coordinador =>
          coordinador.recinto_id === datos.recinto_id
      )
    ) {

      this.mensajeError.set(
        'El recinto seleccionado ya tiene un coordinador.'
      );

      return;

    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {

      const { data, error } =
        await supabase.functions.invoke('crear-usuario', {
          body: datos,
          signal: AbortSignal.timeout(30000)
        });

      if (error) {

        let mensaje = error.message;

        if (error.context instanceof Response) {

          const respuesta = await error.context
            .json()
            .catch(() => null);

          mensaje = respuesta?.error ?? mensaje;

        }

        throw new Error(mensaje);

      }

      if (data?.error) {

        throw new Error(data.error);

      }

      if (!data?.usuario?.id) {

        throw new Error(
          'No se confirmó el registro.'
        );

      }

      this.mensajeExito.set(
        data.correo_enviado
          ? 'Coordinador registrado correctamente. Correo aceptado para envío.'
          : 'Coordinador registrado. No se pudo enviar el correo de bienvenida.'
      );

      this.mostrarFormulario.set(false);
      this.formulario.reset();

      await this.cargarDatos();

    } catch (error) {

      console.error(error);

      this.mensajeError.set(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el coordinador.'
      );

    } finally {

      this.guardando.set(false);

    }

  }

  nombreRecinto(id: string | null): string {

    return this.recintos()
      .find(recinto => recinto.id === id)?.nombre
      ?? 'Sin recinto asignado';

  }

  async regresar(): Promise<void> {

    await this.router.navigateByUrl('/provincial');

  }

}
