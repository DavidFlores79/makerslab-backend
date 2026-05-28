const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const { isAdminRole } = require('../middlewares/admin-auth.middleware');
const { sendOtp } = require('../services/twilioService');

const getLogin = (req, res) => {
  if (req.session && req.session.adminUser) return res.redirect('/admin/users');
  res.render('admin/login', { error: null });
};

const postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('admin/login', { error: errors.array()[0].msg });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), deleted: false })
      .select('+password')
      .populate('role');

    if (!user || !user.status) {
      return res.render('admin/login', { error: 'Credenciales inválidas.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.render('admin/login', { error: 'Credenciales inválidas.' });
    }

    if (!isAdminRole(user.role.name)) {
      return res.render('admin/login', { error: 'Acceso denegado: permisos insuficientes.' });
    }

    req.session.adminUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role.name,
    };
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr);
        return res.render('admin/login', { error: 'Error de sesión, intenta de nuevo.' });
      }
      res.redirect('/admin/users');
    });
  } catch (e) {
    console.error('Admin login error:', e);
    res.render('admin/login', { error: 'Error del servidor.' });
  }
};

const postLogout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};

const getDashboard = (req, res) => res.redirect('/admin/users');

const getUsersList = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.page_size) || 20));
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * pageSize;

    const query = { deleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, totalItems, roles] = await Promise.all([
      User.find(query).populate('role').skip(skip).limit(pageSize).sort({ createdAt: -1 }),
      User.countDocuments(query),
      Role.find({ deleted: false, status: true }),
    ]);

    const totalPages = Math.ceil(totalItems / pageSize);

    res.render('admin/users/index', {
      users,
      roles,
      page,
      pageSize,
      totalItems,
      totalPages,
      search,
      adminUser: req.session.adminUser,
      msg: req.query.msg || null,
    });
  } catch (e) {
    console.error('Admin getUsersList error:', e);
    res.redirect('/admin/users?msg=Error+del+servidor');
  }
};

const getUserDetail = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/users?msg=ID+inválido');

  try {
    const [user, roles] = await Promise.all([
      User.findOne({ _id: id, deleted: false }).populate('role'),
      Role.find({ deleted: false, status: true }),
    ]);

    if (!user) return res.redirect('/admin/users?msg=Usuario+no+encontrado');

    res.render('admin/users/detail', {
      user,
      roles,
      adminUser: req.session.adminUser,
      msg: req.query.msg || null,
    });
  } catch (e) {
    console.error('Admin getUserDetail error:', e);
    res.redirect('/admin/users?msg=Error+del+servidor');
  }
};

const postToggleUserStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/users?msg=ID+inválido');

  try {
    await User.findByIdAndUpdate(id, [{ $set: { status: { $not: '$status' } } }]);
    res.redirect(`/admin/users/${id}?msg=Estado+actualizado`);
  } catch (e) {
    console.error('Admin toggleStatus error:', e);
    res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postDeleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/users?msg=ID+inválido');

  if (id === req.session.adminUser.id) {
    return res.redirect(`/admin/users/${id}?msg=No+puedes+eliminarte+a+ti+mismo`);
  }

  try {
    await User.findByIdAndUpdate(id, { deleted: true, status: false });
    res.redirect('/admin/users?msg=Usuario+eliminado');
  } catch (e) {
    console.error('Admin deleteUser error:', e);
    res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postChangeUserRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(roleId)) {
    return res.redirect(`/admin/users/${id}?msg=ID+inválido`);
  }

  try {
    const role = await Role.findOne({ _id: roleId, deleted: false, status: true });
    if (!role) return res.redirect(`/admin/users/${id}?msg=Rol+no+encontrado`);

    await User.findByIdAndUpdate(id, { role: roleId });
    res.redirect(`/admin/users/${id}?msg=Rol+actualizado`);
  } catch (e) {
    console.error('Admin changeRole error:', e);
    res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postResetPassword = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/users?msg=ID+inválido');

  try {
    const user = await User.findOne({ _id: id, deleted: false }).select('+password');
    if (!user) return res.redirect('/admin/users?msg=Usuario+no+encontrado');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(otp, salt);
    user.phoneVerificationCode = otp;
    user.phoneVerificationCodeExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const notifications = [];
    if (user.phone) notifications.push(sendOtp(user.phone, otp));

    await Promise.allSettled(notifications);

    res.redirect(`/admin/users/${id}?msg=Contraseña+restablecida+y+enviada+por+SMS`);
  } catch (e) {
    console.error('Admin resetPassword error:', e);
    res.redirect(`/admin/users/${id}?msg=Error+al+restablecer+contraseña`);
  }
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getDashboard,
  getUsersList,
  getUserDetail,
  postToggleUserStatus,
  postDeleteUser,
  postChangeUserRole,
  postResetPassword,
};
