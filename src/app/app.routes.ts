import type { Routes } from '@angular/router';

import { rolGuard } from './core/application/guards/rol.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./presentation/auth/login.page')
        .then(m => m.LoginPage)
  },

  {
    path: 'recuperar-clave',
    loadComponent: () =>
      import('./presentation/auth/recuperar-clave.page')
        .then(m => m.RecuperarClavePage)
  },

  {
    path: 'cambiar-clave',
    canActivate: [rolGuard],
    loadComponent: () =>
      import('./presentation/auth/cambiar-clave.page')
        .then(m => m.CambiarClavePage)
  },

  {
    path: 'provincial',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/provincial.page')
        .then(m => m.ProvincialPage)
  },

  {
    path: 'provincial/recintos',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/recintos/recintos.page')
        .then(m => m.RecintosPage)
  },

  {
    path: 'provincial/recintos/:id/juntas',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/recintos/juntas/juntas.page')
        .then(m => m.JuntasPage)
  },

  {
    path: 'provincial/coordinadores',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/coordinadores/coordinadores.page')
        .then(m => m.CoordinadoresPage)
  },

  {
    path: 'provincial/organizaciones',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/organizaciones/organizaciones.page')
        .then(m => m.OrganizacionesPage)
  },

  {
    path: 'provincial/resultados',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_provincial']
    },
    loadComponent: () =>
      import('./presentation/provincial/resultados/resultados.page')
        .then(m => m.ResultadosPage)
  },

  {
    path: 'recinto',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_recinto']
    },
    loadComponent: () =>
      import('./presentation/recinto/recinto.page')
        .then(m => m.RecintoPage)
  },

  {
    path: 'recinto/actas',
    canActivate: [rolGuard],
    data: {
      roles: ['coordinador_recinto']
    },
    loadComponent: () =>
      import('./presentation/recinto/actas/actas.page')
        .then(m => m.ActasPage)
  },

  {
    path: 'veedor',
    canActivate: [rolGuard],
    data: {
      roles: ['veedor']
    },
    loadComponent: () =>
      import('./presentation/veedor/veedor.page')
        .then(m => m.VeedorPage)
  },

  {
    path: 'veedor/evidencias',
    canActivate: [rolGuard],
    data: {
      roles: ['veedor']
    },
    loadComponent: () =>
      import('./presentation/veedor/evidencias/evidencias.page')
        .then(m => m.EvidenciasPage)
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];