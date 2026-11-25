
import { TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

import type { Junta } from '../../../../core/domain/models/junta.model';
import type { Recinto } from '../../../../core/domain/models/recinto.model';
import { JuntaDatosRepository } from '../../../../core/infrastructure/repositories/junta-datos.repository';
import { RecintoDatosRepository } from '../../../../core/infrastructure/repositories/recinto-datos.repository';


@Component({
  selector: 'app-juntas',
  imports: [
    TitleCasePipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './juntas.page.html',
  styleUrls: ['./juntas.page.scss']
})
export class JuntasPage implements OnInit {
  private readonly repoJunta = inject(JuntaDatosRepository);
  private readonly repoRecinto = inject(RecintoDatosRepository);


  private route = inject(ActivatedRoute);
  private router = inject(Router);

  recintoId = '';

  recinto = signal<Recinto | null>(null);
  juntas = signal<Junta[]>([]);

  cargando = signal(false);
  mensajeError = signal('');

  async ngOnInit(): Promise<void> {
    this.recintoId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.recintoId) {
      this.mensajeError.set('No se encontró el recinto.');
      return;
    }

    await this.cargarJuntas();
  }

  async cargarJuntas(): Promise<void> {
    if (this.cargando() || !this.recintoId) {
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');

    try {
      const { data: recinto, error: errorRecinto } =
        await this.repoRecinto.obtenerRecintos(this.recintoId);

      if (errorRecinto) {
        throw errorRecinto;
      }

      this.recinto.set(recinto as Recinto);

      const { data: juntas, error: errorJuntas } =
        await this.repoJunta.juntasDelRecinto(this.recintoId);

      if (errorJuntas) {
        throw errorJuntas;
      }

      this.juntas.set((juntas ?? []) as Junta[]);

    } catch (error) {
      console.error('Error cargando juntas:', error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        this.mensajeError.set(String(error.message));
      } else {
        this.mensajeError.set(
          'No se pudieron cargar las juntas.'
        );
      }

    } finally {
      this.cargando.set(false);
    }
  }

  async regresar(): Promise<void> {
    await this.router.navigateByUrl('/provincial/recintos');
  }
}
