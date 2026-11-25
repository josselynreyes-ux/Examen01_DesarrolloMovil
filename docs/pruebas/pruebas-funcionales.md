# Pruebas funcionales por rol

Repetir en la versión final después de la refactorización. Los módulos fueron probados durante el desarrollo según confirmación de la estudiante; no se dispone de evidencia individual de cada regresión final.

| Rol | Pasos | Esperado | Resultado final |
|---|---|---|---|
| Todos | Login válido e inválido | Acceso por rol o error | Aprobado |
| Todos | Primer acceso y recuperación | Cambio obligatorio y código por correo | Aprobado |
| Provincial | Crear recinto, JRV, coordinador y candidatos | Datos persistidos | Aprobado |
| Provincial | Filtrar resultados y consultar evidencia | Totales y fotografías correctos | Aprobado |
| Recinto | Crear veedor, asignar y reasignar | Asignación activa única | Aprobado |
| Recinto | Corregir acta y evidencia | Datos actualizados | Aprobado|
| Veedor | Registrar alcalde y prefecto | Actas guardadas | Aprobado|
| Veedor | Ingresar suma incorrecta | Rechazo | Pendiente |
| Veedor | Capturar foto borrosa y nítida | Rechazo y aceptación respectivamente | Aprobado |
| Veedor | Obtener GPS y guardar evidencia | Ruta y coordenadas persistidas | Aprobado |
| Android | Negar permisos, apagar GPS y desconectar internet | Error comprensible y posibilidad de reintento |Aprobado |
