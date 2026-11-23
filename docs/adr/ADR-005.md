# ADR-005: Manejar el estado con Angular Signals

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R9: elegir y justificar la estrategia de manejo de estado y mostrar estados de carga, éxito, error y validación.

#### Contexto

La app debe compartir datos entre pantallas (usuario en sesión, mesas, actas) y mostrar en cada pantalla si está cargando, si hubo error o si terminó. Supabase trabaja con promesas. Criterios: simplicidad, que venga incluido en Angular, compatibilidad con Supabase y tiempo de aprendizaje.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Angular Signals | Simple, incluido en Angular, encaja con promesas; computed() para valores derivados | Más nuevo, con menos ejemplos que RxJS |
| RxJS con BehaviorSubject | Muy documentado; bueno para datos en tiempo real | Más complejo: suscripciones y riesgo de fugas de memoria |
| NgRx | Muy estructurado para apps grandes | Demasiado pesado para el plazo |

#### Decisión

Se usan Signals dentro de los servicios para el estado compartido:

computed() para valores calculados, como la suma de votos mientras el veedor escribe.

Cada pantalla tiene un estado explícito: cargando, éxito, error o vacío.

#### Consecuencias

Beneficios: menos código y un estado fácil de leer.

Obligaciones: cada servicio expone sus signals y métodos de forma clara.

Limitaciones: hay menos ejemplos en internet que con RxJS.

Riesgo: si más adelante se necesita tiempo real (por ejemplo, el dashboard actualizándose solo), habría que combinar Signals con suscripciones.

#### Verificación

Al escribir votos en el formulario del acta, el total calculado se actualiza al instante. Cada pantalla muestra el indicador de carga y el mensaje de error cuando se simula una falla de conexión.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar Signals, RxJS y NgRx para el tamaño y plazo del proyecto.

Respuesta sugerida: Signals dentro de los servicios, con computed().

Aceptación/rechazo: aceptada; se descartó NgRx por el tiempo.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se presentó RxJS por su documentación y su utilidad en tiempo real.

Acuerdo final: Signals, porque es más simple y Supabase trabaja con promesas.

Minuto del video: [mm:ss]
