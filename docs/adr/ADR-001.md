# ADR-001: Usar Ionic Angular standalone como framework

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R9: separación de capas y manejo de estado según el framework elegido.

Condición técnica del examen: solo se admite Ionic Angular standalone o Ionic React, con Capacitor.

#### Contexto

El equipo debe elegir un único framework para las tres aplicaciones. El plazo es corto (entrega el 25 de noviembre a las 14:00) y la app necesita formularios con muchas validaciones y pantallas protegidas por rol. Criterios: experiencia previa del equipo, herramientas para validar formularios y proteger rutas, y tiempo de aprendizaje.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Ionic Angular (standalone) | Lo aprendimos en clase; trae Reactive Forms, guards e inyección de dependencias | Más archivos y configuración |
| Ionic React | Código más corto; muchas librerías y ejemplos | Habría que aprenderlo desde cero en 4 días |

#### Decisión

Se elige Ionic Angular con componentes standalone (sin NgModule) y Capacitor, porque aprovecha la experiencia del equipo y sus herramientas cubren directamente las validaciones y la protección por rol.

#### Consecuencias

Beneficios: desarrollo más rápido al usar lo conocido; estructura ordenada.

Obligaciones: usar componentes standalone en todo el proyecto.

Limitaciones: Angular genera más código repetitivo que React.

Riesgo: el código extra puede quitar tiempo de desarrollo.

#### Verificación

Proyecto creado con ionic start en modo standalone; no existe ningún archivo *.module.ts; ionic info muestra Angular y Capacitor.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar Ionic Angular y Ionic React según los requisitos del examen.

Respuesta sugerida: Ionic Angular, por la experiencia del equipo y sus herramientas de formularios y guards.

Aceptación/rechazo: aceptada; la decisión final la tomó el equipo según su experiencia.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se presentó Ionic React por su código más corto.

Acuerdo final: Ionic Angular, porque aprender React en el plazo disponible era un riesgo.

Minuto del video: [mm:ss]
