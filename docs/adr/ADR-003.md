# ADR-003: Usar Capacitor Camera y Geolocation para fotos y ubicación de actas

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R7: capturar la foto de cada acta desde la app, guardar el GPS como campos del registro y gestionar permisos y errores.

Condición técnica del examen: integrar Capacitor para cámara y geolocalización y compilar para Android.

#### Contexto

El veedor debe fotografiar cada acta y guardar las coordenadas GPS. La app debe manejar permisos negados y fallos de cámara o GPS. En los recintos el internet suele ser lento. Criterios: funcionamiento en Android, confiabilidad de la foto y de la ubicación, y peso de las imágenes.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Solo cámara, calidad intermedia | Asegura que la foto se tomó en el momento; fotos livianas | Si la cámara falla, no hay otra forma de subir la foto |
| Cámara o galería, calidad alta | Alternativa si la cámara falla; números más legibles | Permite subir fotos viejas o de otra mesa; más datos móviles |
| GPS automático al tomar la foto | La ubicación coincide con el momento de la foto | Si el GPS falla, interrumpe la toma; el usuario no ve qué se guardó |
| GPS con botón “Obtener ubicación” | El usuario entiende el permiso, ve sus coordenadas y puede reintentar | El veedor podría olvidarlo u obtenerla en otro lugar |

#### Decisión

Se usan los plugins oficiales @capacitor/camera y @capacitor/geolocation:

Foto: solo desde la cámara (sin galería), con calidad cercana al 80 % y tamaño reducido antes de subirla. Se muestra una vista previa antes de confirmar.

Ubicación: se obtiene con un botón “Obtener ubicación”, con alta precisión y un tiempo límite de unos 10 segundos. Se guardan latitud, longitud, precisión en metros y fecha y hora. El acta no se puede guardar sin ubicación.

Permisos: antes de usar cámara o GPS se revisan y solicitan los permisos. Si se niegan, la app explica para qué se necesitan y ofrece reintentar o abrir la configuración.

Nitidez: la técnica para comprobar la nitidez antes de aceptar la foto (R7) no se definió en la reunión; se documentará en un ADR posterior.

#### Consecuencias

Beneficios: fotos confiables y livianas; ubicación visible para el veedor antes de guardar.

Obligaciones: manejar los estados de error de cámara, permisos y GPS.

Limitaciones: sin galería, si la cámara falla no se puede registrar la foto.

Riesgo: dentro de edificios el GPS puede tardar o ser poco preciso.

#### Verificación

En un celular Android real: negar el permiso de cámara muestra el mensaje y la opción de reintentar; con el GPS apagado aparece un error; el botón Guardar sigue desactivado sin ubicación; el acta guardada contiene latitud, longitud y la ruta de la foto.

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar opciones de captura de foto, manejo de permisos y obtención de GPS.

Respuesta sugerida: solo cámara con calidad intermedia y GPS capturado automáticamente al tomar la foto.

Aceptación/rechazo: se aceptó solo cámara; se rechazó el GPS automático y el equipo decidió usar un botón para la ubicación.

Verificación humana: [completar]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se propuso permitir la galería y calidad alta; se discutió GPS automático frente a GPS con botón.

Acuerdo final: solo cámara por confiabilidad, calidad intermedia como punto medio, y ubicación con botón sin permitir guardar el acta sin ella. La técnica de nitidez queda pendiente.

Minuto del video: [mm:ss]
