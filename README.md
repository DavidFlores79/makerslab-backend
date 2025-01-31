
# API para el Congreso Promoción Salud - Facultad de Enfermería UADY

Este es el repositorio de la API backend para la plataforma de inscripción al Congreso Promoción Salud de la Facultad de Enfermería de la UADY.
Esta API provee los endpoints necesarios para gestionar usuarios, pagos, información del congreso y otros datos relevantes.

## Características Principales

- **Gestión de Usuarios:** Endpoints para la creación, lectura, actualización y eliminación de usuarios inscritos al congreso.
- **Gestión de Pagos:** Endpoints para procesar y verificar pagos de usuarios.
- **Información del Congreso:** Endpoints para obtener la información de los ponentes, bases del concurso y carteles subidos al sistema.
- **Autenticación y Autorización:** Mecanismos de seguridad para proteger los endpoints de la API (opcional).

## Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución para JavaScript en el servidor.
- **Express.js:** Framework web para NodeJS.
- **MongoDB:** Base de datos para almacenar la información.
- **Mongoose:** ORM para interactuar con la base de datos.
- **JWT:** Para autenticación y autorización (opcional).
- **Nodemon** Reinicio automático de la API cuando se detectan cambios en el código
- **Cloudinary** Para carga de imágenes y PDF, documentos que se muestran en el proyecto.

## Prerrequisitos

Asegúrate de tener instalados:

- **Node.js:** (Versión recomendada: 16+) [https://nodejs.org/](https://nodejs.org/)
- **npm:** Gestor de paquetes.
- **MongoDB:** Instancia de la base de datos configurada.

## Instalación

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/DavidFlores79/congreso-backend.git
   cd congreso-backend

2. **Instalar Dependencias:**
   ```bash
   npm install # o yarn install
   ```

3. **Configurar Variables de Entorno:**
   - Crea un archivo `.env` en la raíz del proyecto duplica el .env.example para referencia de las variables de entorno.
   - Define las variables de entorno necesarias (ejemplo: `PORT=3000`, `MONGODB_URI=mongodb://localhost:27017/congreso`).

4. **Ejecutar la Aplicación:**
   ```bash
   npm run dev # Para usar nodemon
   ```
   La API estará disponible en [http://localhost:3001](http://localhost:3001) (o el puerto que hayas configurado).

## Estructura de Carpetas

- `src`: Código fuente de la API.
  - `controllers`: Controladores para manejar la lógica de las rutas.
  - `models`: Modelos de la base de datos.
  - `routes`: Definición de las rutas de la API.
  - `middlewares`: Middlewares para el manejo de peticiones.
  - `config`: Configuraciones de la base de datos y la API.
- `package.json`: Archivo de configuración de Node.

## Contribución

Si deseas contribuir a este proyecto, por favor sigue los siguientes pasos:

1.  Haz un fork del repositorio.
2.  Crea una rama con un nombre descriptivo para tu contribución (`git checkout -b mi-nueva-caracteristica`).
3.  Realiza tus cambios y commits (asegúrate de seguir las convenciones del proyecto).
4.  Abre un Pull Request.

## Licencia

[Licencia: Privada]

**Recomendaciones Adicionales:**

*   **Versionado:** Utiliza un sistema de versionado (como Git flow) para gestionar las ramas de desarrollo y producción.
*   **Testing:** Incluye pruebas unitarias y de integración para ambos proyectos.
*   **Documentación:** Genera documentación de la API con herramientas como Swagger o Postman.
*   **Estilo de Código:** Usa un linter y un formatter (como ESLint, Prettier) para mantener un estilo de código consistente.
*   **Variables de Entorno:** Es muy importante usar variables de entorno para configurar diferentes valores (ejemplo: URLs de la API, credenciales de la base de datos).
