import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonItem, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular';


import { CrearUsuarioUseCase } from '../../../core/application/use-cases/crear-usuario.use-case';
import type { Perfil } from '../../../core/domain/models/perfil.model';
import type { Recinto } from '../../../core/domain/models/recinto.model';
import { cedulaFormValidator } from '../../../core/domain/validators/cedula-form.validator';
import { PerfilDatosRepository } from '../../../core/infrastructure/repositories/perfil-datos.repository';
import { RecintoDatosRepository } from '../../../core/infrastructure/repositories/recinto-datos.repository';
import { SupabaseUsuarioRepository } from '../../../core/infrastructure/repositories/supabase-usuario.repository';

@Component({
  selector: 'app-coordinadores',
  imports: [ReactiveFormsModule, IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonInput, IonItem, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar],
  templateUrl: './coordinadores.page.html',
  styleUrls: ['./coordinadores.page.scss']
})
export class CoordinadoresPage implements OnInit {
  private readonly repoPerfil = inject(PerfilDatosRepository);
  private readonly repoRecinto = inject(RecintoDatosRepository);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private readonly crearUsuario = new CrearUsuarioUseCase(inject(SupabaseUsuarioRepository));
  coordinadores = signal<Perfil[]>([]);
  recintos = signal<Recinto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  formulario = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, cedulaFormValidator]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    correo: ['', [Validators.required, Validators.email]],
    recinto_id: ['', Validators.required]
  });
  async ngOnInit(): Promise<void> { await this.cargarDatos(); }
  async cargarDatos(): Promise<void> {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.mensajeError.set('');
    try {
      const [resultadoRecintos, resultadoCoordinadores] = await Promise.all([
        this.repoRecinto.listarRecintos(),
        this.repoPerfil.listarCoordinadores()
      ]);
      if (resultadoRecintos.error) throw resultadoRecintos.error;
      if (resultadoCoordinadores.error) throw resultadoCoordinadores.error;
      this.recintos.set((resultadoRecintos.data ?? []) as Recinto[]);
      this.coordinadores.set((resultadoCoordinadores.data ?? []) as Perfil[]);
    } catch (error) {
      console.error(error);
      this.mensajeError.set('No se pudieron cargar los datos.');
    } finally { this.cargando.set(false); }
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
    if (this.coordinadores().some(coordinador => coordinador.recinto_id === datos.recinto_id)) {
      this.mensajeError.set('El recinto seleccionado ya tiene un coordinador.');
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const data = await this.crearUsuario.ejecutar(datos);
      this.mensajeExito.set(data.correo_enviado
        ? 'Coordinador registrado correctamente. Correo aceptado para envío.'
        : 'Coordinador registrado. No se pudo enviar el correo de bienvenida.');
      this.mostrarFormulario.set(false);
      this.formulario.reset();
      await this.cargarDatos();
    } catch (error) {
      console.error(error);
      this.mensajeError.set(error instanceof Error ? error.message : 'No se pudo registrar el coordinador.');
    } finally { this.guardando.set(false); }
  }
  nombreRecinto(id: string | null): string {
    return this.recintos().find(recinto => recinto.id === id)?.nombre ?? 'Sin recinto asignado';
  }
  async regresar(): Promise<void> { await this.router.navigateByUrl('/provincial'); }
}
