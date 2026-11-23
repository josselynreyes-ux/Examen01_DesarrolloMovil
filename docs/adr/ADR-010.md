# ADR-010: Probar con pruebas unitarias de validaciones y una tabla manual por rol

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R6: validar la consistencia de los totales.

R7: gestionar permisos y errores de cámara y GPS.

R8: demostrar que un veedor no puede acceder a mesas ajenas.

R9 y entregables: estados de validación y README con pruebas.

#### Contexto

Hay que demostrar en la defensa que las reglas funcionan, que la seguridad está en el backend y que la cámara y el GPS manejan errores. El tiempo es limitado y la cámara y el GPS solo se prueban bien en un celular. Criterios: evidencia en el código, cobertura de la seguridad y tiempo de preparación.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Pruebas unitarias de validaciones | Evidencia en el código; se ejecutan solas y rápido | Solo prueban la lógica, no pantallas ni conexión |
| Tabla de pruebas manuales por rol | Cubre seguridad, roles, cámara y GPS en celular real | Toma tiempo y depende de hacerlo con cuidado |
| Pruebas automáticas de punta a punta (Playwright o Cypress) | Simulan al usuario sin repetir todo a mano | Configuración larga; no cubren cámara ni GPS |

#### Decisión

Se combinan dos tipos de pruebas:

Pruebas unitarias con el framework que trae Angular, para los validadores de cédula y de suma de votos, con datos válidos e inválidos.

Tabla de pruebas manuales por rol en el README, con caso, pasos, resultado esperado y resultado obtenido. Incluye: inicio de sesión con los tres roles, veedor A que intenta ver la mesa del veedor B, prueba de RLS en el editor SQL de Supabase, corrección de actas, y cámara y GPS en un celular real con permisos negados y sin internet.

#### Consecuencias

Beneficios: evidencia clara para la defensa y para el README.

Obligaciones: repetir la tabla manual tras cambios importantes.

Limitaciones: no hay pruebas automáticas de las pantallas.

Riesgo: las pruebas manuales dependen del cuidado de quien las ejecuta.

#### Verificación

El comando de pruebas del proyecto (ng test) ejecuta las pruebas de validadores sin fallos. El README contiene la tabla de pruebas manuales completa.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar tipos de pruebas y sugerir casos de prueba por rol.

Respuesta sugerida: pruebas unitarias de validadores, tabla manual por rol y pruebas en celular real.

Aceptación/rechazo: aceptada; se descartaron las pruebas de punta a punta por el tiempo.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se propusieron pruebas automáticas de punta a punta con Playwright o Cypress.

Acuerdo final: pruebas unitarias y tabla manual por rol; las de punta a punta se descartaron por el plazo y porque no cubren cámara ni GPS.

Minuto del video: [mm:ss]
