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


import { AsignarVeedorUseCase } from '../../core/application/use-cases/asignar-veedor.use-case';
import { CrearUsuarioUseCase } from '../../core/application/use-cases/crear-usuario.use-case';
import type { Asignacion } from '../../core/domain/models/asignacion.model';
import type { Junta } from '../../core/domain/models/junta.model';
import type { Perfil } from '../../core/domain/models/perfil.model';
import type { Recinto } from '../../core/domain/models/recinto.model';
import { cedulaFormValidator } from '../../core/domain/validators/cedula-form.validator';
import { AsignacionConsultaDatosRepository } from '../../core/infrastructure/repositories/asignacionconsulta-datos.repository';
import { JuntaDatosRepository } from '../../core/infrastructure/repositories/junta-datos.repository';
import { PerfilDatosRepository } from '../../core/infrastructure/repositories/perfil-datos.repository';
import { RecintoDatosRepository } from '../../core/infrastructure/repositories/recinto-datos.repository';
import { SupabaseAsignacionRepository } from '../../core/infrastructure/repositories/supabase-asignacion.repository';
import { SupabaseUsuarioRepository } from '../../core/infrastructure/repositories/supabase-usuario.repository';
import { AuthService } from '../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-recinto',
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
  templateUrl: './recinto.page.html',
  styleUrls: ['./recinto.page.scss']
})
export class RecintoPage implements OnInit {
  private readonly repoAsignacionConsulta = inject(AsignacionConsultaDatosRepository);
  private readonly repoJunta = inject(JuntaDatosRepository);
  private readonly repoPerfil = inject(PerfilDatosRepository);
  private readonly repoRecinto = inject(RecintoDatosRepository);

  private readonly crearUsuario = new CrearUsuarioUseCase(inject(SupabaseUsuarioRepository));
  private readonly asignarVeedor = new AsignarVeedorUseCase(inject(SupabaseAsignacionRepository));

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  perfil = signal<Perfil | null>(null);
  recinto = signal<Recinto | null>(null);
  veedores = signal<Perfil[]>([]);
  juntas = signal<Junta[]>([]);
  asignaciones = signal<Asignacion[]>([]);
  seccion = signal<
    'inicio' | 'veedores' | 'juntas' | 'asignaciones'
  >('inicio');
  cargando = signal(false);
  guardando = signal(false);
  mostrarFormulario = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  formularioVeedor = this.fb.nonNullable.group({
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
      [
        Validators.required,
        Validators.email
      ]
    ]
  });
  formularioAsignacion = this.fb.nonNullable.group({
    junta_id: ['', Validators.required],
    veedor_id: ['', Validators.required]
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
      const perfil =
        await this.authService.obtenerPerfil();
      if (!perfil?.recinto_id) {
        throw new Error(
          'No tienes un recinto asignado.'
        );
      }
      this.perfil.set(perfil);
      const recintoId = perfil.recinto_id;
      const [rRecinto, rVeedores, rJuntas] =
        await Promise.all([
          this.repoRecinto.obtenerRecintos(recintoId),
          this.repoPerfil.listarVeedores(recintoId),
          this.repoJunta.juntasDelRecinto(recintoId)
        ]);
      if (rRecinto.error) {
        throw rRecinto.error;
      }
      if (rVeedores.error) {
        throw rVeedores.error;
      }
      if (rJuntas.error) {
        throw rJuntas.error;
      }
      this.recinto.set(
        rRecinto.data as Recinto
      );
      this.veedores.set(
        (rVeedores.data ?? []) as Perfil[]
      );
      this.juntas.set(
        (rJuntas.data ?? []) as Junta[]
      );
      const ids = this.juntas()
        .map(junta => junta.id);
      if (ids.length === 0) {
        this.asignaciones.set([]);
      } else {
        const { data, error } = await this.repoAsignacionConsulta.activasPorJuntas(ids);
        if (error) {
          throw error;
        }
        this.asignaciones.set(
          (data ?? []) as Asignacion[]
        );
      }
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }
  cambiarSeccion(
    seccion: 'inicio' | 'veedores' | 'juntas' | 'asignaciones'
  ): void {
    this.seccion.set(seccion);
    this.mostrarFormulario.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }
  nuevoVeedor(): void {
    this.formularioVeedor.reset();
    this.mostrarFormulario.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }
  cancelarFormulario(): void {
    this.formularioVeedor.reset();
    this.mostrarFormulario.set(false);
    this.mensajeError.set('');
  }
  async guardarVeedor(): Promise<void> {
    if (this.guardando()) {
      return;
    }
    if (this.formularioVeedor.invalid) {
      this.formularioVeedor.markAllAsTouched();
      if (
        this.formularioVeedor.controls.cedula
          .hasError('cedulaInvalida')
      ) {
        this.mensajeError.set(
          'La cédula ecuatoriana ingresada no es válida.'
        );
      } else {
        this.mensajeError.set(
          'Completa correctamente todos los campos.'
        );
      }
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const datos =
        this.formularioVeedor.getRawValue();
      const data = await this.crearUsuario.ejecutar(datos);
      this.mensajeExito.set(
        data.correo_enviado
          ? 'Veedor registrado correctamente. Correo aceptado para envío.'
          : 'Veedor registrado. No se pudo enviar el correo de bienvenida.'
      );
      this.mostrarFormulario.set(false);
      this.formularioVeedor.reset();
      await this.cargarDatos();
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
  juntasDisponibles(): Junta[] {
    return this.juntas().filter(junta =>
      !this.asignaciones().some(asignacion =>
        asignacion.junta_id === junta.id
      )
    );
  }
  async asignarJunta(): Promise<void> {
    if (
      this.formularioAsignacion.invalid ||
      this.guardando()
    ) {
      this.formularioAsignacion.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const datos =
        this.formularioAsignacion.getRawValue();
      await this.asignarVeedor.ejecutar(datos);
      this.formularioAsignacion.reset();
      this.mensajeExito.set(
        'JRV asignada correctamente.'
      );
      await this.cargarDatos();
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
  async retirarAsignacion(
    asignacion: Asignacion
  ): Promise<void> {
    if (this.guardando()) {
      return;
    }
    if (!window.confirm('¿Retirar esta asignación?')) {
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      await this.asignarVeedor.retirar(asignacion.id);
      this.mensajeExito.set(
        'Asignación retirada correctamente.'
      );
      await this.cargarDatos();
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
  nombreVeedor(id: string): string {
    const veedor = this.veedores()
      .find(usuario => usuario.id === id);
    return veedor
      ? `${veedor.nombres} ${veedor.apellidos}`
      : 'Veedor no disponible';
  }
  numeroJunta(id: string): number | string {
    return this.juntas()
      .find(junta => junta.id === id)?.numero_jrv
      ?? 'Sin número';
  }
  veedorAsignado(juntaId: string): string {
    const asignacion = this.asignaciones()
      .find(item => item.junta_id === juntaId);
    return asignacion
      ? this.nombreVeedor(asignacion.veedor_id)
      : 'Sin asignar';
  }
  private mostrarError(error: unknown): void {
    console.error(error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      this.mensajeError.set(
        String(error.message)
      );
    } else {
      this.mensajeError.set(
        'Ocurrió un error inesperado.'
      );
    }
  }
  async irActas(): Promise<void> {
  if (this.guardando() || this.cargando()) {
    return;
  }
  await this.router.navigateByUrl('/recinto/actas');
  }
  async cerrarSesion(): Promise<void> {
    try {
      await this.authService.cerrarSesion();
      await this.router.navigateByUrl(
        '/login',
        { replaceUrl: true }
      );
    } catch (error) {
      this.mostrarError(error);
    }
  }
}
