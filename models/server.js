const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");
const bodyParser = require("body-parser");
require('dotenv').config()

const catalogsRoutes = require("../routes/catalogs.routes");
const usersRoutes = require("../routes/users.routes");
const rolesRoutes = require("../routes/roles.routes");
const categoriesRoutes = require("../routes/categories.routes");
const productsRoutes = require("../routes/products.routes");
const postersRoutes = require("../routes/posters.routes");
const userPosterRoutes = require("../routes/userposter.routes");
const authRoutes = require("../routes/auth.routes");
const searchRoutes = require("../routes/search.routes");
const uploadRoutes = require("../routes/uploads.routes");
const modulesRoutes = require("../routes/modules.routes");
const permissionsRoutes = require("../routes/permissions.routes");
const modulePermissionRoleRoutes = require("../routes/module_permission_role.routes");
const paymentMethodRoutes = require("../routes/payment_methods.routes");
const paymentRoutes = require("../routes/payments.routes");
const summaryRoutes = require("../routes/summaries.routes");
const summaryStatusRoutes = require("../routes/summary_statuses.routes");
const paymentStatusRoutes = require("../routes/payment_statuses.routes");
const occupationRoutes = require("../routes/occupations.routes");
const eventParticipantRoutes = require("../routes/event_participants.routes");
const eventParticipationModeRoutes = require("../routes/event_participation_modes.routes");
const stateRoutes = require("../routes/states.routes");
const fileUpload = require("express-fileupload");
const emailRoutes = require("../routes/email.routes");

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
    this.app.use(express.static("public"));

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      bodyParser.json({
        limit: "20mb",
      })
    );
    this.app.use(
      bodyParser.urlencoded({
        limit: "20mb",
        extended: true,
      })
    );

    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
        createParentPath: true
      })
    );
  }

  async conectarDB() {
    await dbConnection();
  }

  routes() {
    this.app.use("/api/users", usersRoutes);
    this.app.use("/api/roles", rolesRoutes);
    this.app.use("/api/categories", categoriesRoutes);
    this.app.use("/api/products", productsRoutes);
    this.app.use("/api/posters", postersRoutes);
    this.app.use("/api/myposter", userPosterRoutes);
    this.app.use("/api/modules", modulesRoutes);
    this.app.use("/api/permissions", permissionsRoutes);
    this.app.use("/api/profiles", modulePermissionRoleRoutes);
    this.app.use("/auth", authRoutes);
    this.app.use("/api/search", searchRoutes);
    this.app.use("/api/upload", uploadRoutes);
    this.app.use("/api/payment-methods", paymentMethodRoutes);
    this.app.use("/api/payments", paymentRoutes);
    this.app.use("/api/payment-statuses", paymentStatusRoutes);
    this.app.use("/api/summaries", summaryRoutes);
    this.app.use("/api/summary-statuses", summaryStatusRoutes);
    this.app.use("/api/occupations", occupationRoutes);
    this.app.use("/api/event-participants", eventParticipantRoutes);
    this.app.use("/api/event-participation-modes", eventParticipationModeRoutes);
    this.app.use("/api/states", stateRoutes);
    this.app.use("/api/email", emailRoutes);

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
