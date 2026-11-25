# Anexo de uso de inteligencia artificial

## Control Electoral

**Estudiante:** Josselyn Mabel Reyes Parrales

**Institución:** Escuela Politécnica Nacional (EPN)

**Escuela:** Escuela de Formación de Tecnólogos (ESFOT)

**Carrera:** Desarrollo de Software

**Asignatura:** Desarrollo de Aplicaciones Móviles

**Evaluación:** Examen práctico

**Modalidad:** Desarrollo individual

**Grupo:** 4

**Fecha:** 24 de noviembre de 2026

## 1. Introducción

Durante el desarrollo de la aplicación Control Electoral se utilizó inteligencia artificial como herramienta complementaria para fortalecer los conocimientos técnicos, resolver dudas de programación, analizar alternativas de implementación y solucionar problemas identificados durante el desarrollo.

El proyecto se desarrolló de manera incremental, considerando los requisitos establecidos en el examen y las decisiones arquitectónicas consensuadas por el equipo.

La asistencia de inteligencia artificial permitió complementar el proceso de aprendizaje y desarrollo, especialmente en temas relacionados con Ionic, Angular, Supabase, seguridad, validaciones e integración de funcionalidades nativas.

Las propuestas recibidas fueron evaluadas considerando las necesidades del sistema, su compatibilidad con las tecnologías seleccionadas y los resultados obtenidos durante las pruebas.

## 2. Herramientas utilizadas

| Herramienta | Finalidad |
|---|---|
| ChatGPT | Consultas técnicas, orientación durante la implementación, asistencia en programación, análisis de errores, optimización y documentación. |

Como herramientas complementarias de desarrollo y verificación se utilizaron Visual Studio Code, Supabase SQL Editor, Android Studio, Git, GitHub, Vitest y ESLint.

## 3. Metodología de trabajo

El desarrollo del proyecto se realizó mediante un proceso incremental, en el cual se implementaron y verificaron los diferentes módulos de la aplicación.

La metodología empleada comprendió las siguientes actividades:

1. Análisis de los requisitos funcionales y técnicos.
2. Revisión de las decisiones arquitectónicas establecidas en los ADR.
3. Organización de las funcionalidades por módulos.
4. Implementación de las funcionalidades del sistema.
5. Consultas técnicas a la inteligencia artificial cuando fue necesario.
6. Evaluación y adaptación de las soluciones propuestas.
7. Identificación y corrección de errores.
8. Ejecución de pruebas unitarias y funcionales.
9. Gestión de versiones mediante Git.
10. Verificación del funcionamiento en Android.

La inteligencia artificial se utilizó durante diferentes etapas del proceso, principalmente para resolver dificultades técnicas, comprender determinados mecanismos de implementación y mejorar la organización del proyecto.

## 4. Ejemplos de consultas realizadas

Los siguientes ejemplos representan consultas técnicas realizadas durante el desarrollo. Se presentan de manera resumida para facilitar su comprensión.

### 4.1. Arquitectura del proyecto

**Consulta:**

¿Cómo organizar un proyecto Ionic Angular siguiendo una arquitectura Clean-lite y respetando los ADR establecidos?

**Aporte de la IA:**

Orientación sobre la separación de responsabilidades entre dominio, aplicación, infraestructura y presentación.

**Aplicación en el proyecto:**

Se estableció una estructura organizada que permite separar los modelos, validadores, casos de uso, repositorios y componentes de interfaz.

**Verificación:**

Se revisó la estructura del proyecto y se comprobó su compatibilidad con la compilación de Angular.

**Archivos y directorios relacionados:**

- `src/app/core/domain/`
- `src/app/core/application/`
- `src/app/core/infrastructure/`
- `src/app/presentation/`

### 4.2. Autenticación mediante cédula

**Consulta:**

¿Cómo utilizar la cédula como identificador de acceso cuando Supabase Auth trabaja principalmente con correo electrónico y contraseña?

**Aporte de la IA:**

Explicación sobre el funcionamiento de Supabase Auth y orientación para utilizar una Edge Function como intermediaria en el proceso de autenticación.

**Aplicación en el proyecto:**

Se implementó un mecanismo de autenticación mediante cédula, manteniendo las operaciones administrativas en el servidor y utilizando sesiones de Supabase.

**Verificación:**

Se comprobó el inicio de sesión con los tres perfiles, la navegación según el rol y el cambio obligatorio de contraseña.

**Archivos relacionados:**

- `auth.service.ts`
- `login.page.ts`
- `cambiar-clave.page.ts`
- `rol.guard.ts`
- Edge Function `login-cedula`.

### 4.3. Validación de cédula ecuatoriana

**Consulta:**

¿Cómo funciona el algoritmo de validación de la cédula ecuatoriana y qué casos deberían considerarse en las pruebas unitarias?

**Aporte de la IA:**

Explicación del procedimiento matemático para comprobar el dígito verificador y orientación sobre posibles escenarios de validación.

**Aplicación en el proyecto:**

Se incorporó un validador en la capa de dominio y se integró con los formularios de creación de usuarios.

**Verificación:**

Se comprobaron casos válidos e inválidos, considerando longitud, caracteres permitidos, códigos de provincia y dígito verificador.

**Resultado:**

8 de 8 pruebas unitarias aprobadas.

**Archivos relacionados:**

- `cedula.validator.ts`
- `cedula-form.validator.ts`
- `cedula.validator.spec.ts`

### 4.4. Creación jerárquica de usuarios

**Consulta:**

¿Cómo gestionar la creación de usuarios según los roles del sistema sin exponer credenciales administrativas en la aplicación móvil?

**Aporte de la IA:**

Orientación sobre el uso de Edge Functions, validación de permisos y manejo de secretos en el servidor.

**Aplicación en el proyecto:**

Se implementó la creación jerárquica de usuarios, considerando las restricciones de cada perfil y la pertenencia a los recintos electorales.

**Verificación:**

Se realizaron pruebas de creación de cuentas, asignación de roles, recepción de correos e inicio de sesión.

**Archivos relacionados:**

- `crear-usuario.use-case.ts`
- `usuario.repository.ts`
- `supabase-usuario.repository.ts`
- Edge Function `crear-usuario`.

### 4.5. Registro y validación de votos

**Consulta:**

¿Qué mecanismos permiten garantizar que la suma de votos válidos, nulos y blancos coincida con el total de sufragantes?

**Aporte de la IA:**

Orientación sobre la validación de reglas de negocio tanto en el cliente como en el servidor y el uso de operaciones transaccionales en PostgreSQL.

**Aplicación en el proyecto:**

Se incorporaron validaciones de consistencia y mecanismos para registrar y corregir los resultados electorales.

**Verificación:**

Se realizaron pruebas con cantidades válidas, valores negativos, valores decimales, organizaciones duplicadas y totales inconsistentes.

**Resultado:**

7 de 7 pruebas unitarias aprobadas.

**Archivos relacionados:**

- `votos.validator.ts`
- `votos.validator.spec.ts`
- `registrar-acta.use-case.ts`
- `corregir-acta.use-case.ts`
- Funciones PostgreSQL `registrar_acta` y `corregir_acta`.

### 4.6. Cámara, GPS y validación de nitidez

**Consulta:**

¿Qué método puede utilizarse para determinar si una fotografía está borrosa antes de almacenarla?

**Aporte de la IA:**

Explicación del operador Laplaciano y su aplicación para estimar la nitidez de una imagen mediante el cálculo de la varianza.

También se realizaron consultas relacionadas con los permisos y el funcionamiento de los plugins nativos de Capacitor.

**Aplicación en el proyecto:**

Se integraron servicios independientes para la captura fotográfica y la obtención de coordenadas geográficas.

Se utilizó la varianza del Laplaciano con un umbral inicial de 100 para estimar la nitidez de las fotografías.

**Verificación:**

Se realizaron pruebas unitarias con diferentes características de imágenes y comprobaciones desde un dispositivo Android.

**Resultado:**

6 de 6 pruebas unitarias de nitidez aprobadas.

**Archivos relacionados:**

- `camara.service.ts`
- `geolocalizacion.service.ts`
- `nitidez.validator.ts`
- `nitidez.validator.spec.ts`
- `evidencias.page.ts`

### 4.7. Seguridad mediante RLS

**Consulta:**

¿Cómo comprobar que las políticas de seguridad de Supabase impiden que un veedor acceda a juntas que no tiene asignadas?

**Aporte de la IA:**

Orientación sobre el funcionamiento de Row Level Security y mecanismos para simular diferentes usuarios mediante consultas SQL.

**Aplicación en el proyecto:**

Se realizaron comprobaciones de las políticas de acceso utilizando los roles y las asignaciones existentes en la base de datos.

**Verificación:**

Se comprobó que:

- El coordinador provincial puede consultar los registros electorales.
- El coordinador de recinto no visualiza juntas ajenas.
- El veedor únicamente visualiza sus juntas asignadas.
- Un usuario anónimo no puede consultar las juntas.
- El registro de un acta no autorizada es rechazado.
- El veedor puede consultar sus fotografías autorizadas.

**Evidencia:**

Resultados obtenidos mediante Supabase SQL Editor.

La prueba específica de rechazo de fotografías ajenas queda pendiente de evidencia adicional.

### 4.8. Refactorización y organización del código

**Consulta:**

¿Cómo mejorar la separación entre las páginas de Ionic y las operaciones de acceso a Supabase?

**Aporte de la IA:**

Orientación sobre el patrón repositorio, los contratos de dominio y la distribución de responsabilidades mediante casos de uso.

**Aplicación en el proyecto:**

Se reorganizaron las operaciones principales mediante cuatro casos de uso y repositorios específicos para el acceso a datos.

**Verificación:**

Se comprobó la estructura final del proyecto, la compilación, el análisis estático y el funcionamiento de los módulos.

**Archivos relacionados:**

- `registrar-acta.use-case.ts`
- `corregir-acta.use-case.ts`
- `crear-usuario.use-case.ts`
- `asignar-veedor.use-case.ts`
- `core/infrastructure/repositories/`

### 4.9. Diseño de interfaz

**Consulta:**

¿Cómo mejorar la identidad visual de la aplicación utilizando una combinación de colores rosa y verde pastel sin afectar las funcionalidades existentes?

**Aporte de la IA:**

Sugerencias relacionadas con la paleta cromática, distribución visual, legibilidad, estilos de componentes y alternativas para el icono de la aplicación.

**Aplicación en el proyecto:**

Se seleccionó una identidad visual personalizada, utilizando tonalidades pastel y un icono representativo de una urna electoral.

Se priorizaron los cambios de presentación para conservar el comportamiento funcional del sistema.

**Verificación:**

Se comprobó la apariencia y el funcionamiento de la aplicación mediante el APK instalado en Android.

**Archivos relacionados:**

- `global.scss`
- `theme/variables.scss`
- Archivos `.page.scss`.
- Recursos gráficos de Android.

## 5. Resolución de problemas durante el desarrollo

Durante la implementación surgieron dificultades relacionadas con la configuración del entorno, la compatibilidad de las herramientas y el comportamiento de determinadas funcionalidades.

La inteligencia artificial se utilizó como apoyo para analizar las posibles causas y evaluar alternativas de solución.

| Problema identificado | Solución aplicada | Verificación |
|---|---|---|
| Orden de importaciones TypeScript | Organización de importaciones según las reglas del proyecto | ESLint |
| Métodos sin tipos de retorno explícitos | Incorporación de los tipos correspondientes | Análisis estático |
| Diferencias entre herramientas de pruebas | Utilización de Vitest, disponible en el proyecto | Pruebas unitarias |
| Longitud incorrecta del código de recuperación | Adaptación del formulario a ocho dígitos | Recuperación de contraseña |
| Problemas con el envío de correos | Revisión de la configuración y permisos de Brevo | Recepción del correo |
| Dependencia directa entre páginas y acceso a datos | Reorganización mediante repositorios | Pruebas funcionales |
| Problemas de legibilidad en Android | Ajuste de los estilos y del tema de la aplicación | Verificación visual |
| Configuración incorrecta de JAVA_HOME | Configuración del JDK de Android Studio | Generación del APK |

La resolución de estos problemas permitió comprender la importancia de verificar la compatibilidad de las soluciones con el entorno real de desarrollo.

## 6. Evaluación de alternativas y decisiones adoptadas

Las recomendaciones obtenidas mediante inteligencia artificial fueron consideradas como alternativas técnicas y evaluadas según los requisitos del proyecto.

### 6.1. Herramientas de pruebas unitarias

Se consideraron herramientas como Jasmine y Karma. Sin embargo, se decidió mantener Vitest debido a que ya se encontraba disponible en la configuración del proyecto.

Esta decisión permitió evitar dependencias adicionales y aprovechar las herramientas existentes.

### 6.2. Arquitectura de software

Se consideró una separación más estricta de las capas arquitectónicas.

Finalmente, se mantuvo el enfoque Clean-lite establecido en los ADR, incorporando casos de uso para las operaciones principales y repositorios concretos para las consultas auxiliares.

Esta decisión permitió mantener un equilibrio entre organización, mantenibilidad y complejidad.

### 6.3. Personalización de la interfaz

Se evaluó la posibilidad de realizar cambios estructurales en las pantallas durante la etapa final del desarrollo.

Se decidió priorizar los estilos visuales y conservar la lógica existente para reducir el riesgo de afectar funcionalidades previamente verificadas.

### 6.4. Funcionamiento offline

Se analizó la posibilidad de implementar almacenamiento local y sincronización automática.

Debido a que corresponde a un requisito opcional y considerando el tiempo disponible, se decidió priorizar la estabilidad de las funcionalidades obligatorias.

## 7. Verificación y resultados

Las soluciones incorporadas al proyecto fueron verificadas mediante pruebas unitarias, análisis estático, consultas SQL y comprobaciones funcionales.

### 7.1. Pruebas unitarias

Comando ejecutado:

```bash
npx ng test --watch=false
```

| Grupo de pruebas | Aprobadas |
|---|---:|
| Validación de cédula | 8 |
| Validación de votos | 7 |
| Validación de nitidez | 6 |
| Componente principal | 1 |
| Componente Home | 1 |
| Total | 23 |

Resultado obtenido:

```text
Test Files  5 passed (5)
Tests       23 passed (23)
Duration    10.64s
```

Las 23 pruebas unitarias finalizaron correctamente.

### 7.2. Análisis estático

Comando ejecutado:

```bash
npx eslint "src/app/**/*.ts"
```

La ejecución final no reportó errores ni advertencias en los archivos analizados.

### 7.3. Pruebas de seguridad

| Prueba | Resultado |
|---|---|
| Acceso del coordinador provincial | 6 recintos, 23 juntas y 2 actas |
| Acceso del coordinador de recinto | 8 juntas propias y 0 ajenas |
| Acceso del veedor | 1 junta asignada y 0 ajenas |
| Consulta de junta no asignada | 0 registros |
| Acceso anónimo | 0 registros |
| Registro de acta no autorizada | Permiso denegado |
| Consulta de fotografías autorizadas | 2 fotografías permitidas |

Los valores corresponden al estado de la base de datos durante la ejecución de las pruebas.

### 7.4. Pruebas funcionales en Android

Se generó e instaló el APK de la aplicación en un dispositivo Android.

Se realizaron comprobaciones funcionales de los tres perfiles de usuario, incluyendo autenticación, creación de cuentas, cambio de contraseña y operaciones relacionadas con la gestión electoral.

Como evidencia adicional, se grabó un video demostrativo del funcionamiento de la aplicación.

### 7.5. Compilación

Para verificar la generación del APK se utilizaron los siguientes comandos:

```powershell
ionic build
npx cap sync android
.\android\gradlew.bat -p android assembleDebug
```

Se obtuvo un APK funcional para Android.

## 8. Limitaciones del uso de inteligencia artificial

Durante el desarrollo se identificaron aspectos que requieren especial atención al utilizar herramientas de inteligencia artificial:

- Las recomendaciones pueden variar según las versiones de las tecnologías utilizadas.
- Las soluciones propuestas deben adaptarse a la estructura y necesidades particulares del proyecto.
- La compilación correcta no garantiza por sí sola el funcionamiento de todas las operaciones.
- Las recomendaciones de seguridad deben comprobarse directamente en el servidor.
- Los algoritmos de procesamiento de imágenes pueden requerir ajustes según las condiciones reales de captura.
- La documentación debe contrastarse con la implementación y los resultados obtenidos.
- Las pruebas realizadas no sustituyen una auditoría exhaustiva de seguridad.

Por estas razones, se consideró necesario complementar las consultas realizadas con verificaciones prácticas.

## 9. Participación individual y aprendizaje

El desarrollo individual comprendió actividades de análisis, configuración del entorno, implementación de funcionalidades, administración de la base de datos, integración de servicios, resolución de problemas y comprobación del funcionamiento de la aplicación.

La inteligencia artificial se utilizó como recurso complementario para aclarar conceptos, recibir asistencia en la programación, evaluar alternativas y resolver dificultades específicas.

Durante este proceso se fortalecieron conocimientos relacionados con:

- Desarrollo de aplicaciones móviles mediante Ionic y Angular.
- Organización de proyectos mediante arquitecturas por capas.
- Autenticación y autorización de usuarios.
- Administración de bases de datos relacionales.
- Políticas de seguridad Row Level Security.
- Integración de servicios externos mediante Edge Functions.
- Manejo de formularios reactivos y Signals.
- Validación de reglas de negocio.
- Utilización de cámara y geolocalización mediante Capacitor.
- Procesamiento básico de imágenes.
- Pruebas unitarias y funcionales.
- Control de versiones y generación de aplicaciones Android.

Las decisiones de implementación fueron evaluadas considerando los requisitos del examen, los ADR establecidos y el comportamiento observado durante las pruebas.

La responsabilidad sobre el funcionamiento, la comprensión del código y la defensa técnica del proyecto corresponde al estudiante.

## 10. Conclusión

El uso de inteligencia artificial constituyó un recurso complementario durante el desarrollo de Control Electoral, facilitando la comprensión de conceptos técnicos, el análisis de alternativas y la resolución de problemas.

Su utilización permitió fortalecer el proceso de aprendizaje y contribuir a la implementación de funcionalidades relacionadas con autenticación, seguridad, arquitectura, validación de datos e integración de recursos nativos.

La combinación de consultas técnicas, implementación práctica y ejecución de pruebas permitió obtener una aplicación móvil funcional que contempla los requisitos obligatorios del examen.

La experiencia también permitió reconocer la importancia de evaluar críticamente las recomendaciones tecnológicas y verificar su funcionamiento antes de incorporarlas de manera definitiva al proyecto.

## 11. Evidencias y referencias

- [Repositorio del proyecto en GitHub](https://github.com/josselynreyes-ux/Examen01_DesarrolloMovil)
- Decisiones arquitectónicas: `docs/adr/`.
- Documentación de pruebas: `docs/pruebas/`.
- Resultados de las 23 pruebas unitarias aprobadas.
- Resultados del análisis estático mediante ESLint.
- Evidencias de las pruebas de seguridad mediante RLS.
- Consultas técnicas realizadas mediante ChatGPT.
- [Video demostrativo individual](https://youtu.be/nPRdLNrNxls?si=QgxsH-znkpcd0Jca).
- APK Android generado.
