import { Component, computed, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import type {
  FormArray} from '@angular/forms';
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


import { CorregirActaUseCase } from '../../../core/application/use-cases/corregir-acta.use-case';
import type { Acta } from '../../../core/domain/models/acta.model';
import type { Candidato } from '../../../core/domain/models/candidato.model';
import type { Junta } from '../../../core/domain/models/junta.model';
import type { Organizacion } from '../../../core/domain/models/organizacion.model';
import type { VotoActa } from '../../../core/domain/models/voto-acta.model';
import { CamaraService } from '../../../core/infrastructure/capacitor/camara.service';
import { GeolocalizacionService } from '../../../core/infrastructure/capacitor/geolocalizacion.service';
import { ActaConsultaDatosRepository } from '../../../core/infrastructure/repositories/actaconsulta-datos.repository';
import { CatalogoDatosRepository } from '../../../core/infrastructure/repositories/catalogo-datos.repository';
import { EvidenciaDatosRepository } from '../../../core/infrastructure/repositories/evidencia-datos.repository';
import { JuntaDatosRepository } from '../../../core/infrastructure/repositories/junta-datos.repository';
import { SupabaseActaRepository } from '../../../core/infrastructure/repositories/supabase-acta.repository';
import { AuthService } from '../../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-actas',
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
  templateUrl: './actas.page.html',
  styleUrls: ['./actas.page.scss']
})
export class ActasPage implements OnInit {
  private readonly repoActaConsulta = inject(ActaConsultaDatosRepository);
  private readonly repoCatalogo = inject(CatalogoDatosRepository);
  private readonly repoEvidencia = inject(EvidenciaDatosRepository);
  private readonly repoJunta = inject(JuntaDatosRepository);

  private readonly corregirActa = new CorregirActaUseCase(inject(SupabaseActaRepository));

  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private camaraService = inject(CamaraService);
  private gpsService = inject(GeolocalizacionService);
  juntas = signal<Junta[]>([]);
  actas = signal<Acta[]>([]);
  candidatos = signal<Candidato[]>([]);
  organizaciones = signal<Organizacion[]>([]);
  actaSeleccionada = signal<Acta | null>(null);
  candidatosActa = signal<Candidato[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');
  fotoUrl = signal('');
  nuevaFoto = signal(false);
  latitud = signal<number | null>(null);
  longitud = signal<number | null>(null);
  totalCalculado = signal(0);
  diferencia = signal(0);
  valoresValidos = signal(false);
  private fotoBlob: Blob | null = null;
  private urlTemporal = '';
  formulario = this.fb.group({
    votos: this.fb.array<number | null>([]),
    votos_nulos: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/)
      ]
    ],
    votos_blancos: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/)
      ]
    ],
    total_sufragantes: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/)
      ]
    ]
  });
  formularioValido = computed(() =>
    this.valoresValidos() &&
    this.diferencia() === 0 &&
    this.candidatosActa().length > 0
  );
  get votosFormulario(): FormArray {
    return this.formulario.get('votos') as FormArray;
  }
  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }
  async cargarDatos(): Promise<void> {
    this.cargando.set(true);
    this.mensajeError.set('');
    try {
      const perfil = await this.authService.obtenerPerfil();
      if (
        !perfil ||
        perfil.rol !== 'coordinador_recinto' ||
        !perfil.recinto_id ||
        perfil.debe_cambiar_clave
      ) {
        throw new Error('No tienes permiso para acceder.');
      }
      const { data: juntas, error: errorJuntas } =
        await this.repoJunta.juntasDelRecinto2(perfil.recinto_id);
      if (errorJuntas) throw errorJuntas;
      this.juntas.set((juntas ?? []) as Junta[]);
      const ids = this.juntas().map(junta => junta.id);
      if (ids.length === 0) {
        this.actas.set([]);
        return;
      }
      const [
        respuestaActas,
        respuestaCandidatos,
        respuestaOrganizaciones
      ] = await Promise.all([
        this.repoActaConsulta.actasRegistradas2(ids),
        this.repoCatalogo.listarCandidatos2(),
        this.repoCatalogo.listarOrganizaciones2()
      ]);
      if (respuestaActas.error) {
        throw respuestaActas.error;
      }
      if (respuestaCandidatos.error) {
        throw respuestaCandidatos.error;
      }
      if (respuestaOrganizaciones.error) {
        throw respuestaOrganizaciones.error;
      }
      this.actas.set(
        (respuestaActas.data ?? []) as Acta[]
      );
      this.candidatos.set(
        (respuestaCandidatos.data ?? []) as Candidato[]
      );
      this.organizaciones.set(
        (respuestaOrganizaciones.data ?? []) as Organizacion[]
      );
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }
  numeroJunta(juntaId: string): number | string {
    return this.juntas().find(
      junta => junta.id === juntaId
    )?.numero_jrv ?? 'Sin número';
  }
  nombreOrganizacion(id: string): string {
    return this.organizaciones().find(
      organizacion => organizacion.id === id
    )?.nombre ?? 'Organización';
  }
  async abrirActa(acta: Acta): Promise<void> {
    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.limpiarFoto();
    try {
      const { data, error } = await this.repoActaConsulta.votosDelActa(acta.id);
      if (error) throw error;
      const votos = (data ?? []) as VotoActa[];
      const candidatos = this.candidatos().filter(
        candidato => candidato.dignidad === acta.dignidad
      );
      this.candidatosActa.set(candidatos);
      this.votosFormulario.clear();
      for (const candidato of candidatos) {
        const voto = votos.find(
          item =>
            item.organizacion_id === candidato.organizacion_id
        );
        this.votosFormulario.push(
          this.fb.control(
            voto?.votos ?? 0,
            [
              Validators.required,
              Validators.min(0),
              Validators.max(2147483647),
              Validators.pattern(/^\d+$/)
            ]
          )
        );
      }
      this.formulario.patchValue({
        votos_nulos: acta.votos_nulos,
        votos_blancos: acta.votos_blancos,
        total_sufragantes: acta.total_sufragantes
      });
      this.latitud.set(acta.latitud);
      this.longitud.set(acta.longitud);
      this.actaSeleccionada.set(acta);
      this.calcularTotal();
      if (acta.foto_ruta) {
        const { data: foto, error: errorFoto } =
          await this.repoEvidencia.urlFirmada(acta.foto_ruta, 600);
        if (errorFoto) throw errorFoto;
        this.fotoUrl.set(foto.signedUrl);
      }
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.cargando.set(false);
    }
  }
  calcularTotal(): void {
    const datos = this.formulario.getRawValue();
    const valores = [
      ...datos.votos,
      datos.votos_nulos,
      datos.votos_blancos,
      datos.total_sufragantes
    ];
    const validos = valores.every(valor =>
      valor !== null &&
      Number.isInteger(Number(valor)) &&
      Number(valor) >= 0 &&
      Number(valor) <= 2147483647
    );
    this.valoresValidos.set(
      validos && this.formulario.valid
    );
    const totalVotos = datos.votos.reduce(
      (total: number, voto: unknown) =>
        total + Number(voto ?? 0),
      0
    );
    const total =
      totalVotos +
      Number(datos.votos_nulos ?? 0) +
      Number(datos.votos_blancos ?? 0);
    this.totalCalculado.set(total);
    this.diferencia.set(
      Number(datos.total_sufragantes ?? 0) - total
    );
  }
  async guardarCorreccion(): Promise<void> {
    const acta = this.actaSeleccionada();
    this.calcularTotal();
    if (
      !acta ||
      !this.formularioValido() ||
      this.guardando()
    ) {
      return;
    }
    const confirmar = window.confirm(
      '¿Deseas guardar la corrección de esta acta?'
    );
    if (!confirmar) return;
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const datos = this.formulario.getRawValue();
      const votos = this.candidatosActa().map(
        (candidato, indice) => ({
          organizacion_id: candidato.organizacion_id,
          votos: Number(datos.votos[indice])
        })
      );
      await this.corregirActa.ejecutar({
        acta_id: acta.id,
        votos_nulos: Number(datos.votos_nulos),
        votos_blancos: Number(datos.votos_blancos),
        total_sufragantes: Number(datos.total_sufragantes),
        votos
      });
      await this.actualizarActa(acta.id);
      this.mensajeExito.set(
        'Acta corregida correctamente.'
      );
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
    async capturarFoto(): Promise<void> {
    if (
      this.guardando() ||
      this.cargando() ||
      !this.actaSeleccionada()
    ) {
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const foto =
        await this.camaraService.tomarFoto();
      this.limpiarFoto();
      this.fotoBlob = foto;
      this.urlTemporal = URL.createObjectURL(
        this.fotoBlob
      );
      this.fotoUrl.set(this.urlTemporal);
      this.nuevaFoto.set(true);
      this.mensajeExito.set(
        'Fotografía aceptada. La nitidez es suficiente.'
      );
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
    async obtenerUbicacion(): Promise<void> {
    if (
      this.guardando() ||
      this.cargando() ||
      !this.actaSeleccionada()
    ) {
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      const ubicacion =
        await this.gpsService.obtenerUbicacion();
      this.latitud.set(ubicacion.latitud);
      this.longitud.set(ubicacion.longitud);
      this.mensajeExito.set(
        'Ubicación GPS obtenida correctamente.'
      );
    } catch (error) {
      this.mostrarError(error);
    } finally {
      this.guardando.set(false);
    }
  }
  async guardarFotografia(): Promise<void> {
    const acta = this.actaSeleccionada();
    if (
      !acta ||
      !this.fotoBlob ||
      this.guardando()
    ) {
      return;
    }
    if (
      this.latitud() === null ||
      this.longitud() === null
    ) {
      this.mensajeError.set(
        'Primero debes obtener la ubicación GPS.'
      );
      return;
    }
    const confirmar = window.confirm(
      '¿Deseas guardar la nueva fotografía del acta?'
    );
    if (!confirmar) return;
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    const ruta =
      `${acta.id}/${crypto.randomUUID()}.jpg`;
    let subida = false;
    let guardada = false;
    try {
      const { error: errorSubida } =
        await this.repoEvidencia.subir(ruta, this.fotoBlob);
      if (errorSubida) throw errorSubida;
      subida = true;
      const { error: errorGuardar } =
        await this.repoEvidencia.guardar(acta.id, ruta, this.latitud(), this.longitud());
      if (errorGuardar) throw errorGuardar;
      guardada = true;
      if (
        acta.foto_ruta &&
        acta.foto_ruta !== ruta
      ) {
        const { error: errorEliminar } =
          await this.repoEvidencia.eliminar(acta.foto_ruta);
        if (errorEliminar) {
          console.warn(errorEliminar);
        }
      }
      this.limpiarFoto();
      await this.actualizarActa(acta.id);
      const { data, error } =
        await this.repoEvidencia.urlFirmada(ruta, 600);
      if (error) throw error;
      this.fotoUrl.set(data.signedUrl);
      this.mensajeExito.set(
        'Fotografía guardada correctamente.'
      );
    } catch (error) {
      if (subida && !guardada) {
        await this.repoEvidencia.eliminar(ruta);
      }
      if (guardada) {
        this.mensajeError.set(
          'La fotografía fue guardada, pero no se pudo actualizar la vista. Vuelve a consultar el acta.'
        );
      } else {
        this.mostrarError(error);
      }
    } finally {
      this.guardando.set(false);
    }
  }
  private async actualizarActa(id: string): Promise<void> {
    const { data, error } = await this.repoActaConsulta.obtenerActas(id);
    if (error) throw error;
    const acta = data as Acta;
    this.actaSeleccionada.set(acta);
    this.actas.update(lista =>
      lista.map(item =>
        item.id === id ? acta : item
      )
    );
    this.latitud.set(acta.latitud);
    this.longitud.set(acta.longitud);
  }
  private limpiarFoto(): void {
    if (this.urlTemporal) {
      URL.revokeObjectURL(this.urlTemporal);
      this.urlTemporal = '';
    }
    this.fotoBlob = null;
    this.fotoUrl.set('');
    this.nuevaFoto.set(false);
  }
  volverListado(): void {
    this.limpiarFoto();
    this.actaSeleccionada.set(null);
    this.mensajeError.set('');
    this.mensajeExito.set('');
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
        'No se pudo completar la operación.'
      );
    }
  }
  async regresar(): Promise<void> {
    this.limpiarFoto();
    await this.router.navigateByUrl('/recinto');
  }
}
