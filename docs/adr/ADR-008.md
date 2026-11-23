# ADR-008: Mostrar estados y mensajes con componentes de Ionic

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R7: gestionar errores de cámara y ubicación.

R9: mostrar estados explícitos de carga, éxito, error y validación.

#### Contexto

El usuario debe saber siempre qué está pasando: si algo carga, si se guardó, si falló o si un dato es inválido. Los errores de Supabase llegan en inglés y con mensajes técnicos. Criterios: consistencia visual, apariencia nativa en Android y poco código extra.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Componentes de Ionic | Ya incluidos, apariencia nativa, consistentes en toda la app | Menos personalizables |
| Componentes propios o una librería externa | Diseño a medida | Más código y otra dependencia que justificar |
| alert() del navegador | Inmediato | Se ve poco profesional y bloquea la app |

#### Decisión

Se usan componentes de Ionic para cada estado:

| Situación | Componente |
| --- | --- |
| Operación en curso (“Guardando acta…”) | ion-loading |
| Lista cargando | ion-skeleton-text |
| Éxito o error (“Acta guardada”, “Sin conexión”, con botón de reintentar) | ion-toast |
| Confirmación (“¿Reasignar este veedor?”) | ion-alert |
| Dato inválido | Texto de error debajo del campo |

Los errores de Supabase se traducen a mensajes claros en español antes de mostrarse.

#### Consecuencias

Beneficios: experiencia consistente y estados visibles en todas las pantallas.

Obligaciones: manejar cada operación con su estado de carga y su mensaje.

Limitaciones: el diseño queda atado al estilo de Ionic.

Riesgo: si alguna operación no captura su error, el usuario no vería ningún mensaje.

#### Verificación

Al guardar un acta aparece el indicador de carga y luego el aviso de éxito. Sin internet aparece “Sin conexión” con el botón de reintentar. Un campo inválido muestra su error debajo.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: qué componente de Ionic usar para cada estado que pide R9.

Respuesta sugerida: la tabla de componentes de la decisión.

Aceptación/rechazo: aceptada.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: [completar]

Acuerdo final: componentes de Ionic, por estar incluidos y verse nativos en Android, sin agregar librerías.

Minuto del video: [mm:ss]
