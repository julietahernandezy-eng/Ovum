# Product Requirement Document (PRD) — OVUM PWA

## 1. Resumen Ejecutivo y Visión
- **Producto**: OVUM PWA (Progressive Web App).
- **Rol**: Obra Núcleo del Ecosistema Transmedia de Salud Menstrual, Autoconocimiento y Bienestar.
- **Público Objetivo**: Personas menstruantes desde los 12 años en adelante (estudiantes escolares y universitarias: arquetipos Juliana, Sofía, Mariana), con extensión pedagógica a entornos no menstruantes.
- **Formato Técnico**: Progressive Web App (PWA) instalable (Add to Home Screen), offline-first para registro diario y lectura, adaptable a móviles Android/iOS y web.

---

## 2. Desglose de Módulos Funcionales

### Módulo 1: Autenticación (Login / Registro) y Perfil Cíclico
- **Formulario de Registro (Register)**: Solicita `Nombre`, `Apellido`, `Edad`, `Correo electrónico` y `Crear contraseña`.
- **Inicio de Sesión (Login)**: Acceso mediante `Correo electrónico` y `Contraseña`, con cambio fluido entre Login y Registro.
- **Calibración del Ciclo**: Fecha de última menstruación, duración media y regularidad (soporte para ciclos irregulares / SOP).
- **Modo de Privacidad y Almacenamiento Seguro**: Cierre de sesión y borrado total de datos (Habeas Data).

### Módulo 2: Home & Dashboard Cíclico
- Saludo empático y contextualizado por fase (Menstrual, Folicular, Ovulatoria, Lútea).
- Widget circular visual del estado y fase del ciclo menstrual.
- Accesos rápidos: Registrar día, Foro, Talleres, PQR.
- Sugerencia del día (receta, playlist, cápsula informativa).

### Módulo 3: Mi Ciclo (Tracking y Autoconocimiento)
- **Calendario Menstrual / Sintotérmico**: Visualización mensual codificada por colores con cálculo de fases e indicador visual (corazón) en los días con registro de actividad sexual.
- **Registro Diario (Logging)**: Síntomas físicos (cólicos, dolor de cabeza, hinchazón y opción "+ Otros" con entrada personalizada), nivel de flujo, estado anímico, energía, horas de descanso y pregunta "¿Tuviste relaciones sexuales hoy?" (respuesta Sí/No).
- **Recetario Cíclico**: Recetas antiinflamatorias y balance hormonal filtrables por fase e ingredientes.
- **Playlists por Fase**: Selecciones musicales integradas por estado energético.
- **Journaling Menstrual**: Bitácora privada diaria con prompts guiados de introspección.

### Módulo 4: Explora (Recursos Educativos)
- **Biblioteca de Artículos y Cápsulas**: Contenido verificado sin jerga médica compleja.
- **Recomendador de Podcasts**: Curaduría de episodios externos/locales.
- **Lector de Fanzine Digital**: Visualizador interactivo de fanzines ilustrados.
- **Directorio de Productos Sostenibles**: Guías de copas, discos, toallas de tela y marcas locales.

### Módulo 5: Comunidad ("Pensamientos Menstruantes" & Talleres)
- **Foro Comunitario**: Publicación de vivencias, dudas y reflexiones (anónimas o con alias) con hashtags temáticos.
- **Agenda de Talleres**: Cartelera de actividades presenciales/híbridas (Campus EAFIT, etc.) con reserva de cupo (RSVP).

### Módulo 6: Soporte y PQR
- Formulario de PQR (Sugerencia, Reclamo, Soporte).
- Preguntas Frecuentes (FAQ) y buzón de ideas para fanzines.
- Centro de Privacidad del Usuario: Opción directa para borrado total de historial y datos personales (Habeas Data).

---

## 3. Requerimientos Técnicos PWA (RNF & PWA Highlights)
- **PWA Manifest**: `ovum-manifest.json` con soporte `standalone`, iconos adaptativos y colores de tema acordes al bienestar cíclico.
- **Notificaciones Push PWA**: Alertas configurables (recordatorio previo al inicio del ciclo, recordatorio discreto para registro diario y aviso previo a talleres reservados).
- **Soporte de Ciclos Flexibles / Irregulares**: Algoritmo adaptable que permite registrar variaciones de duración, ciclos atípicos o condiciones como SOP sin forzar la ventana estándar de 28 días.
- **Privacidad y Borrado de Datos (Habeas Data)**: Control total sobre los datos de salud menstrual, permitiendo la eliminación inmediata de todo el historial y cuenta del usuario en un solo clic, además de almacenamiento seguro.
- **Rendimiento y Accesibilidad**: First Contentful Paint < 1.5s, cumplimiento WCAG AA para contrastes y tamaños táctiles mínimos (48x48px).
