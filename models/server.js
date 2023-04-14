const express = require("express");
const cors = require("cors");
const { dbConnection } = require("../database/config");
const bodyParser = require("body-parser");
require('dotenv').config()

const usersRoutes = require("../routes/users.routes");
const rolesRoutes = require("../routes/roles.routes");
const categoriesRoutes = require("../routes/categories.routes");
const productsRoutes = require("../routes/products.routes");
const authRoutes = require("../routes/auth.routes");
const searchRoutes = require("../routes/search.routes");
const uploadRoutes = require("../routes/uploads.routes");
const modulesRoutes = require("../routes/modules.routes");
const permissionsRoutes = require("../routes/permissions.routes");
const fileUpload = require("express-fileupload");

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
    this.app.use("/api/modules", modulesRoutes);
    this.app.use("/api/permissions", permissionsRoutes);
    this.app.use("/auth", authRoutes);
    this.app.use("/api/search", searchRoutes);
    this.app.use("/api/upload", uploadRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`API lista en el puerto ${this.port}`);
    });
  }
}

module.exports = Server;
