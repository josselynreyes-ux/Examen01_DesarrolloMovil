# ADR-006: Validar formularios con Reactive Forms y validadores propios

#### Estado

Aceptado

#### Fecha

2026-11-22

#### Autor(es) y equipo

Grupo 4: Amy Mishell Díaz Rosero, Josselyn Mabel Reyes Parrales, Ariana Elizabeth Villota Jácome

#### Requisitos relacionados

R2: cédula ecuatoriana validada, nombres, apellidos, teléfono y correo.

R3: cambio obligatorio de contraseña.

R6: validar la consistencia de los totales del acta.

R9: estados explícitos de validación.

#### Contexto

La app tiene formularios con muchas reglas: cédula ecuatoriana, teléfono, correo, contraseñas y, sobre todo, el acta, donde los votos deben coincidir con el total de sufragantes. Las validaciones deben poder probarse. Criterios: soporte para validaciones propias, facilidad de pruebas y claridad de los errores para el usuario.

#### Alternativas consideradas

| Alternativa | Ventajas | Desventajas |
| --- | --- | --- |
| Reactive Forms | Validadores propios como funciones; fáciles de probar; buen control de formularios grandes | Más código en el componente |
| Template-driven forms (ngModel) | Rápidos para formularios pequeños | Validaciones propias más difíciles de escribir y probar |

#### Decisión

Se usan Reactive Forms con validadores en core/domain/validators/:

Cédula ecuatoriana: 10 dígitos, provincia entre 01 y 24 (o 30), tercer dígito menor que 6 y dígito verificador con el algoritmo módulo 10.

Acta: votos de las 5 organizaciones + nulos + blancos = total de sufragantes; ningún valor negativo.

Teléfono: 10 dígitos. Correo: formato válido.

Contraseña nueva: largo mínimo y confirmación igual.

Los errores se muestran debajo de cada campo y el botón de guardar se desactiva mientras el formulario no sea válido.

#### Consecuencias

Beneficios: reglas centralizadas y reutilizables, con evidencia en pruebas unitarias.

Obligaciones: mantener los validadores en una carpeta propia y probarlos.

Limitaciones: más código en cada componente de formulario.

Riesgo: un validador mal escrito podría rechazar cédulas válidas o aceptar actas inconsistentes.

#### Verificación

Pruebas unitarias con cédulas válidas, con dígito verificador incorrecto y con letras; un acta cuyos votos no suman el total no se puede guardar (ver ADR-010).

#### Uso de IA

Herramienta: Claude (Anthropic).

Consulta realizada: comparar Reactive Forms y Template-driven forms; describir el algoritmo de validación de cédula ecuatoriana.

Respuesta sugerida: Reactive Forms con validadores propios para cédula y suma de votos.

Aceptación/rechazo: aceptada.

Verificación humana: [completar; por ejemplo, probar el algoritmo con cédulas reales]

#### Trazabilidad

Commit del ADR: [enlace]

Commit de implementación: [enlace]

#### Consenso del equipo

Argumentos por integrante: Amy: [completar] · Josselyn: [completar] · Ariana: [completar]

Objeciones: se propusieron los Template-driven forms por ser más rápidos de escribir.

Acuerdo final: Reactive Forms, porque el formulario del acta tiene muchos campos y validaciones propias que deben probarse.

Minuto del video: [mm:ss]
