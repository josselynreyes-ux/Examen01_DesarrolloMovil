
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


import type { Candidato, Dignidad } from '../../../core/domain/models/candidato.model';
import type { Organizacion } from '../../../core/domain/models/organizacion.model';
import { CatalogoDatosRepository } from '../../../core/infrastructure/repositories/catalogo-datos.repository';

@Component({
  selector: 'app-organizaciones',
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
  templateUrl: './organizaciones.page.html',
  styleUrls: ['./organizaciones.page.scss']
})
export class OrganizacionesPage implements OnInit {
  private readonly repoCatalogo = inject(CatalogoDatosRepository);


  private fb = inject(FormBuilder);
  private router = inject(Router);

  organizaciones = signal<Organizacion[]>([]);
  candidatos = signal<Candidato[]>([]);

  seccion = signal<'organizaciones' | 'candidatos'>(
    'organizaciones'
  );

  cargando = signal(false);
  guardando = signal(false);
  mostrarFormulario = signal(false);

  organizacionEditando = signal<string | null>(null);
  candidatoEditando = signal<string | null>(null);

  mensajeError = signal('');
  mensajeExito = signal('');

  formularioOrganizacion = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    siglas: ['', Validators.required]
  });

  formularioCandidato = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    organizacion_id: ['', Validators.required],
    dignidad: this.fb.nonNullable.control<Dignidad>(
      'alcalde',
      Validators.required
    )
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

      const [rOrganizaciones, rCandidatos] =
        await Promise.all([

          this.repoCatalogo.listarOrganizaciones(),

          this.repoCatalogo.listarCandidatos()

        ]);

      if (rOrganizaciones.error) {
        throw rOrganizaciones.error;
      }

      if (rCandidatos.error) {
        throw rCandidatos.error;
      }

      this.organizaciones.set(
        (rOrganizaciones.data ?? []) as Organizacion[]
      );

      this.candidatos.set(
        (rCandidatos.data ?? []) as Candidato[]
      );

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }
  }

  cambiarSeccion(
    seccion: 'organizaciones' | 'candidatos'
  ): void {

    this.seccion.set(seccion);
    this.cancelarFormulario();
    this.mensajeExito.set('');

  }

  nuevaOrganizacion(): void {

    this.organizacionEditando.set(null);
    this.formularioOrganizacion.reset();

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarFormulario.set(true);

  }

  editarOrganizacion(
    organizacion: Organizacion
  ): void {

    this.organizacionEditando.set(organizacion.id);

    this.formularioOrganizacion.reset({
      nombre: organizacion.nombre,
      siglas: organizacion.siglas
    });

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarFormulario.set(true);

  }

  async guardarOrganizacion(): Promise<void> {

    if (
      this.formularioOrganizacion.invalid ||
      this.guardando()
    ) {
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {

      const datos =
        this.formularioOrganizacion.getRawValue();

      const organizacion = {
        nombre: datos.nombre.trim(),
        siglas: datos.siglas.trim().toUpperCase()
      };

      if (!organizacion.nombre || !organizacion.siglas) {
        throw new Error('Completa todos los campos.');
      }

      const id = this.organizacionEditando();

      if (id) {

        const { data, error } = await this.repoCatalogo.actualizarOrganizaciones(organizacion, id);

        if (error) {
          throw error;
        }

        if (!data?.length) {
          throw new Error(
            'No se pudo actualizar la organización.'
          );
        }

        this.mensajeExito.set(
          'Organización actualizada correctamente.'
        );

      } else {

        const { error } = await this.repoCatalogo.crearOrganizaciones(organizacion);

        if (error) {
          throw error;
        }

        this.mensajeExito.set(
          'Organización registrada correctamente.'
        );

      }

      this.cancelarFormulario();

      await this.cargarDatos();

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.guardando.set(false);

    }
  }

  nuevoCandidato(): void {

    this.candidatoEditando.set(null);

    this.formularioCandidato.reset({
      nombre: '',
      organizacion_id: '',
      dignidad: 'alcalde'
    });

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarFormulario.set(true);

  }

  editarCandidato(candidato: Candidato): void {

    this.candidatoEditando.set(candidato.id);

    this.formularioCandidato.reset({
      nombre: candidato.nombre,
      organizacion_id: candidato.organizacion_id,
      dignidad: candidato.dignidad
    });

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarFormulario.set(true);

  }

  async guardarCandidato(): Promise<void> {

    if (
      this.formularioCandidato.invalid ||
      this.guardando()
    ) {
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {

      const datos =
        this.formularioCandidato.getRawValue();

      const candidato = {
        nombre: datos.nombre.trim(),
        organizacion_id: datos.organizacion_id,
        dignidad: datos.dignidad
      };

      if (!candidato.nombre) {
        throw new Error(
          'Ingresa el nombre del candidato.'
        );
      }

      if (
        candidato.dignidad !== 'alcalde' &&
        candidato.dignidad !== 'prefecto'
      ) {
        throw new Error('Dignidad inválida.');
      }

      const id = this.candidatoEditando();

      if (id) {

        const { data, error } = await this.repoCatalogo.actualizarCandidatos(candidato, id);

        if (error) {
          throw error;
        }

        if (!data?.length) {
          throw new Error(
            'No se pudo actualizar el candidato.'
          );
        }

        this.mensajeExito.set(
          'Candidato actualizado correctamente.'
        );

      } else {

        const { error } = await this.repoCatalogo.crearCandidatos(candidato);

        if (error) {
          throw error;
        }

        this.mensajeExito.set(
          'Candidato registrado correctamente.'
        );

      }

      this.cancelarFormulario();

      await this.cargarDatos();

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.guardando.set(false);

    }
  }

  cancelarFormulario(): void {

    this.mostrarFormulario.set(false);

    this.organizacionEditando.set(null);
    this.candidatoEditando.set(null);

    this.formularioOrganizacion.reset();

    this.formularioCandidato.reset({
      nombre: '',
      organizacion_id: '',
      dignidad: 'alcalde'
    });

    this.mensajeError.set('');

  }

  nombreOrganizacion(id: string): string {

    return this.organizaciones()
      .find(organizacion => organizacion.id === id)
      ?.nombre ?? 'Organización no disponible';

  }

  candidatosPorDignidad(
    dignidad: Dignidad
  ): Candidato[] {

    return this.candidatos().filter(
      candidato => candidato.dignidad === dignidad
    );

  }

  private mostrarError(error: unknown): void {

    console.error(error);

    if (
      typeof error === 'object' &&
      error !== null
    ) {

      if ('code' in error && error.code === '23505') {

        this.mensajeError.set(
          'Ya existe un registro con estos datos.'
        );

        return;

      }

      if ('message' in error) {

        this.mensajeError.set(String(error.message));
        return;

      }
    }

    this.mensajeError.set(
      'Ocurrió un error inesperado.'
    );

  }

  async regresar(): Promise<void> {

    await this.router.navigateByUrl('/provincial');

  }
}
