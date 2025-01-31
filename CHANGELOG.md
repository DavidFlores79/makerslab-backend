# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

Este proyecto se adhiere al Versionado Semántico.

## [Released]

## [v2.3.10] - 2025-01-30
### Added
- **Nuevas Tablas en la Base de Datos:**
    -  `payments`: Tabla para gestionar la información de los pagos.
    -  `payment_methods`: Tabla para almacenar los diferentes métodos de pago disponibles.
    -  `event_participants`: Tabla para almacenar información adicional de los participantes, incluyendo los datos migrados del antiguo formulario de Google.
    -  `ocupations`: Tabla para almacenar la información de las ocupaciones de los participantes.
    -  `states`: Tabla para almacenar los estados.
    -  `summaries`: Tabla para gestionar los resúmenes de proyectos de los participantes.

- **Nuevos CRUDs (Create, Read, Update, Delete):**
    -  CRUD para la tabla `payments`.
    -  CRUD para la tabla `payment_methods`.
    -  CRUD para la tabla `event_participants`.
     -  CRUD para la tabla `ocupations`.
    -  CRUD para la tabla `states`.
    -  CRUD para la tabla `summaries` con funcionalidades para que los jueces puedan revisar y aprobar los resúmenes.

### Changed
-  Ahora se recolectará más información del usuario y se llevará el control de los pagos, tendrá Area administrativa para el usuario donde podrá cargar sus resúmenes y ser evaluado por los administrativos o jueces.
    
### Deprecated
-  Ninguna funcionalidad fue deprecada

### Removed
-  Ninguna funcionalidad fue removida

### Fixed
-  Ningún error fue corregido hasta ahora

### Security
- Ninguna vulnerabilidad de seguridad

## [v2.0.0] - 2025-01-26
### Added
-  Cración de la nueva rama para la version 2 e Implementación de las nuevas tablas de la API
