
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
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import type { Recinto } from '../../../core/domain/models/recinto.model';
import { supabase } from '../../../core/infrastructure/supabase/supabase.client';

@Component({
  selector: 'app-recintos',
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
  templateUrl: './recintos.page.html',
  styleUrls: ['./recintos.page.scss']
})
export class RecintosPage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  recintos = signal<Recinto[]>([]);

  cargando = signal(false);
  guardando = signal(false);
  generandoId = signal<string | null>(null);

  mostrarFormulario = signal(false);
  recintoEditando = signal<string | null>(null);

  mensajeError = signal('');
  mensajeExito = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    provincia: ['Pichincha', Validators.required],
    canton: ['Quito', Validators.required],
    parroquia: ['', Validators.required],
    cantidad_jrv: [
      1,
      [Validators.required, Validators.min(1)]
    ]
  });

  async ngOnInit(): Promise<void> {
    await this.cargarRecintos();
  }

  async cargarRecintos(): Promise<void> {
    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      const { data, error } = await supabase
        .from('recintos')
        .select('*')
        .order('nombre', { ascending: true })
        .abortSignal(AbortSignal.timeout(15000));

      if (error) {
        throw error;
      }

      this.recintos.set((data ?? []) as Recinto[]);

    } catch (error) {
      this.mostrarError(error);

    } finally {
      this.cargando.set(false);
    }
  }

  nuevoRecinto(): void {
    this.recintoEditando.set(null);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.formulario.reset({
      nombre: '',
      provincia: 'Pichincha',
      canton: 'Quito',
      parroquia: '',
      cantidad_jrv: 1
    });

    this.mostrarFormulario.set(true);
  }

  editarRecinto(recinto: Recinto): void {
    this.recintoEditando.set(recinto.id);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.formulario.reset({
      nombre: recinto.nombre,
      provincia: recinto.provincia,
      canton: recinto.canton,
      parroquia: recinto.parroquia,
      cantidad_jrv: recinto.cantidad_jrv
    });

    this.mostrarFormulario.set(true);
  }

  cancelarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.recintoEditando.set(null);
    this.mensajeError.set('');
  }

  async guardarRecinto(): Promise<void> {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {
      const datos = this.formulario.getRawValue();
      const cantidad = Number(datos.cantidad_jrv);

      if (!Number.isInteger(cantidad) || cantidad < 1) {
        throw new Error(
          'La cantidad de JRV debe ser un entero positivo.'
        );
      }

      const recintoDatos = {
        nombre: datos.nombre.trim(),
        provincia: datos.provincia.trim(),
        canton: datos.canton.trim(),
        parroquia: datos.parroquia.trim(),
        cantidad_jrv: cantidad
      };

      if (
        !recintoDatos.nombre ||
        !recintoDatos.provincia ||
        !recintoDatos.canton ||
        !recintoDatos.parroquia
      ) {
        throw new Error('Completa todos los campos.');
      }

      const id = this.recintoEditando();

      if (id) {

        const { data: juntas, error: errorJuntas } =
          await supabase
            .from('juntas')
            .select('numero_jrv')
            .eq('recinto_id', id)
            .order('numero_jrv', { ascending: false })
            .limit(1)
            .abortSignal(AbortSignal.timeout(15000));

        if (errorJuntas) {
          throw errorJuntas;
        }

        const numeroMayor = juntas?.[0]?.numero_jrv ?? 0;

        if (cantidad < numeroMayor) {
          throw new Error(
            'No puedes reducir la cantidad por debajo de las JRV existentes.'
          );
        }

        const { data, error } = await supabase
          .from('recintos')
          .update(recintoDatos)
          .eq('id', id)
          .select('id')
          .abortSignal(AbortSignal.timeout(15000));

        if (error) {
          throw error;
        }

        if (!data?.length) {
          throw new Error('No se pudo actualizar el recinto.');
        }

        this.mensajeExito.set(
          'Recinto actualizado correctamente.'
        );

      } else {

        const { error } = await supabase
          .from('recintos')
          .insert(recintoDatos)
          .abortSignal(AbortSignal.timeout(15000));

        if (error) {
          throw error;
        }

        this.mensajeExito.set(
          'Recinto registrado correctamente.'
        );
      }

      this.mostrarFormulario.set(false);
      this.recintoEditando.set(null);

      await this.cargarRecintos();

    } catch (error) {
      this.mostrarError(error);

    } finally {
      this.guardando.set(false);
    }
  }

  async generarJuntas(recinto: Recinto): Promise<void> {
    if (this.generandoId() !== null) {
      return;
    }

    this.generandoId.set(recinto.id);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {
      const cantidad = Number(recinto.cantidad_jrv);

      if (!Number.isInteger(cantidad) || cantidad < 1) {
        throw new Error('La cantidad de JRV no es válida.');
      }

      const { data, error } = await supabase
        .from('juntas')
        .select('numero_jrv')
        .eq('recinto_id', recinto.id)
        .abortSignal(AbortSignal.timeout(15000));

      if (error) {
        throw error;
      }

      const existentes = new Set(
        (data ?? []).map(junta => Number(junta.numero_jrv))
      );

      const nuevasJuntas = [];

      for (let numero = 1; numero <= cantidad; numero++) {

        if (!existentes.has(numero)) {

          nuevasJuntas.push({
            recinto_id: recinto.id,
            numero_jrv: numero,
            estado: 'pendiente'
          });

        }
      }

      if (nuevasJuntas.length > 0) {

        const { error: insertarError } = await supabase
          .from('juntas')
          .upsert(nuevasJuntas, {
            onConflict: 'recinto_id,numero_jrv',
            ignoreDuplicates: true
          })
          .abortSignal(AbortSignal.timeout(15000));

        if (insertarError) {
          throw insertarError;
        }
      }

      this.mensajeExito.set(
        'Las JRV del recinto están registradas.'
      );

    } catch (error) {
      this.mostrarError(error);
      return;

    } finally {
      this.generandoId.set(null);
    }

    await this.verJuntas(recinto);
  }

  async verJuntas(recinto: Recinto): Promise<void> {
    await this.router.navigate([
      '/provincial/recintos',
      recinto.id,
      'juntas'
    ]);
  }

  private mostrarError(error: unknown): void {
    console.error('Error en gestión de recintos:', error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      this.mensajeError.set(String(error.message));
    } else {
      this.mensajeError.set('Ocurrió un error inesperado.');
    }
  }

  async regresar(): Promise<void> {
    await this.router.navigateByUrl('/provincial');
  }
}
