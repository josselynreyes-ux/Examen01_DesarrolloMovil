# ADR-002: Usar Supabase como backend, con autenticación, RLS, Storage y modelo relacional

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R1: precarga de recintos, organizaciones y candidaturas.

R2: creación jerárquica de cuentas, sin autorregistro.

R3: inicio de sesión con cédula, cambio de clave y recuperación por correo.

R4, R5 y R6: funciones de cada rol.

R8: reglas de acceso por rol y pertenencia, persistencia de datos e imágenes.

#### Contexto

La app necesita autenticación, creación de usuarios sin autorregistro, reglas de acceso por rol aplicadas en el backend, almacenamiento de fotos y datos relacionados (recinto → junta → acta). No se deben exponer claves administrativas en la app. Criterios: seguridad en el servidor, costo sin tarjeta, ajuste al modelo de datos, documentación y tiempo.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Supabase | Base relacional (PostgreSQL); reglas RLS por fila; Edge Functions y Storage en plan gratis sin tarjeta | El proyecto gratis se pausa tras 7 días sin uso; una regla RLS mal escrita puede exponer datos |
| Firebase | Muchos tutoriales con Ionic; reglas de seguridad en Firestore | Cloud Functions exige el plan Blaze con tarjeta; NoSQL obliga a duplicar datos y complica sumar votos |
| Appwrite | Functions y Storage gratis; permisos por documento | Pocos ejemplos con Ionic; permisos más manuales |

#### Decisión

Se elige Supabase con estas condiciones:

Autorización: políticas RLS en todas las tablas y en el Storage. El coordinador provincial ve todo; el coordinador de recinto, solo su recinto; el veedor, solo las juntas que tiene asignadas.

Creación de usuarios: una Edge Function valida el rol de quien la llama (provincial crea coordinadores de recinto; coordinador crea veedores de su recinto) y crea la cuenta con la contraseña inicial Ecuador2026.

Inicio de sesión con cédula: Supabase autentica con correo, así que la cédula es el identificador visible. Una Edge Function recibe cédula y contraseña, busca el correo en el servidor e inicia sesión; el correo nunca se expone en la app. Ante datos incorrectos responde siempre “Cédula o contraseña incorrecta”.

Primer acceso y recuperación: el campo debe_cambiar_clave obliga a cambiar la contraseña; la recuperación usa un código enviado al correo (ver ADR-011).

Datos iniciales (R1): muestra de 5 a 8 recintos reales de Pichincha – Quito, 5 organizaciones y sus candidaturas a alcaldía y prefectura.

Modelo de datos:

| Tabla | Contenido principal |
| --- | --- |
| perfiles | cédula, nombres, apellidos, teléfono, correo, rol, recinto, debe_cambiar_clave |
| recintos | provincia, cantón, parroquia, nombre, cantidad de JRV, coordenadas |
| juntas | recinto, número de JRV, estado |
| asignaciones | junta, veedor, fecha de asignación, activa (guarda el historial de reasignaciones) |
| organizaciones | nombre y siglas |
| candidatos | organización, nombre, dignidad (alcalde o prefecto) |
| actas | junta, dignidad, nulos, blancos, total de sufragantes, ruta de la foto, latitud, longitud, estado, updated_at |
| votos_acta | acta, organización, votos |

Estados de una junta o acta: pendiente → registrada → corregida.

Fotos en un bucket actas de Supabase Storage, en la ruta recinto/junta/dignidad.jpg; el acta guarda solo la ruta.

Votos en una tabla de detalle y no en 5 columnas fijas, para sumarlos con una consulta en el dashboard.

#### Consecuencias

Beneficios: la seguridad queda en la base de datos y no solo en ocultar pantallas; todo funciona en plan gratis.

Obligaciones: escribir y probar políticas RLS para tablas y Storage; reactivar el proyecto antes de la defensa.

Limitaciones: el plan gratis tiene límites de almacenamiento y se pausa por inactividad.

Riesgo: una política RLS incorrecta podría exponer datos de otras mesas.

#### Verificación

Con sesión de un veedor A, consultar las actas de una junta del veedor B devuelve 0 filas. La prueba se repite en el editor SQL de Supabase haciéndose pasar por ese usuario. Ninguna clave service_role aparece en el código de la app.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar Firebase, Supabase y Appwrite según R2, R3 y R8; proponer el modelo de datos y cómo iniciar sesión con cédula.

Respuesta sugerida: Supabase con RLS, Edge Functions para crear usuarios y para el login con cédula, y el modelo de tablas descrito.

Aceptación/rechazo: se aceptó Supabase y el login mediante Edge Function; se descartó registrar correos falsos con la cédula porque impediría la recuperación.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se presentaron Firebase, por sus tutoriales, y Appwrite; en el modelo se discutió guardar el veedor en la junta frente a una tabla de asignaciones.

Acuerdo final: Supabase. Firebase se descartó por la tarjeta que exige el plan Blaze y por su modelo NoSQL; Appwrite, por la poca documentación con Ionic. Se acordó tabla de asignaciones aparte, votos en tabla de detalle y estados pendiente, registrada y corregida.

Minuto del video: [mm:ss]
