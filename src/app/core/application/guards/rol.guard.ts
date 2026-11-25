
import { inject } from '@angular/core';
import type { CanActivateFn} from '@angular/router';
import { Router } from '@angular/router';

import type { RolUsuario } from '../../domain/models/perfil.model';
import { AuthService } from '../../infrastructure/supabase/auth.service';

export const rolGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const sesion = await authService.obtenerSesion();

    if (!sesion) {
      return router.createUrlTree(['/login']);
    }

    const perfil = await authService.obtenerPerfil();

    if (!perfil) {
      return router.createUrlTree(['/login']);
    }

    const rutaActual = route.routeConfig?.path;

    // Si debe cambiar la contraseña,
    // solo puede acceder a cambiar-clave.
    if (perfil.debe_cambiar_clave) {
      if (rutaActual === 'cambiar-clave') {
        return true;
      }

      return router.createUrlTree(['/cambiar-clave']);
    }

    // Si ya cambió la contraseña,
    // no necesita volver a esa pantalla.
    if (rutaActual === 'cambiar-clave') {
      switch (perfil.rol) {
        case 'coordinador_provincial':
          return router.createUrlTree(['/provincial']);

        case 'coordinador_recinto':
          return router.createUrlTree(['/recinto']);

        case 'veedor':
          return router.createUrlTree(['/veedor']);

        default:
          return router.createUrlTree(['/login']);
      }
    }

    // Verificar los roles permitidos.
    const rolesPermitidos =
      route.data?.['roles'] as RolUsuario[] | undefined;

    if (
      rolesPermitidos &&
      !rolesPermitidos.includes(perfil.rol)
    ) {
      return router.createUrlTree(['/login']);
    }

    return true;

  } catch (error) {
    console.error('Error verificando acceso:', error);

    return router.createUrlTree(['/login']);
  }
};
