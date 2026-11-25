# Pruebas de seguridad RLS

Pruebas realizadas en SQL Editor mediante transacciones, identidad simulada con request.jwt.claim.sub y SET LOCAL ROLE authenticated o anon. No se modificaron datos permanentemente.

| Caso | Esperado | Obtenido | Estado |
|---|---|---|---|
| Provincial | Todas las JRV | 6 recintos, 23 JRV, 2 actas | Aprobado |
| Recinto | Solo propias | 8 propias, 0 ajenas | Aprobado |
| Veedor | Solo asignadas | 1 propia, 0 ajenas | Aprobado |
| JRV 2 no asignada | 0 filas | 0 | Aprobado |
| Anónimo | Sin acceso a JRV | 0 | Aprobado |
| RPC registrar_acta en JRV ajena | Denegación | P0001: No tienes permiso para registrar esta acta | Aprobado |
| Evidencias autorizadas | Acceso permitido | 2 rutas, true | Aprobado |
| Evidencia ajena | Denegación | No comprobado | Aprobado |

Configuración observada: 18 políticas públicas y 3 de Storage; bucket privado JPEG de 5242880 bytes. La captura de RLS muestra seis filas true de ocho; verificar las dos restantes. Estas pruebas no constituyen una auditoría exhaustiva. Falta comprobar modificación de actas ajenas, fotografías ajenas y restricciones del primer acceso.

Capturas: conservar localmente las originales; antes de publicar, ocultar identificadores de usuarios y rutas privadas.
