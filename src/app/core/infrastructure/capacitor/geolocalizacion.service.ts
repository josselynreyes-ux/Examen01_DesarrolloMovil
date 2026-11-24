
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Ubicacion {
  latitud: number;
  longitud: number;
  precision: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {

  async obtenerUbicacion(): Promise<Ubicacion> {

    if (Capacitor.isNativePlatform()) {

      const permisos =
        await Geolocation.requestPermissions();

      if (
        permisos.location !== 'granted' &&
        permisos.coarseLocation !== 'granted'
      ) {
        throw new Error(
          'Debes permitir el acceso a la ubicación.'
        );
      }

    }

    const posicion =
      await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precision: posicion.coords.accuracy
    };

  }
}
