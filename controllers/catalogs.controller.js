const paymentMethodModel = require("../models/payment_method.model");
const paymentStatusModel = require("../models/payment_status.model");
const paymentModel = require("../models/payment.model");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const categoryModel = require("../models/category.model");
const { verifyToken } = require("../helpers/jwt.helper");
const { SUPER_ROLE, ADMIN_ROLE } = require("../config/constants");

const getPaymentMethods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = {
      deleted: false,
      status: true,
    };

    // Consulta para documentos
    const data = await paymentMethodModel
      .find(query)
      .limit(pageSize)
      .skip(skip)
      .populate("creator");

    // Consulta para total de documentos
    const totalItems = await paymentMethodModel.countDocuments(query);

    res.send({
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      data: data,
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener los registros" });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = {
      deleted: false,
      status: true,
    };

    // Consulta para documentos
    const data = await paymentStatusModel
      .find(query)
      .limit(pageSize)
      .skip(skip)
      .populate("creator");

    // Consulta para total de documentos
    const totalItems = await paymentStatusModel.countDocuments(query);

    res.send({
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      data: data,
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener los registros" });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = {
      deleted: false,
    };

    // Consulta para documentos
    const data = await userModel
      .find(query)
      .limit(pageSize)
      .skip(skip)
      .populate("role");

    // Filtra en memoria
    const dataFiltered = data.filter(  // Added 'const'
      (user) => user.role?.name !== SUPER_ROLE && user.role?.name !== ADMIN_ROLE
    );
    // Consulta para total de documentos
    const totalItems = dataFiltered.length;

    res.send({
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      data: dataFiltered,
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener registros" });
  }
};

const getRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = {
      deleted: false,
      status: true,
    };

    // Consulta para documentos
    const data = await roleModel.find(query).limit(pageSize).skip(skip);

    // Filtra en memoria
    const dataFiltered = data.filter((role) => role.name !== SUPER_ROLE); // Added 'const'
    // Consulta para total de documentos
    const totalItems = dataFiltered.length;

    res.send({
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      data: dataFiltered,
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener registros" });
  }
};

const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;

    // Query con filtros
    const query = {
      deleted: false,
    };

    // Consulta para documentos
    const data = await categoryModel.find(query).limit(pageSize).skip(skip);

    // Consulta para total de documentos
    const totalItems = data.length; // Fixed typo

    res.send({
      page: page,
      pageSize: pageSize,
      totalItems: totalItems,
      data: data,
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener registros" });
  }
};

const getUserDashboard = async (req, res) => {
  const { id } = req.params;

  try {
    // Query con filtros
    const query = {
      deleted: false,
      owner: id,
    };

    // Consulta para documentos
    const data = await paymentModel.find(query);

    const totalAmount = data.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    res.send({
      payments: {
        total: data.length,
        totalAmount: totalAmount,
      },
    });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener los registros" });
  }
};

const getUserInfo = async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta para documentos
    const data = await userModel.findById(id).populate("role");

    res.send({ data: data });
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener los registros" });
  }
};

module.exports = {
  getUsers,
  getRoles,
  getCategories,
  getPaymentMethods,
  getPaymentStatus,
  getUserDashboard,
  getUserInfo,
};
