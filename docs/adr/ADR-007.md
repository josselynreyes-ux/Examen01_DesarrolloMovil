# ADR-007: Controlar la navegación con Angular Router y guards por rol

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R3: cambio obligatorio de contraseña en el primer acceso.

R4, R5 y R6: cada rol ve solo sus funciones.

#### Contexto

Cada rol tiene pantallas distintas y nadie debe entrar a pantallas que no le corresponden. Un usuario nuevo debe cambiar su contraseña antes de usar la app. La seguridad real está en el backend (ADR-002), pero la navegación también debe impedir el acceso. Criterios: proteger rutas por sesión y rol, tiempo de carga y claridad del código.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Router con guards funcionales y carga diferida | Protege cada ruta antes de entrar; las pantallas se cargan solo cuando se usan | Hay que mantener varios guards |
| Ocultar botones y menús según el rol | Muy simple | Se puede entrar escribiendo la ruta; no protege nada |

#### Decisión

Se usa Angular Router con loadComponent (carga diferida) y tres guards:

authGuard: sin sesión, redirige al login.

roleGuard: si el rol no corresponde a la ruta, no deja entrar.

cambioClaveGuard: si debe_cambiar_clave es verdadero, obliga a ir a la pantalla de cambio de contraseña.

#### Consecuencias

Beneficios: cada rol solo navega a sus pantallas y la app abre más rápido.

Obligaciones: declarar el rol permitido en cada ruta.

Limitaciones: los guards solo protegen la interfaz, no los datos.

Riesgo: si se olvida una política RLS, los datos quedarían expuestos aunque los guards funcionen.

#### Verificación

Con sesión de veedor, escribir la ruta del coordinador provincial redirige fuera. Sin sesión, cualquier ruta lleva al login. Un usuario nuevo es enviado al cambio de contraseña.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: qué guards necesita la app según los roles y el primer acceso.

Respuesta sugerida: authGuard, roleGuard y cambioClaveGuard, con carga diferida.

Aceptación/rechazo: aceptada.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: [completar]

Acuerdo final: usar guards en lugar de solo ocultar opciones, porque el examen exige que las reglas no dependan de ocultar pantallas.

Minuto del video: [mm:ss]
