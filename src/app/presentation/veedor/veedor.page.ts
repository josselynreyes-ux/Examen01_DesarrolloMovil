
import { Component, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

import type { Acta } from '../../core/domain/models/acta.model';
import type { Candidato, Dignidad } from '../../core/domain/models/candidato.model';
import type { Junta } from '../../core/domain/models/junta.model';
import type { Organizacion } from '../../core/domain/models/organizacion.model';
import type { Perfil } from '../../core/domain/models/perfil.model';
import type { Recinto } from '../../core/domain/models/recinto.model';
import { AuthService } from '../../core/infrastructure/supabase/auth.service';
import { supabase } from '../../core/infrastructure/supabase/supabase.client';

interface VotoFormulario {
  organizacion_id: string;
  organizacion: string;
  candidato: string;
  votos: number | null;
}

@Component({
  selector: 'app-veedor',
  imports: [
    FormsModule,
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
        throw new Error('Perfil de veedor invÃ¡lido.');
      }

      this.perfil.set(perfil);

      const [
        rRecinto,
        rAsignaciones,
        rCandidatos,
        rOrganizaciones
      ] = await Promise.all([

        supabase
          .from('recintos')
          .select('*')
          .eq('id', perfil.recinto_id)
          .abortSignal(AbortSignal.timeout(15000))
          .single(),

        supabase
          .from('asignaciones')
          .select('junta_id')
          .eq('veedor_id', perfil.id)
          .eq('activa', true)
          .abortSignal(AbortSignal.timeout(15000)),

        supabase
          .from('candidatos')
          .select('*')
          .order('nombre')
          .abortSignal(AbortSignal.timeout(15000)),

        supabase
          .from('organizaciones')
          .select('*')
          .order('nombre')
          .abortSignal(AbortSignal.timeout(15000))

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

        supabase
          .from('juntas')
          .select('*')
          .in('id', ids)
          .order('numero_jrv')
          .abortSignal(AbortSignal.timeout(15000)),

        supabase
          .from('actas')
          .select('*')
          .in('junta_id', ids)
          .abortSignal(AbortSignal.timeout(15000))

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

        const { data, error } = await supabase
          .from('votos_acta')
          .select('organizacion_id, votos')
          .eq('acta_id', acta.id)
          .abortSignal(AbortSignal.timeout(15000));

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
          )?.nombre ?? 'OrganizaciÃ³n',

          candidato: candidato.nombre,

          votos: votosGuardados.get(
            candidato.organizacion_id
          ) ?? 0

        }))
      );

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

  actualizarVoto(
    organizacionId: string,
    valor: unknown
  ): void {

    this.votos.update(votos =>
      votos.map(voto =>
        voto.organizacion_id === organizacionId
          ? {
              ...voto,
              votos: this.convertirNumero(valor)
            }
          : voto
      )
    );

  }

  async guardarActa(): Promise<void> {

    const junta = this.juntaSeleccionada();

    if (
      !junta ||
      !this.formularioValido() ||
      this.guardando()
    ) {
      return;
    }

    if (!window.confirm('Â¿Confirmas los datos del acta?')) {
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {

      const { error } = await supabase
        .rpc('registrar_acta', {

          p_junta_id: junta.id,
          p_dignidad: this.dignidad(),
          p_votos_nulos: this.votosNulos(),
          p_votos_blancos: this.votosBlancos(),
          p_total_sufragantes: this.totalSufragantes(),

          p_votos: this.votos().map(voto => ({
            organizacion_id: voto.organizacion_id,
            votos: voto.votos
          }))

        })
        .abortSignal(AbortSignal.timeout(20000));

      if (error) throw error;

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
        'OcurriÃ³ un error inesperado.'
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
