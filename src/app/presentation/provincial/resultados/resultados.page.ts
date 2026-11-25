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
  IonItem,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';


import type { Acta } from '../../../core/domain/models/acta.model';
import type { Candidato, Dignidad } from '../../../core/domain/models/candidato.model';
import type { Junta } from '../../../core/domain/models/junta.model';
import type { Organizacion } from '../../../core/domain/models/organizacion.model';
import type { Recinto } from '../../../core/domain/models/recinto.model';
import type { VotoActa } from '../../../core/domain/models/voto-acta.model';
import { EvidenciaDatosRepository } from '../../../core/infrastructure/repositories/evidencia-datos.repository';
import { ResultadosDatosRepository } from '../../../core/infrastructure/repositories/resultados-datos.repository';

interface Resultado {
  organizacion: string;
  candidato: string;
  votos: number;
  porcentaje: number;
}

@Component({
  selector: 'app-resultados',
  imports: [
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './resultados.page.html',
  styleUrls: ['./resultados.page.scss']
})
export class ResultadosPage implements OnInit {
  private readonly repoEvidencia = inject(EvidenciaDatosRepository);
  private readonly repoResultados = inject(ResultadosDatosRepository);


  private router = inject(Router);

  recintos = signal<Recinto[]>([]);
  juntas = signal<Junta[]>([]);
  actas = signal<Acta[]>([]);
  organizaciones = signal<Organizacion[]>([]);
  candidatos = signal<Candidato[]>([]);
  votos = signal<VotoActa[]>([]);

  recintoSeleccionado = signal('todos');
  dignidad = signal<Dignidad>('alcalde');

  cargando = signal(false);
  mensajeError = signal('');

  // Estados de las evidencias

  actaSeleccionada = signal<Acta | null>(null);
  fotoUrl = signal('');
  cargandoFoto = signal(false);
  mensajeErrorFoto = signal('');

  private solicitudFoto = 0;

  juntasFiltradas = computed(() => {

    if (this.recintoSeleccionado() === 'todos') {
      return this.juntas();
    }

    return this.juntas().filter(
      junta =>
        junta.recinto_id === this.recintoSeleccionado()
    );

  });

  totalRecintos = computed(() =>
    this.recintoSeleccionado() === 'todos'
      ? this.recintos().length
      : this.recintos().filter(
          recinto =>
            recinto.id === this.recintoSeleccionado()
        ).length
  );

  actasFiltradas = computed(() => {

    const ids = new Set(
      this.juntasFiltradas().map(junta => junta.id)
    );

    return this.actas().filter(acta =>
      ids.has(acta.junta_id) &&
      acta.dignidad === this.dignidad() &&
      (
        acta.estado === 'registrada' ||
        acta.estado === 'corregida'
      )
    );

  });

  totalJuntas = computed(() =>
    this.juntasFiltradas().length
  );

  totalActas = computed(() =>
    this.actasFiltradas().length
  );

  actasPendientes = computed(() =>
    Math.max(
      0,
      this.totalJuntas() - this.totalActas()
    )
  );

  actasCorregidas = computed(() =>
    this.actasFiltradas().filter(
      acta => acta.estado === 'corregida'
    ).length
  );

  avance = computed(() => {

    if (this.totalJuntas() === 0) {
      return 0;
    }

    return this.totalActas() /
      this.totalJuntas() * 100;

  });

  votosFiltrados = computed(() => {

    const ids = new Set(
      this.actasFiltradas().map(acta => acta.id)
    );

    return this.votos().filter(
      voto => ids.has(voto.acta_id)
    );

  });

  votosValidos = computed(() =>
    this.votosFiltrados().reduce(
      (total, voto) => total + voto.votos,
      0
    )
  );

  votosBlancos = computed(() =>
    this.actasFiltradas().reduce(
      (total, acta) => total + acta.votos_blancos,
      0
    )
  );

  votosNulos = computed(() =>
    this.actasFiltradas().reduce(
      (total, acta) => total + acta.votos_nulos,
      0
    )
  );

  totalSufragantes = computed(() =>
    this.actasFiltradas().reduce(
      (total, acta) => total + acta.total_sufragantes,
      0
    )
  );

  diferencia = computed(() =>
    this.totalSufragantes() -
    this.votosValidos() -
    this.votosBlancos() -
    this.votosNulos()
  );

  evidenciasCompletas = computed(() =>
    this.actasFiltradas().filter(
      acta => this.evidenciaCompleta(acta)
    ).length
  );

  evidenciasPendientes = computed(() =>
    this.totalActas() - this.evidenciasCompletas()
  );

  resultados = computed<Resultado[]>(() => {

    const acumulados = new Map<string, number>();

    for (const voto of this.votosFiltrados()) {

      const actual =
        acumulados.get(voto.organizacion_id) ?? 0;

      acumulados.set(
        voto.organizacion_id,
        actual + voto.votos
      );

    }

    return this.candidatos()
      .filter(
        candidato =>
          candidato.dignidad === this.dignidad()
      )
      .map(candidato => {

        const organizacion = this.organizaciones()
          .find(item =>
            item.id === candidato.organizacion_id
          );

        const votos =
          acumulados.get(candidato.organizacion_id) ?? 0;

        const porcentaje = this.votosValidos() > 0
          ? votos / this.votosValidos() * 100
          : 0;

        return {
          organizacion:
            organizacion?.nombre ?? 'Organización',
          candidato: candidato.nombre,
          votos,
          porcentaje
        };

      })
      .sort((a, b) => b.votos - a.votos);

  });

  // Ordenar las actas por recinto y número de JRV

  actasEvidencias = computed(() =>
    [...this.actasFiltradas()].sort((a, b) => {

      const recintoA = this.nombreRecinto(a.junta_id);
      const recintoB = this.nombreRecinto(b.junta_id);

      const comparacion = recintoA.localeCompare(recintoB);

      if (comparacion !== 0) {
        return comparacion;
      }

      return this.numeroJunta(a.junta_id) -
        this.numeroJunta(b.junta_id);

    })
  );

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  private async consultarTabla<T>(
    tabla: string
  ): Promise<T[]> {

    const registros: T[] = [];
    const cantidad = 500;

    let inicio = 0;

    while (true) {

      const { data, error } = await this.repoResultados.pagina(tabla, inicio + cantidad - 1, inicio);

      if (error) throw error;

      const pagina = (data ?? []) as T[];

      registros.push(...pagina);

      if (pagina.length < cantidad) {
        break;
      }

      inicio += cantidad;

    }

    return registros;

  }

  async cargarDatos(): Promise<void> {

    if (this.cargando()) return;

    this.cerrarFotografia();

    this.cargando.set(true);
    this.mensajeError.set('');

    try {

      const [
        recintos,
        juntas,
        actas,
        organizaciones,
        candidatos,
        votos
      ] = await Promise.all([

        this.consultarTabla<Recinto>('recintos'),

        this.consultarTabla<Junta>('juntas'),

        this.consultarTabla<Acta>('actas'),

        this.consultarTabla<Organizacion>(
          'organizaciones'
        ),

        this.consultarTabla<Candidato>('candidatos'),

        this.consultarTabla<VotoActa>('votos_acta')

      ]);

      this.recintos.set(
        recintos.sort(
          (a, b) => a.nombre.localeCompare(b.nombre)
        )
      );

      this.juntas.set(juntas);
      this.actas.set(actas);
      this.organizaciones.set(organizaciones);
      this.candidatos.set(candidatos);
      this.votos.set(votos);

    } catch (error) {

      console.error(error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {

        this.mensajeError.set(String(error.message));

      } else {

        this.mensajeError.set(
          'No se pudieron cargar los resultados.'
        );

      }

    } finally {

      this.cargando.set(false);

    }

  }

  cambiarRecinto(valor: string): void {

    this.cerrarFotografia();
    this.recintoSeleccionado.set(valor);

  }

  cambiarDignidad(valor: Dignidad): void {

    if (valor === 'alcalde' || valor === 'prefecto') {

      this.cerrarFotografia();
      this.dignidad.set(valor);

    }

  }

  // Obtener el número de la junta

  numeroJunta(juntaId: string): number {

    return this.juntas().find(
      junta => junta.id === juntaId
    )?.numero_jrv ?? 0;

  }

  // Obtener el nombre del recinto

  nombreRecinto(juntaId: string): string {

    const junta = this.juntas().find(
      item => item.id === juntaId
    );

    return this.recintos().find(
      recinto => recinto.id === junta?.recinto_id
    )?.nombre ?? 'Recinto no disponible';

  }

  // Validar las coordenadas registradas

  tieneUbicacion(acta: Acta): boolean {

    return acta.latitud !== null &&
      acta.longitud !== null &&
      Number.isFinite(acta.latitud) &&
      Number.isFinite(acta.longitud) &&
      Math.abs(acta.latitud) <= 90 &&
      Math.abs(acta.longitud) <= 180;

  }

  evidenciaCompleta(acta: Acta): boolean {

    return !!acta.foto_ruta &&
      this.tieneUbicacion(acta);

  }

  // Solicitar un enlace temporal para la fotografía

  async verFotografia(acta: Acta): Promise<void> {

    this.cerrarFotografia();

    this.actaSeleccionada.set(acta);

    if (!acta.foto_ruta) {

      this.mensajeErrorFoto.set(
        'Esta acta no tiene fotografía registrada.'
      );

      return;

    }

    const solicitud = ++this.solicitudFoto;

    this.cargandoFoto.set(true);

    try {

      const { data, error } = await this.repoEvidencia.urlFirmada(acta.foto_ruta, 600);

      if (solicitud !== this.solicitudFoto) {
        return;
      }

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {

        throw new Error(
          'No se pudo obtener la fotografía.'
        );

      }

      this.fotoUrl.set(data.signedUrl);

    } catch (error) {

      if (solicitud !== this.solicitudFoto) {
        return;
      }

      console.error(error);

      this.mensajeErrorFoto.set(
        'No se pudo cargar la fotografía. Intenta nuevamente.'
      );

    } finally {

      if (solicitud === this.solicitudFoto) {
        this.cargandoFoto.set(false);
      }

    }

  }

  errorImagen(): void {

    this.fotoUrl.set('');

    this.mensajeErrorFoto.set(
      'No se pudo mostrar la imagen. Vuelve a cargarla.'
    );

  }

  cerrarFotografia(): void {

    this.solicitudFoto++;

    this.actaSeleccionada.set(null);
    this.fotoUrl.set('');
    this.mensajeErrorFoto.set('');
    this.cargandoFoto.set(false);

  }

  // Generar enlace de ubicación en Google Maps

  enlaceUbicacion(acta: Acta): string {

    if (!this.tieneUbicacion(acta)) {
      return '';
    }

    const coordenadas =
      `${acta.latitud},${acta.longitud}`;

    return 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(coordenadas);

  }

  async regresar(): Promise<void> {

    this.cerrarFotografia();

    await this.router.navigateByUrl('/provincial');

  }

}