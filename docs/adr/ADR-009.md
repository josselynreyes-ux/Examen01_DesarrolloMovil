# ADR-009: Consumir el backend con el SDK de Supabase y Edge Functions para lo administrativo

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R3: proteger credenciales y no exponer claves administrativas en la app.

R8: backend con reglas de acceso y persistencia de datos e imágenes.

Entregables: README con configuración sin secretos.

#### Contexto

La app debe leer y guardar datos, iniciar sesión y subir fotos a Supabase. Algunas operaciones, como crear usuarios, requieren permisos de administrador que no pueden estar en la app. La configuración debe quedar fuera del repositorio público. Criterios: cantidad de código, seguridad de las claves y manejo del token de sesión.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| SDK oficial supabase-js | Maneja login, consultas, Storage y renovación del token | Dependencia externa que hay que actualizar |
| HttpClient de Angular con la API REST | Visto en clase; interceptores; más control | Login, renovación del token y subida de fotos a mano; más errores |
| Todas las operaciones mediante Edge Functions | Toda la lógica en el servidor | Una función por operación; mucho más trabajo |

#### Decisión

SDK supabase-js para datos, autenticación y fotos. Las llamadas están solo en la capa de infraestructura (ADR-004), nunca en las páginas.

Edge Functions solo para lo administrativo: crear usuarios e iniciar sesión con cédula (ADR-002).

Claves: la anon key va en la app, protegida por RLS; la service_role solo existe como secreto de las Edge Functions.

Configuración: environment.ts con los valores reales está en .gitignore; en GitHub se sube environment.example.ts sin valores reales.

Errores de conexión: mensaje claro con botón de reintentar (ADR-008).

#### Consecuencias

Beneficios: menos código y ninguna clave administrativa en la app.

Obligaciones: configurar los secretos de las Edge Functions en Supabase y documentar la configuración en el README.

Limitaciones: la app depende de la API del SDK.

Riesgo: si el SDK cambia de versión, habría que actualizar la capa de infraestructura.

#### Verificación

El valor de la clave service_role no aparece en el código de la app ni en el repositorio (solo se lee como variable secreta dentro de las Edge Functions). environment.ts no aparece en el historial de GitHub. Con la app sin internet, una operación muestra el mensaje de error y el botón de reintentar.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar el SDK de Supabase con HttpClient y definir qué claves pueden ir en la app.

Respuesta sugerida: SDK para datos, login y fotos; Edge Functions solo para lo administrativo; anon key en la app y service_role solo en el servidor.

Aceptación/rechazo: aceptada; se descartó HttpClient por la cantidad de código manual.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se presentó HttpClient por dar más control sobre cada petición.

Acuerdo final: SDK de Supabase, porque evita programar a mano el login, el token y la subida de fotos; Edge Functions limitadas a lo administrativo.

Minuto del video: [mm:ss]
