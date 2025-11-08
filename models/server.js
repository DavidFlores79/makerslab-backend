const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { dbConnection } = require("../database/config");
const bodyParser = require("body-parser");
const rateLimiter = require("../middlewares/rateLimitterMiddleware");
const slowDown = require("express-slow-down");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const fs = require('fs');
const path = require('path');
const os = require('os');

require("dotenv").config();

const configurationRoutes = require("../routes/configuration.routes");
const catalogsRoutes = require("../routes/catalogs.routes");
const usersRoutes = require("../routes/users.routes");
const rolesRoutes = require("../routes/roles.routes");
const authRoutes = require("../routes/auth.routes");
const searchRoutes = require("../routes/search.routes");
const uploadRoutes = require("../routes/uploads.routes");
const modulesRoutes = require("../routes/modules.routes");
const permissionsRoutes = require("../routes/permissions.routes");
const modulePermissionRoleRoutes = require("../routes/module_permission_role.routes");
const paymentMethodRoutes = require("../routes/payment_methods.routes");
const paymentRoutes = require("../routes/payments.routes");
const paymentStatusRoutes = require("../routes/payment_statuses.routes");
const fileUpload = require("express-fileupload");
const emailRoutes = require("../routes/email.routes");
const chatRoutes = require("../routes/chat.routes");

// Ruta absoluta al directorio de logs
const logDirectory = path.join(__dirname, '../logs');

// Crear carpeta si no existe
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Crear stream para guardar los logs
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' } // 'a' = append
);

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    
    //conectar a DB
    this.conectarDB();

    //middlewares
    this.middlewares();

    //rutas de mi aplicacion
    this.routes();
  }

  middlewares() {
    //directorio public
    this.app.use(express.static("public"))
    this.app.use(helmet());
    this.app.use(compression());
    // this.app.use(
    //   morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
    // );
    this.app.use(
      morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream: accessLogStream })
    );
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(rateLimiter);

    // Slow-down para penalizar ráfagas
    const speed = slowDown({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
      delayAfter: Math.max(
        1,
        Math.floor(Number(process.env.RATE_LIMIT_MAX || 30) * 0.6)
      ), // empieza a penalizar al 60% de max
      delayMs: () => 500,
    });
    this.app.use(speed);

    // body parser con límites (usa express.json en lugar de duplicar bodyParser)
    this.app.use(express.json({ limit: "20mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "20mb" }));

    // sanitizers: evita Mongo query injection, XSS y param pollution
    this.app.use(mongoSanitize());
    this.app.use(xssClean());
    this.app.use(hpp());

    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: os.tmpdir(), // Cross-platform temp directory
        createParentPath: true,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
        abortOnLimit: true,
        debug: process.env.NODE_ENV !== "production", // Enable debug in dev
      })
    );
  }

  async conectarDB() {
    await dbConnection();
  }

  routes() {
    this.app.use("/api/configurations", configurationRoutes);
    this.app.use("/api/users", usersRoutes);
    this.app.use("/api/roles", rolesRoutes);
    this.app.use("/api/modules", modulesRoutes);
    this.app.use("/api/permissions", permissionsRoutes);
    this.app.use("/api/profiles", modulePermissionRoleRoutes);
    this.app.use("/auth", authRoutes);
    this.app.use("/api/search", searchRoutes);
    this.app.use("/api/upload", uploadRoutes);
    this.app.use("/api/payment-methods", paymentMethodRoutes);
    this.app.use("/api/payments", paymentRoutes);
    this.app.use("/api/payment-statuses", paymentStatusRoutes);
    this.app.use("/api/email", emailRoutes);
    this.app.use("/api/chat", chatRoutes);

    // catalogos
    this.app.use("/api/catalogs", catalogsRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`API lista en el puerto ${this.port}`);
    });
  }
}

module.exports = Server;
