
# Makerslab Backend API

> **Proyecto Educativo de Electrónica y Robótica**

Makerslab es un proyecto educativo sin fines de lucro diseñado para facilitar el aprendizaje de electrónica, robótica y programación en escuelas y centros educativos. Este backend proporciona la infraestructura necesaria para que estudiantes y profesores puedan controlar interfaces con Arduino y ESP32 desde una aplicación móvil desarrollada en Flutter.

## 🎯 Misión

Democratizar el acceso a la educación en electrónica y robótica, brindando herramientas accesibles y soporte remoto para estudiantes y educadores. Buscamos llevar esta tecnología a más escuelas y fortalecer las clases de robótica en instituciones educativas.

## 🚀 Características Principales

- **Gestión de Usuarios:** Sistema completo de registro y autenticación para estudiantes y profesores
- **Soporte Remoto:** Chat integrado con IA para brindar ayuda técnica en tiempo real a los usuarios
- **Módulos Educativos:** Sistema de módulos adicionales para expandir las capacidades de aprendizaje
- **Control de Dispositivos:** API para comunicación con Arduino y ESP32 desde la app móvil
- **Gestión de Permisos:** Sistema de roles y permisos para diferentes tipos de usuarios (estudiantes, profesores, administradores)
- **Recursos Educativos:** Endpoints para catálogos de componentes, tutoriales y proyectos

## 💡 Casos de Uso

- Clases de robótica en escuelas primarias y secundarias
- Talleres de electrónica y programación
- Proyectos STEM (Ciencia, Tecnología, Ingeniería y Matemáticas)
- Aprendizaje autónomo con soporte remoto
- Prácticas de laboratorio de electrónica

## 🛠️ Tecnologías Utilizadas

- **Node.js:** Entorno de ejecución para JavaScript en el servidor
- **Express.js:** Framework web minimalista y flexible para Node.js
- **MongoDB:** Base de datos NoSQL para almacenar información de usuarios y proyectos
- **Mongoose:** ODM (Object Data Modeling) para MongoDB
- **JWT:** Autenticación y autorización basada en tokens
- **OpenAI API:** Integración de inteligencia artificial para el sistema de ayuda
- **Twilio:** Servicio de mensajería para notificaciones
- **Cloudinary:** Almacenamiento en la nube para recursos educativos e imágenes
- **Socket.io / WebSockets:** Comunicación en tiempo real para chat de soporte
- **Helmet:** Seguridad HTTP headers
- **Express Rate Limit:** Protección contra ataques de fuerza bruta
- **Nodemon:** Reinicio automático durante el desarrollo

## 🎓 Patrocinio y Colaboración

**Makerslab es un proyecto sin fines de lucro** que busca activamente patrocinadores y colaboradores para:

- Llevar la plataforma a más escuelas y centros educativos
- Desarrollar nuevos módulos educativos
- Proporcionar kits de Arduino/ESP32 a estudiantes con recursos limitados
- Organizar talleres y capacitaciones para profesores
- Traducir la plataforma a múltiples idiomas

**¿Interesado en colaborar?** Contáctanos para conocer las diferentes formas de apoyar este proyecto educativo.

## 📋 API Endpoints

### Endpoints Públicos
- `GET /health` - Estado del servidor
- `GET /health/ready` - Verificación de servicios (DB, etc.)
- `GET /info` - Información de la aplicación

### Autenticación
- `POST /auth/login` - Inicio de sesión
- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/google` - Autenticación con Google

### Gestión de Usuarios
- `GET /api/users` - Lista de usuarios
- `GET /api/users/:id` - Usuario específico
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Chat y Soporte
- `POST /api/chat` - Enviar mensaje al sistema de ayuda con IA
- `GET /api/chat/:userId` - Historial de conversaciones

### Módulos Educativos
- `GET /api/modules` - Módulos disponibles
- `GET /api/modules/:id` - Detalles de un módulo

### Catálogos
- `GET /api/catalogs` - Catálogos de componentes y recursos educativos

## 📦 Prerrequisitos

Asegúrate de tener instalados:

- **Node.js:** Versión 16 o superior - [https://nodejs.org/](https://nodejs.org/)
- **npm o yarn:** Gestor de paquetes
- **MongoDB:** Base de datos local o cuenta en MongoDB Atlas
- **Git:** Para control de versiones

### Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/makerslab

# JWT
SECRET_JWT_SEED=tu_clave_secreta_super_segura

# OpenAI (para el chat de ayuda)
OPENAI_API_KEY=tu_api_key_de_openai

# Cloudinary (para almacenamiento de archivos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Twilio (opcional - para notificaciones)
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=tu_numero_twilio

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# Google Auth (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_SECRET_ID=tu_google_secret
```

## 🚀 Instalación

1. **Clonar el Repositorio:**
   ```bash
   git clone https://github.com/DavidFlores79/makerslab-backend.git
   cd makerslab-backend
   ```

2. **Instalar Dependencias:**
   ```bash
   npm install
   # o si prefieres yarn
   yarn install
   ```

3. **Configurar Variables de Entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Edita el archivo `.env` con tus credenciales y configuraciones

   ```bash
   cp .env.example .env
   ```

4. **Iniciar MongoDB:**
   - Si usas MongoDB local:
     ```bash
     mongod
     ```
   - Si usas MongoDB Atlas, asegúrate de tener la URI correcta en tu archivo `.env`

5. **Ejecutar la Aplicación:**
   
   **Modo Desarrollo:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   
   **Modo Producción:**
   ```bash
   npm start
   # o
   yarn start
   ```

6. **Verificar que funciona:**
   
   Abre tu navegador o usa curl/Postman:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/info
   ```

   La API estará disponible en [http://localhost:3000](http://localhost:3000) (o el puerto configurado en `.env`).

## 📁 Estructura de Carpetas

```
makerslab-backend/
├── controllers/          # Lógica de negocio de las rutas
│   ├── auth.controller.js
│   ├── users.controller.js
│   ├── chat.controller.js
│   ├── modules.controller.js
│   └── ...
├── models/              # Modelos de base de datos (Mongoose)
│   ├── user.model.js
│   ├── conversation.model.js
│   ├── module.model.js
│   └── server.js
├── routes/              # Definición de endpoints
│   ├── auth.routes.js
│   ├── users.routes.js
│   ├── chat.routes.js
│   ├── health.routes.js
│   └── ...
├── middlewares/         # Middleware de Express
│   ├── validar-jwt.middleware.js
│   ├── validator.middleware.js
│   └── rateLimitterMiddleware.js
├── helpers/             # Funciones auxiliares
│   ├── jwt.helper.js
│   ├── email-notifications.helper.js
│   └── ...
├── services/            # Servicios externos
│   ├── openAIService.js
│   ├── twilioService.js
│   └── emailService.js
├── database/            # Configuración de base de datos
│   └── config.js
├── config/              # Configuraciones generales
│   └── constants.js
├── validators/          # Validadores de entrada
├── public/              # Archivos estáticos
├── uploads/             # Archivos subidos por usuarios
├── logs/                # Logs de la aplicación
├── .env                 # Variables de entorno (no incluido en repo)
├── .env.example         # Ejemplo de variables de entorno
├── app.js               # Punto de entrada
└── package.json         # Dependencias del proyecto
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Este es un proyecto educativo de código abierto y apreciamos cualquier ayuda para mejorarlo.

### Cómo Contribuir

1. **Fork el repositorio**
2. **Crea una rama para tu funcionalidad:**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Realiza tus cambios y commits:**
   ```bash
   git commit -m "Añade nueva funcionalidad para X"
   ```
4. **Push a tu rama:**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Abre un Pull Request**

### Áreas donde Puedes Ayudar

- 📝 Documentación y tutoriales
- 🐛 Reportar y corregir bugs
- ✨ Nuevas funcionalidades educativas
- 🌍 Traducciones a otros idiomas
- 🧪 Pruebas unitarias y de integración
- 🎨 Mejoras en la arquitectura del código
- 📚 Ejemplos de proyectos con Arduino/ESP32

### Código de Conducta

Este es un proyecto educativo. Mantengamos un ambiente respetuoso, inclusivo y enfocado en el aprendizaje.

## 🚀 Deployment

### Render Deployment

Esta aplicación está lista para ser desplegada en Render. Consulta la guía detallada: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

**Pasos rápidos:**
1. Haz push de tu código a GitHub/GitLab
2. Crea un nuevo Blueprint en Render usando el archivo `render.yaml`
3. Configura tus variables de entorno (especialmente `MONGODB_URI`, `OPENAI_API_KEY`)
4. ¡Despliega!

**Base de datos:** Recomendamos usar [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (tier gratuito disponible).

### Otras Opciones de Deployment

- **Heroku:** Compatible con Heroku (requiere Procfile)
- **Railway:** Despliegue directo desde GitHub
- **DigitalOcean App Platform:** Soporte nativo para Node.js
- **AWS/Azure/GCP:** Para despliegues más robustos

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Test de conexión a MongoDB
npm run test-mongo

# Verificar deployment
npm run check-deploy
```

## 📖 Recursos Educativos

- [Documentación de Arduino](https://www.arduino.cc/reference/en/)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [Flutter Documentation](https://flutter.dev/docs)
- [Tutoriales de Robótica](https://www.example.com) *(Por definir)*

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia, por favor:

1. Verifica que no exista un issue similar
2. Abre un nuevo issue con una descripción detallada
3. Incluye pasos para reproducir el problema
4. Adjunta capturas de pantalla si es relevante

## 📄 Licencia

Este proyecto está bajo Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

**Nota:** Este es un proyecto educativo sin fines de lucro. Todo el código está disponible gratuitamente para instituciones educativas.

## 👥 Equipo

- **Proyecto:** Makerslab (nombre en proceso)
- **Objetivo:** Educación en electrónica y robótica
- **Target:** Escuelas, centros educativos, clases de robótica

## 📞 Contacto

¿Interesado en patrocinar o colaborar con Makerslab?

- 📧 Email: [contacto@makerslab.edu](#) *(Por definir)*
- 🌐 Website: [www.makerslab.edu](#) *(En desarrollo)*
- 💬 Discord: [Comunidad Makerslab](#) *(Por crear)*

---

**Hecho con ❤️ para la educación en STEM**
