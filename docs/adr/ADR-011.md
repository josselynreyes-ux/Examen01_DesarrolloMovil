# ADR-011: Enviar los correos de autenticación con Brevo como SMTP de Supabase

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R2: enviar confirmación de cuenta.

R3: recuperación de contraseña por correo.

#### Contexto

La app debe enviar correos a coordinadores y veedores con correos reales. El servicio de correo que trae Supabase por defecto es solo para pruebas: envía muy pocos mensajes por hora y solo a los correos del equipo del proyecto. Criterios: costo sin tarjeta, límite de envíos, configuración sin exponer claves y posibilidad de enviar a cualquier correo sin dominio propio.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Brevo | Gratis hasta 300 correos al día; sin tarjeta; solo pide verificar el remitente | Los correos pueden caer en spam |
| Gmail con contraseña de aplicación | Todas tenemos cuenta; configuración rápida | Usa un correo personal; límite diario; riesgo de bloqueo de la cuenta |
| Resend | Moderno y bien documentado | Para enviar a cualquier correo exige un dominio propio, que no tenemos |
| SMTP por defecto de Supabase | Sin configuración | Solo para pruebas; no sirve para usuarios reales |

#### Decisión

Se usa Brevo como SMTP personalizado en el panel de Supabase (servidor smtp-relay.brevo.com, puerto 587, con el login SMTP y una clave SMTP de Brevo). Cada integrante crea su propia cuenta y verifica su correo remitente. Sirve para la confirmación de cuenta y para el código de recuperación de contraseña. Gmail queda como plan B.

#### Consecuencias

Beneficios: correos a usuarios reales sin costo y sin claves en la app.

Obligaciones: guardar la clave SMTP solo en el panel de Supabase y mencionarla en el README sin su valor.

Limitaciones: máximo 300 correos al día en el plan gratis.

Riesgo: los correos pueden llegar a spam si el remitente no está bien verificado.

#### Verificación

Crear un usuario de prueba con un correo propio: llega el correo de confirmación. Pedir recuperación de contraseña: llega el código y permite cambiarla. El historial de envíos de Brevo muestra ambos correos.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar servicios SMTP gratuitos y obtener los datos de configuración de Brevo para Supabase.

Respuesta sugerida: Brevo como SMTP personalizado, con su servidor, puerto y clave SMTP.

Aceptación/rechazo: aceptada; se descartó Resend por requerir dominio propio.

Verificación humana: [completar; por ejemplo, contrastar los datos con la documentación oficial de Brevo]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se propusieron Gmail, por ser conocido, y Resend, por su documentación.

Acuerdo final: Brevo, para no arriesgar correos personales; Gmail queda como plan B y Resend se descartó por el dominio propio.

Minuto del video: [mm:ss]
