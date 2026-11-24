
import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import type { Perfil } from '../../core/domain/models/perfil.model';
import { AuthService } from '../../core/infrastructure/supabase/auth.service';

@Component({
  selector: 'app-provincial',
  imports: [
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar
  ],
  templateUrl: './provincial.page.html',
  styleUrls: ['./provincial.page.scss']
})
export class ProvincialPage implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  perfil = signal<Perfil | null>(null);
  mensajeError = signal('');

  async ngOnInit(): Promise<void> {

    try {

      const perfil = await this.authService.obtenerPerfil();

      this.perfil.set(perfil);

    } catch (error) {

      console.error(error);
      this.mensajeError.set('No se pudo cargar el perfil.');

    }
  }

  async cerrarSesion(): Promise<void> {

    try {

      await this.authService.cerrarSesion();

      await this.router.navigateByUrl('/login', {
        replaceUrl: true
      });

    } catch (error) {

      console.error(error);
      this.mensajeError.set('No se pudo cerrar sesión.');

    }
  }
}