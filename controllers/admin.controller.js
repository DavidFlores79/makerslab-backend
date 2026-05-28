const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Module = require('../models/module.model');
const UserModuleAccess = require('../models/user_module_access.model');
const { isAdminRole } = require('../middlewares/admin-auth.middleware');

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
  if (!mongoose.isValidObjectId(id)) {
    if (req.accepts('json')) return res.status(400).json({ error: 'ID inválido' });
    return res.redirect('/admin/users?msg=ID+inválido');
  }

  try {
    const [user, roles, privateModules, userAccess] = await Promise.all([
      User.findOne({ _id: id, deleted: false }).populate('role'),
      Role.find({ deleted: false, status: true }),
      Module.find({ deleted: false, status: true, isPublic: false }),
      UserModuleAccess.find({ user: id, deleted: false }),
    ]);

    if (!user) {
      if (req.accepts('json')) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.redirect('/admin/users?msg=Usuario+no+encontrado');
    }

    if (req.accepts('json')) return res.json({ user, roles, privateModules, userAccess });

    res.render('admin/users/detail', {
      user,
      roles,
      privateModules,
      userAccess,
      adminUser: req.session.adminUser,
      msg: req.query.msg || null,
    });
  } catch (e) {
    console.error('Admin getUserDetail error:', e);
    if (req.accepts('json')) return res.status(500).json({ error: 'Error del servidor' });
    res.redirect('/admin/users?msg=Error+del+servidor');
  }
};

const isAjax = (req) => req.headers['x-requested-with'] === 'XMLHttpRequest';

const ajaxOk = (res, msg) => res.json({ ok: true, msg });
const ajaxErr = (res, msg, status = 400) => res.status(status).json({ ok: false, msg });

const postToggleUserStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect('/admin/users?msg=ID+inválido');
  }
  try {
    await User.findByIdAndUpdate(id, [{ $set: { status: { $not: '$status' } } }]);
    return isAjax(req) ? ajaxOk(res, 'Estado actualizado') : res.redirect(`/admin/users/${id}?msg=Estado+actualizado`);
  } catch (e) {
    console.error('Admin toggleStatus error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postDeleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect('/admin/users?msg=ID+inválido');
  }
  if (id === req.session.adminUser.id) {
    return isAjax(req) ? ajaxErr(res, 'No puedes eliminarte a ti mismo') : res.redirect(`/admin/users/${id}?msg=No+puedes+eliminarte+a+ti+mismo`);
  }
  try {
    await User.findByIdAndUpdate(id, { deleted: true, status: false });
    return isAjax(req) ? ajaxOk(res, 'Usuario eliminado') : res.redirect('/admin/users?msg=Usuario+eliminado');
  } catch (e) {
    console.error('Admin deleteUser error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postChangeUserRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(roleId)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect(`/admin/users/${id}?msg=ID+inválido`);
  }
  try {
    const role = await Role.findOne({ _id: roleId, deleted: false, status: true });
    if (!role) return isAjax(req) ? ajaxErr(res, 'Rol no encontrado') : res.redirect(`/admin/users/${id}?msg=Rol+no+encontrado`);
    await User.findByIdAndUpdate(id, { role: roleId });
    return isAjax(req) ? ajaxOk(res, 'Rol actualizado') : res.redirect(`/admin/users/${id}?msg=Rol+actualizado`);
  } catch (e) {
    console.error('Admin changeRole error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postResetPassword = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect('/admin/users?msg=ID+inválido');
  }
  const { newPassword } = req.body;
  if (!newPassword || newPassword.trim().length < 6) {
    return isAjax(req) ? ajaxErr(res, 'La contraseña debe tener al menos 6 caracteres') : res.redirect(`/admin/users/${id}?msg=La+contraseña+debe+tener+al+menos+6+caracteres`);
  }
  try {
    const user = await User.findOne({ _id: id, deleted: false }).select('+password');
    if (!user) return isAjax(req) ? ajaxErr(res, 'Usuario no encontrado', 404) : res.redirect('/admin/users?msg=Usuario+no+encontrado');
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(newPassword.trim(), salt);
    await user.save();
    return isAjax(req) ? ajaxOk(res, 'Contraseña actualizada correctamente') : res.redirect(`/admin/users/${id}?msg=Contraseña+actualizada+correctamente`);
  } catch (e) {
    console.error('Admin resetPassword error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+al+restablecer+contraseña`);
  }
};

const postUpdateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect('/admin/users?msg=ID+inválido');
  }
  const { name, email, phone } = req.body;
  const update = {};
  if (name && name.trim()) update.name = name.trim();
  if (email && email.trim()) update.email = email.trim().toLowerCase();
  if (phone && phone.trim()) update.phone = phone.trim();
  try {
    await User.findByIdAndUpdate(id, update);
    return isAjax(req) ? ajaxOk(res, 'Usuario actualizado') : res.redirect(`/admin/users/${id}?msg=Usuario+actualizado`);
  } catch (e) {
    console.error('Admin updateUser error:', e);
    const msg = e.code === 11000 ? 'Email o teléfono ya en uso' : 'Error del servidor';
    return isAjax(req) ? ajaxErr(res, msg, 400) : res.redirect(`/admin/users/${id}?msg=${encodeURIComponent(msg)}`);
  }
};

const postAssignModule = async (req, res) => {
  const { id, moduleId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(moduleId)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect(`/admin/users/${id}?msg=ID+inválido`);
  }
  try {
    const mod = await Module.findOne({ _id: moduleId, deleted: false, status: true, isPublic: false });
    if (!mod) return isAjax(req) ? ajaxErr(res, 'Módulo no encontrado', 404) : res.redirect(`/admin/users/${id}?msg=Módulo+no+encontrado`);
    await UserModuleAccess.findOneAndUpdate(
      { user: id, module: moduleId },
      { user: id, module: moduleId, status: 'active', grantType: 'assigned', grantedAt: new Date(), expiresAt: null, deleted: false, grantedBy: req.session.adminUser.id },
      { upsert: true, new: true }
    );
    return isAjax(req) ? ajaxOk(res, 'Módulo asignado') : res.redirect(`/admin/users/${id}?msg=Módulo+asignado`);
  } catch (e) {
    console.error('Admin assignModule error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const postRevokeModule = async (req, res) => {
  const { id, moduleId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(moduleId)) {
    return isAjax(req) ? ajaxErr(res, 'ID inválido') : res.redirect(`/admin/users/${id}?msg=ID+inválido`);
  }
  try {
    await UserModuleAccess.findOneAndUpdate(
      { user: id, module: moduleId },
      { status: 'revoked', deleted: true }
    );
    return isAjax(req) ? ajaxOk(res, 'Módulo revocado') : res.redirect(`/admin/users/${id}?msg=Módulo+revocado`);
  } catch (e) {
    console.error('Admin revokeModule error:', e);
    return isAjax(req) ? ajaxErr(res, 'Error del servidor', 500) : res.redirect(`/admin/users/${id}?msg=Error+del+servidor`);
  }
};

const getModulesList = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = 20;
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * pageSize;

    const query = { deleted: false };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { route: { $regex: search, $options: 'i' } },
      ];
    }

    const [modules, totalItems] = await Promise.all([
      Module.find(query).skip(skip).limit(pageSize).sort({ priority: -1, createdAt: -1 }),
      Module.countDocuments(query),
    ]);

    res.render('admin/modules/index', {
      modules,
      page,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      search,
      adminUser: req.session.adminUser,
      msg: req.query.msg || null,
    });
  } catch (e) {
    console.error('Admin getModulesList error:', e);
    res.redirect('/admin/modules?msg=Error+del+servidor');
  }
};

const getModuleForm = async (req, res) => {
  const { id } = req.params;
  try {
    const module = id ? await Module.findOne({ _id: id, deleted: false }) : null;
    if (id && !module) return res.redirect('/admin/modules?msg=Módulo+no+encontrado');

    res.render('admin/modules/form', {
      module,
      adminUser: req.session.adminUser,
      msg: req.query.msg || null,
    });
  } catch (e) {
    console.error('Admin getModuleForm error:', e);
    res.redirect('/admin/modules?msg=Error+del+servidor');
  }
};

const postCreateModule = async (req, res) => {
  const { title, description, route, colorHex, imageUrl, assetPath, isPublic, isStatic, priority } = req.body;

  try {
    await Module.create({
      title: title.trim(),
      description: (description || '').trim(),
      route: route.trim().toLowerCase(),
      colorHex: colorHex || '#EEEEEE',
      imageUrl: imageUrl || undefined,
      assetPath: assetPath || undefined,
      isPublic: isPublic === 'true',
      isStatic: isStatic === 'on',
      priority: parseInt(priority) || 0,
    });
    res.redirect('/admin/modules?msg=Módulo+creado');
  } catch (e) {
    console.error('Admin createModule error:', e);
    const msg = e.code === 11000 ? 'La+ruta+ya+existe' : 'Error+del+servidor';
    res.redirect('/admin/modules/new?msg=' + msg);
  }
};

const postUpdateModule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/modules?msg=ID+inválido');

  const { title, description, route, colorHex, imageUrl, assetPath, isPublic, isStatic, priority } = req.body;

  try {
    await Module.findByIdAndUpdate(id, {
      title: title.trim(),
      description: (description || '').trim(),
      route: route.trim().toLowerCase(),
      colorHex: colorHex || '#EEEEEE',
      imageUrl: imageUrl || undefined,
      assetPath: assetPath || undefined,
      isPublic: isPublic === 'true',
      isStatic: isStatic === 'on',
      priority: parseInt(priority) || 0,
    });
    res.redirect('/admin/modules/' + id + '/edit?msg=Módulo+actualizado');
  } catch (e) {
    console.error('Admin updateModule error:', e);
    const msg = e.code === 11000 ? 'La+ruta+ya+existe' : 'Error+del+servidor';
    res.redirect('/admin/modules/' + id + '/edit?msg=' + msg);
  }
};

const postToggleModuleStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/modules?msg=ID+inválido');

  try {
    await Module.findByIdAndUpdate(id, [{ $set: { status: { $not: '$status' } } }]);
    res.redirect('/admin/modules?msg=Estado+actualizado');
  } catch (e) {
    console.error('Admin toggleModuleStatus error:', e);
    res.redirect('/admin/modules?msg=Error+del+servidor');
  }
};

const postDeleteModule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.redirect('/admin/modules?msg=ID+inválido');

  try {
    await Module.findByIdAndUpdate(id, { deleted: true, status: false });
    res.redirect('/admin/modules?msg=Módulo+eliminado');
  } catch (e) {
    console.error('Admin deleteModule error:', e);
    res.redirect('/admin/modules?msg=Error+del+servidor');
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
  postUpdateUser,
  postAssignModule,
  postRevokeModule,
  getModulesList,
  getModuleForm,
  postCreateModule,
  postUpdateModule,
  postToggleModuleStatus,
  postDeleteModule,
};
