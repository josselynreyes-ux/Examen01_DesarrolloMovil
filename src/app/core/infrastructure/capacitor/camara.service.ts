
import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CamaraService {

  async tomarFoto(): Promise<Blob> {

    const foto = await Camera.getPhoto({
      quality: 75,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      width: 1600,
      height: 1600
    });

    if (!foto.webPath) {
      throw new Error('No se pudo obtener la fotografía.');
    }

    const respuesta = await fetch(foto.webPath);

    if (!respuesta.ok) {
      throw new Error('No se pudo leer la fotografía.');
    }

    const imagen = await respuesta.blob();

    if (imagen.type !== 'image/jpeg') {
      throw new Error('La fotografía debe tener formato JPEG.');
    }

    if (imagen.size > 5 * 1024 * 1024) {
      throw new Error('La fotografía supera los 5 MB.');
    }

    return imagen;

  }
}
