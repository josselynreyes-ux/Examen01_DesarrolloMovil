import { Injectable } from '@angular/core';

import type { Candidato } from '../../domain/models/candidato.model';
import type { Organizacion } from '../../domain/models/organizacion.model';
import { supabase } from '../supabase/supabase.client';

function listarOrganizaciones() {
  return supabase.from('organizaciones').select('*').order('nombre').abortSignal(AbortSignal.timeout(15000));
}

function listarCandidatos() {
  return supabase.from('candidatos').select('*').order('nombre').abortSignal(AbortSignal.timeout(15000));
}

function listarOrganizaciones2() {
  return supabase.from('organizaciones').select('*').order('nombre');
}

function listarCandidatos2() {
  return supabase.from('candidatos').select('*').order('nombre');
}

function crearCandidatos(datos: Omit<Candidato, 'id'>) {
  return supabase.from('candidatos').insert(datos).abortSignal(AbortSignal.timeout(15000));
}

function actualizarCandidatos(datos: Omit<Candidato, 'id'>, identificador: string) {
  return supabase.from('candidatos').update(datos).eq('id', identificador).select('id').abortSignal(AbortSignal.timeout(15000));
}

function crearOrganizaciones(datos: Omit<Organizacion, 'id'>) {
  return supabase.from('organizaciones').insert(datos).abortSignal(AbortSignal.timeout(15000));
}

function actualizarOrganizaciones(datos: Omit<Organizacion, 'id'>, identificador: string) {
  return supabase.from('organizaciones').update(datos).eq('id', identificador).select('id').abortSignal(AbortSignal.timeout(15000));
}

@Injectable({ providedIn: 'root' })
export class CatalogoDatosRepository {
  readonly listarOrganizaciones: typeof listarOrganizaciones = listarOrganizaciones;
  readonly listarCandidatos: typeof listarCandidatos = listarCandidatos;
  readonly listarOrganizaciones2: typeof listarOrganizaciones2 = listarOrganizaciones2;
  readonly listarCandidatos2: typeof listarCandidatos2 = listarCandidatos2;
  readonly crearCandidatos: typeof crearCandidatos = crearCandidatos;
  readonly actualizarCandidatos: typeof actualizarCandidatos = actualizarCandidatos;
  readonly crearOrganizaciones: typeof crearOrganizaciones = crearOrganizaciones;
  readonly actualizarOrganizaciones: typeof actualizarOrganizaciones = actualizarOrganizaciones;
}
