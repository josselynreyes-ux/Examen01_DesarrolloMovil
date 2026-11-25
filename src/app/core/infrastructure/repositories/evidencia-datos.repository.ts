import { Injectable } from '@angular/core';

import { supabase } from '../supabase/supabase.client';

function eliminar(rutaFoto: string) {
  return supabase.storage.from('actas-electorales').remove([rutaFoto]);
}

function guardar(actaId: string, rutaFoto: string, latitud: number | null, longitud: number | null) {
  return supabase.rpc('guardar_evidencia_acta', { p_acta_id: actaId, p_foto_ruta: rutaFoto, p_latitud: latitud, p_longitud: longitud });
}

function subir(rutaFoto: string, foto: Blob) {
  return supabase.storage.from('actas-electorales').upload(rutaFoto, foto, { contentType: 'image/jpeg', upsert: false });
}

function urlFirmada(rutaFoto: string, segundos: number) {
  return supabase.storage.from('actas-electorales').createSignedUrl(rutaFoto, segundos);
}


@Injectable({ providedIn: 'root' })
export class EvidenciaDatosRepository {
  readonly eliminar: typeof eliminar = eliminar;
  readonly guardar: typeof guardar = guardar;
  readonly subir: typeof subir = subir;
  readonly urlFirmada: typeof urlFirmada = urlFirmada;
}
