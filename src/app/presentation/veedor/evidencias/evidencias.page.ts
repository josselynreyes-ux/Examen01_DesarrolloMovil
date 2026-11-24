
import { Component, inject, signal } from '@angular/core';
import type { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import type { Acta } from '../../../core/domain/models/acta.model';
import type { Junta } from '../../../core/domain/models/junta.model';
import { CamaraService } from '../../../core/infrastructure/capacitor/camara.service';
import type { Ubicacion } from '../../../core/infrastructure/capacitor/geolocalizacion.service';
import { GeolocalizacionService } from '../../../core/infrastructure/capacitor/geolocalizacion.service';
import { AuthService } from '../../../core/infrastructure/supabase/auth.service';
import { supabase } from '../../../core/infrastructure/supabase/supabase.client';

@Component({
  selector: 'app-evidencias',
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './evidencias.page.html',
  styleUrls: ['./evidencias.page.scss']
})
export class EvidenciasPage implements OnInit, OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);
  private camaraService = inject(CamaraService);
  private gpsService = inject(GeolocalizacionService);

  private archivoFoto: Blob | null = null;
  private urlTemporal: string | null = null;

  actas = signal<Acta[]>([]);
  juntas = signal<Junta[]>([]);

  actaSeleccionada = signal<Acta | null>(null);
  fotoPreview = signal<string | null>(null);
  ubicacion = signal<Ubicacion | null>(null);

  cargando = signal(false);
  capturando = signal(false);
  localizando = signal(false);
  guardando = signal(false);

  mensajeError = signal('');
  mensajeExito = signal('');

  async ngOnInit(): Promise<void> {
    await this.cargarActas();
  }

  ngOnDestroy(): void {
    this.liberarFoto();
  }

  ocupado(): boolean {

    return this.cargando() ||
      this.capturando() ||
      this.localizando() ||
      this.guardando();

  }

  async cargarActas(): Promise<void> {

    if (this.cargando()) return;

    this.cargando.set(true);
    this.mensajeError.set('');

    try {

      const perfil =
        await this.authService.obtenerPerfil();

      if (!perfil || perfil.rol !== 'veedor') {
        throw new Error('Perfil no autorizado.');
      }

      const { data: asignaciones, error } =
        await supabase
          .from('asignaciones')
          .select('junta_id')
          .eq('veedor_id', perfil.id)
          .eq('activa', true)
          .abortSignal(AbortSignal.timeout(15000));

      if (error) throw error;

      const ids = (asignaciones ?? [])
        .map(item => item.junta_id);

      if (ids.length === 0) {

        this.actas.set([]);
        this.juntas.set([]);
        return;

      }

      const [rActas, rJuntas] = await Promise.all([

        supabase
          .from('actas')
          .select('*')
          .in('junta_id', ids)
          .in('estado', ['registrada', 'corregida'])
          .abortSignal(AbortSignal.timeout(15000)),

        supabase
          .from('juntas')
          .select('*')
          .in('id', ids)
          .abortSignal(AbortSignal.timeout(15000))

      ]);

      if (rActas.error) throw rActas.error;
      if (rJuntas.error) throw rJuntas.error;

      this.actas.set(
        (rActas.data ?? []) as Acta[]
      );

      this.juntas.set(
        (rJuntas.data ?? []) as Junta[]
      );

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.cargando.set(false);

    }
  }

  numeroJunta(id: string): number | string {

    return this.juntas()
      .find(junta => junta.id === id)?.numero_jrv
      ?? 'Sin número';

  }

  async seleccionarActa(acta: Acta): Promise<void> {

    if (this.ocupado()) return;

    this.liberarFoto();

    this.actaSeleccionada.set(acta);
    this.fotoPreview.set(null);
    this.ubicacion.set(null);

    this.mensajeError.set('');
    this.mensajeExito.set('');

    if (acta.foto_ruta) {

      this.cargando.set(true);

      try {

        const { data, error } = await supabase
          .storage
          .from('actas-electorales')
          .createSignedUrl(acta.foto_ruta, 300);

        if (error) throw error;

        this.fotoPreview.set(data.signedUrl);

      } catch (error) {

        this.mostrarError(error);

      } finally {

        this.cargando.set(false);

      }
    }
  }

  async tomarFoto(): Promise<void> {

    if (this.ocupado()) return;

    this.capturando.set(true);
    this.mensajeError.set('');

    try {

      const foto =
        await this.camaraService.tomarFoto();

      this.liberarFoto();

      this.archivoFoto = foto;
      this.urlTemporal = URL.createObjectURL(foto);

      this.fotoPreview.set(this.urlTemporal);

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.capturando.set(false);

    }
  }

  async obtenerUbicacion(): Promise<void> {

    if (this.ocupado()) return;

    this.localizando.set(true);
    this.mensajeError.set('');

    try {

      const ubicacion =
        await this.gpsService.obtenerUbicacion();

      this.ubicacion.set(ubicacion);

    } catch (error) {

      this.mostrarError(error);

    } finally {

      this.localizando.set(false);

    }
  }

  puedeGuardar(): boolean {

    return !!this.actaSeleccionada() &&
      !!this.archivoFoto &&
      !!this.ubicacion() &&
      !this.ocupado();

  }

  async guardarEvidencia(): Promise<void> {

    const acta = this.actaSeleccionada();
    const ubicacion = this.ubicacion();
    const archivo = this.archivoFoto;

    if (
      !acta ||
      !ubicacion ||
      !archivo ||
      this.ocupado()
    ) {
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    const ruta =
      `${acta.id}/${crypto.randomUUID()}.jpg`;

    let fotografiaSubida = false;
    let evidenciaGuardada = false;

    try {

      const { error: errorFoto } = await supabase
        .storage
        .from('actas-electorales')
        .upload(ruta, archivo, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (errorFoto) throw errorFoto;

      fotografiaSubida = true;

      const { error: errorActa } = await supabase
        .rpc('guardar_evidencia_acta', {
          p_acta_id: acta.id,
          p_foto_ruta: ruta,
          p_latitud: ubicacion.latitud,
          p_longitud: ubicacion.longitud
        });

      if (errorActa) throw errorActa;

      evidenciaGuardada = true;

      if (acta.foto_ruta) {

        const { error } = await supabase
          .storage
          .from('actas-electorales')
          .remove([acta.foto_ruta]);

        if (error) console.error(error);

      }

      this.liberarFoto();

      this.actaSeleccionada.set(null);
      this.fotoPreview.set(null);
      this.ubicacion.set(null);

      this.mensajeExito.set(
        'Fotografía y ubicación guardadas correctamente.'
      );

      await this.cargarActas();

    } catch (error) {

      if (fotografiaSubida && !evidenciaGuardada) {

        const { error: limpiezaError } = await supabase
          .storage
          .from('actas-electorales')
          .remove([ruta]);

        if (limpiezaError) {
          console.error(limpiezaError);
        }

      }

      this.mostrarError(error);

    } finally {

      this.guardando.set(false);

    }
  }

  cancelar(): void {

    if (this.ocupado()) return;

    this.liberarFoto();

    this.actaSeleccionada.set(null);
    this.fotoPreview.set(null);
    this.ubicacion.set(null);
    this.mensajeError.set('');

  }

  private liberarFoto(): void {

    if (this.urlTemporal) {
      URL.revokeObjectURL(this.urlTemporal);
    }

    this.urlTemporal = null;
    this.archivoFoto = null;

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

  async regresar(): Promise<void> {

    if (this.ocupado()) return;

    this.cancelar();

    await this.router.navigateByUrl('/veedor');

  }
}
