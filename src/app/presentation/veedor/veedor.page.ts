import { Component, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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


import { RegistrarActaUseCase } from '../../core/application/use-cases/registrar-acta.use-case';
import type { Acta } from '../../core/domain/models/acta.model';
import type { Candidato, Dignidad } from '../../core/domain/models/candidato.model';
import type { Junta } from '../../core/domain/models/junta.model';
import type { Organizacion } from '../../core/domain/models/organizacion.model';
import type { Perfil } from '../../core/domain/models/perfil.model';
import type { Recinto } from '../../core/domain/models/recinto.model';
import { ActaConsultaDatosRepository } from '../../core/infrastructure/repositories/actaconsulta-datos.repository';
import { AsignacionConsultaDatosRepository } from '../../core/infrastructure/repositories/asignacionconsulta-datos.repository';
import { CatalogoDatosRepository } from '../../core/infrastructure/repositories/catalogo-datos.repository';
import { JuntaDatosRepository } from '../../core/infrastructure/repositories/junta-datos.repository';
import { RecintoDatosRepository } from '../../core/infrastructure/repositories/recinto-datos.repository';
import { SupabaseActaRepository } from '../../core/infrastructure/repositories/supabase-acta.repository';
import { AuthService } from '../../core/infrastructure/supabase/auth.service';

interface VotoFormulario {
  organizacion_id: string;
  organizacion: string;
  candidato: string;
  votos: number | null;
}
@Component({
  selector: 'app-veedor',
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
  templateUrl: './veedor.page.html',
  styleUrls: ['./veedor.page.scss']
})
export class VeedorPage implements OnInit {
  private readonly repoActaConsulta = inject(ActaConsultaDatosRepository);
  private readonly repoAsignacionConsulta = inject(AsignacionConsultaDatosRepository);
  private readonly repoCatalogo = inject(CatalogoDatosRepository);
  private readonly repoJunta = inject(JuntaDatosRepository);
  private readonly repoRecinto = inject(RecintoDatosRepository);

  private readonly registrarActa = new RegistrarActaUseCase(inject(SupabaseActaRepository));

  private router = inject(Router);
  private authService = inject(AuthService);
  perfil = signal<Perfil | null>(null);
  recinto = signal<Recinto | null>(null);
  juntas = signal<Junta[]>([]);
  actas = signal<Acta[]>([]);
  candidatos = signal<Candidato[]>([]);
  organizaciones = signal<Organizacion[]>([]);
  juntaSeleccionada = signal<Junta | null>(null);
  dignidad = signal<Dignidad>('alcalde');
  mostrarActa = signal(false);
  actaExistente = signal<Acta | null>(null);
  votos = signal<VotoFormulario[]>([]);
  votosNulos = signal<number | null>(0);
  votosBlancos = signal<number | null>(0);
  totalSufragantes = signal<number | null>(0);
  cargando = signal(false);
  guardando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  private readonly validadoresVoto = [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/)];
  formulario = new FormGroup({
    votos: new FormArray<FormControl<number | null>>([]),
    votos_blancos: new FormControl<number | null>(0, this.validadoresVoto),
    votos_nulos: new FormControl<number | null>(0, this.validadoresVoto),
    total_sufragantes: new FormControl<number | null>(0, this.validadoresVoto)
  });

  constructor() {
    this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const datos = this.formulario.getRawValue();
      this.votos.update(votos => votos.map((voto, i) => ({ ...voto, votos: this.convertirNumero(datos.votos[i]) })));
      this.votosBlancos.set(this.convertirNumero(datos.votos_blancos));
      this.votosNulos.set(this.convertirNumero(datos.votos_nulos));
      this.totalSufragantes.set(this.convertirNumero(datos.total_sufragantes));
    });
  }

  totalValidos = computed(() =>
    this.votos().reduce(
      (total, voto) => total + Number(voto.votos ?? 0),
      0
    )
  );
  totalCalculado = computed(() =>
    this.totalValidos() +
    Number(this.votosNulos() ?? 0) +
    Number(this.votosBlancos() ?? 0)
  );
  diferencia = computed(() =>
    Number(this.totalSufragantes() ?? 0) -
    this.totalCalculado()
  );
  formularioValido = computed(() => {
    const valores = [
      ...this.votos().map(voto => voto.votos),
      this.votosNulos(),
      this.votosBlancos(),
      this.totalSufragantes()
    ];
    return this.votos().length > 0 &&
      valores.every(valor =>
        valor !== null &&
        Number.isInteger(valor) &&
        valor >= 0 &&
        valor <= 2147483647
      ) &&
      this.diferencia() === 0;
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
      const perfil = await this.authService.obtenerPerfil();
      if (!perfil?.recinto_id || perfil.rol !== 'veedor') {
        throw new Error('Perfil de veedor inválido.');
      }
      this.perfil.set(perfil);
      const [
        rRecinto,
        rAsignaciones,
        rCandidatos,
        rOrganizaciones
      ] = await Promise.all([
        this.repoRecinto.obtenerRecintos(perfil.recinto_id),
        this.repoAsignacionConsulta.juntasDelVeedor(perfil.id),
        this.repoCatalogo.listarCandidatos(),
        this.repoCatalogo.listarOrganizaciones()
      ]);
      if (rRecinto.error) throw rRecinto.error;
      if (rAsignaciones.error) throw rAsignaciones.error;
      if (rCandidatos.error) throw rCandidatos.error;
      if (rOrganizaciones.error) throw rOrganizaciones.error;
      this.recinto.set(rRecinto.data as Recinto);
      this.candidatos.set(
        (rCandidatos.data ?? []) as Candidato[]
      );
      this.organizaciones.set(
        (rOrganizaciones.data ?? []) as Organizacion[]
      );
      const ids = (rAsignaciones.data ?? [])
        .map(asignacion => asignacion.junta_id);
      if (ids.length === 0) {
        this.juntas.set([]);
        this.actas.set([]);
        this.juntaSeleccionada.set(null);
        this.mostrarActa.set(false);
        return;
      }
      const [rJuntas, rActas] = await Promise.all([
        this.repoJunta.juntasPorIds(ids),
        this.repoActaConsulta.actasPorJuntas(ids)
      ]);
      if (rJuntas.error) throw rJuntas.error;
      if (rActas.error) throw rActas.error;
      this.juntas.set((rJuntas.data ?? []) as Junta[]);
      this.actas.set((rActas.data ?? []) as Acta[]);
      const seleccionada = this.juntaSeleccionada();
      if (seleccionada) {
        this.juntaSeleccionada.set(
          this.juntas().find(
            junta => junta.id === seleccionada.id
          ) ?? null
        );
      }
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }
  seleccionarJunta(junta: Junta): void {
    this.juntaSeleccionada.set(junta);
    this.mostrarActa.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }
  obtenerActa(
    juntaId: string,
    dignidad: Dignidad
  ): Acta | undefined {
    return this.actas().find(acta =>
      acta.junta_id === juntaId &&
      acta.dignidad === dignidad
    );
  }
  estadoActa(
    juntaId: string,
    dignidad: Dignidad
  ): string {
    return this.obtenerActa(juntaId, dignidad)?.estado
      ?? 'pendiente';
  }
  async abrirActa(dignidad: Dignidad): Promise<void> {
    const junta = this.juntaSeleccionada();
    if (!junta || this.cargando() || this.guardando()) {
      return;
    }
    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.mostrarActa.set(false);
    try {
      this.dignidad.set(dignidad);
      const candidatos = this.candidatos().filter(
        candidato => candidato.dignidad === dignidad
      );
      if (candidatos.length === 0) {
        throw new Error(
          'No existen candidatos para esta dignidad.'
        );
      }
      const acta = this.obtenerActa(junta.id, dignidad);
      this.actaExistente.set(acta ?? null);
      this.votosNulos.set(acta?.votos_nulos ?? 0);
      this.votosBlancos.set(acta?.votos_blancos ?? 0);
      this.totalSufragantes.set(
        acta?.total_sufragantes ?? 0
      );
      const votosGuardados = new Map<string, number>();
      if (acta) {
        const { data, error } = await this.repoActaConsulta.votosResumidos(acta.id);
        if (error) throw error;
        for (const voto of data ?? []) {
          votosGuardados.set(
            voto.organizacion_id,
            voto.votos
          );
        }
      }
      this.votos.set(
        candidatos.map(candidato => ({
          organizacion_id: candidato.organizacion_id,
          organizacion: this.organizaciones().find(
            organizacion =>
              organizacion.id === candidato.organizacion_id
          )?.nombre ?? 'Organización',
          candidato: candidato.nombre,
          votos: votosGuardados.get(
            candidato.organizacion_id
          ) ?? 0
        }))
      );
      this.formulario.controls.votos.clear({ emitEvent: false });
      for (const voto of this.votos()) {
        this.formulario.controls.votos.push(new FormControl<number | null>(voto.votos, this.validadoresVoto), { emitEvent: false });
      }
      this.formulario.patchValue({
        votos_blancos: this.votosBlancos(),
        votos_nulos: this.votosNulos(),
        total_sufragantes: this.totalSufragantes()
      });
      this.mostrarActa.set(true);
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }
  convertirNumero(valor: unknown): number | null {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return null;
    }
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  }
  async guardarActa(): Promise<void> {
    const junta = this.juntaSeleccionada();
    if (
      !junta ||
      !this.formularioValido() || this.formulario.invalid ||
      this.guardando()
    ) {
      return;
    }
    if (!window.confirm('¿Confirmas los datos del acta?')) {
      return;
    }
    this.guardando.set(true);
    this.formulario.disable({ emitEvent: false });
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      await this.registrarActa.ejecutar({
        junta_id: junta.id,
        dignidad: this.dignidad(),
        votos_nulos: this.votosNulos() as number,
        votos_blancos: this.votosBlancos() as number,
        total_sufragantes: this.totalSufragantes() as number,
        votos: this.votos().map(voto => ({
          organizacion_id: voto.organizacion_id,
          votos: voto.votos as number
        }))
      });
      this.mensajeExito.set(
        this.actaExistente()
          ? 'Acta corregida correctamente.'
          : 'Acta registrada correctamente.'
      );
      this.mostrarActa.set(false);
      await this.cargarDatos();
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.formulario.enable({ emitEvent: false });
      this.guardando.set(false);
    }
  }
  volverJuntas(): void {
    this.juntaSeleccionada.set(null);
    this.mostrarActa.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }
  cancelarActa(): void {
    this.mostrarActa.set(false);
    this.mensajeError.set('');
  }
  private mostrarError(error: unknown): void {
    console.error(error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      this.mensajeError.set(String(error.message));
    } else {
      this.mensajeError.set(
        'Ocurrió un error inesperado.'
      );
    }
  }
  async irEvidencias(): Promise<void> {
    await this.router.navigateByUrl('/veedor/evidencias');
  }
  async cerrarSesion(): Promise<void> {
    try {
      await this.authService.cerrarSesion();
      await this.router.navigateByUrl('/login', {
        replaceUrl: true
      });
    } catch (error) {
      this.mostrarError(error);
    }
  }
}
