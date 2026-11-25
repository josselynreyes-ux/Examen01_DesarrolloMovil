import { Injectable } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource
} from '@capacitor/camera';

import { validarNitidez } from '../../domain/validators/nitidez.validator';

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
      throw new Error(
        'No se pudo obtener la fotografía.'
      );
    }

    const respuesta = await fetch(foto.webPath);

    if (!respuesta.ok) {
      throw new Error(
        'No se pudo leer la fotografía.'
      );
    }

    const imagen = await respuesta.blob();

    if (imagen.size === 0) {
      throw new Error(
        'La fotografía está vacía.'
      );
    }

    if (
      imagen.type !== 'image/jpeg' &&
      imagen.type !== 'image/jpg' &&
      !(
        !imagen.type &&
        ['jpeg', 'jpg'].includes(
          foto.format.toLowerCase()
        )
      )
    ) {
      throw new Error(
        'La fotografía debe tener formato JPEG.'
      );
    }

    if (imagen.size > 5 * 1024 * 1024) {
      throw new Error(
        'La fotografía supera los 5 MB.'
      );
    }

    const archivo = new Blob(
      [imagen],
      { type: 'image/jpeg' }
    );

    // Validar la nitidez antes de aceptar la fotografía

    await this.comprobarNitidez(archivo);

    return archivo;

  }

  private async comprobarNitidez(
    archivo: Blob
  ): Promise<void> {

    const url = URL.createObjectURL(archivo);

    try {

      const imagen = new Image();

      await new Promise<void>((resolve, reject) => {

        imagen.onload = () => resolve();

        imagen.onerror = () => reject(
          new Error(
            'No se pudo analizar la fotografía.'
          )
        );

        imagen.src = url;

      });

      // Utilizar una resolución constante de análisis

      const dimensionMaxima = 800;

      const escala = dimensionMaxima / Math.max(
        imagen.naturalWidth,
        imagen.naturalHeight
      );

      const ancho = Math.max(
        3,
        Math.round(imagen.naturalWidth * escala)
      );

      const alto = Math.max(
        3,
        Math.round(imagen.naturalHeight * escala)
      );

      const canvas = document.createElement('canvas');

      canvas.width = ancho;
      canvas.height = alto;

      const contexto = canvas.getContext('2d', {
        willReadFrequently: true
      });

      if (!contexto) {

        throw new Error(
          'No se pudo procesar la fotografía.'
        );

      }

      contexto.drawImage(
        imagen,
        0,
        0,
        ancho,
        alto
      );

      const datos = contexto.getImageData(
        0,
        0,
        ancho,
        alto
      );

      const resultado = validarNitidez(
        datos.data,
        ancho,
        alto
      );

      console.log(
        'Puntuación de nitidez:',
        resultado.puntuacion
      );

      if (!resultado.esNitida) {

        throw new Error(
          'La fotografía está demasiado borrosa. ' +
          'Puntuación de nitidez: ' +
          resultado.puntuacion +
          '. Mantén el celular firme, enfoca el acta ' +
          'y vuelve a tomar la fotografía.'
        );

      }

    } finally {

      URL.revokeObjectURL(url);

    }

  }

}