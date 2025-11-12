const bcryptjs = require("bcryptjs");
const { googleVerifyToken } = require("../helpers/google-auth.helper");
const { generateJWT } = require("../helpers/jwt.helper");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const {
  sendNotificationEmail,
} = require("../helpers/email-notifications.helper");
const { sendOtp } = require("../services/twilioService");

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await userModel
      .findOne({ email })
      .populate("role", ["id", "name"]);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.status) {
      return res.status(401).send({
        message: "Your Account is blocked",
      });
    }

    // Check password
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).send({
        message: "Invalid Credentials",
      });
    }

    // Generate JWT token
    const jwt = await generateJWT(user);

    console.log("User logged in:", user.name);

    res.json({
      message: "Logged in successfully",
      data: user,
      jwt,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

// Login with phone number
const loginWithPhoneNumber = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ phone, deleted: false });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.status) {
      return res.status(401).send({
        message: "Your Account is blocked",
      });
    }

    // // Fetch settings to get OTP expiration time
    // // const settings = await Settings.findOne({ status: true, deleted: false });
    // let otpExpirationSeconds = 300; // Default to 5 minutes (300 seconds)

    // // if (settings && typeof settings.otpExpirationTime === 'number' && settings.otpExpirationTime > 0) {
    // //     otpExpirationSeconds = settings.otpExpirationTime * 60; // Convert minutes to seconds
    // // }

    // // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const otpExpiresAt = new Date(Date.now() + otpExpirationSeconds * 1000);

    // // Save OTP to user document
    // user.phoneVerificationCode = otp;
    // user.phoneVerificationCodeExpiresAt = otpExpiresAt;
    // await user.save();

    // // Send OTP via Twilio
    // await sendOtp(user.phone, otp);

    // res.json({
    //   message: 'OTP sent successfully',
    // });
    // Check password
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).send({
        message: "Invalid Credentials",
      });
    }

    // Generate JWT token
    const jwt = await generateJWT(user);

    console.log("User logged in:", user.name ? user.name : user.phone);

    res.json({
      message: "Logged in successfully",
      data: user,
      jwt,
    });
  } catch (error) {
    console.error("Error logging in with phone number:", error);
    res.status(500).json({ message: "Failed to login with phone number" });
  }
};

//send otp (forgot password)
const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log("Forgot password request for phone:", phone);

    // Check if user exists
    const user = await userModel.findOne({ phone, deleted: false });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.status) {
      return res.status(401).send({
        message: "Your Account is blocked",
      });
    }

    //TODO: Create a PasswordResetRequest record to manage resetRequestIds and expiration

    // Fetch settings to get OTP expiration time
    // const settings = await Settings.findOne({ status: true, deleted: false });
    let otpExpirationSeconds = 300; // Default to 5 minutes (300 seconds)

    // if (settings && typeof settings.otpExpirationTime === 'number' && settings.otpExpirationTime > 0) {
    //     otpExpirationSeconds = settings.otpExpirationTime * 60; // Convert minutes to seconds
    // }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + otpExpirationSeconds * 1000);

    // Save OTP to user document
    user.phoneVerificationCode = otp;
    user.phoneVerificationCodeExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via Twilio
    await sendOtp(user.phone, otp);

    res.json({
      resetRequestId: user._id,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error logging in with phone number:", error);
    res.status(500).json({ message: "Failed to login with phone number" });
  }
};

// Verify phone number
const verifyPhoneNumber = async (req, res) => {
  try {
    const { resetRequestId, otp } = req.body;

    // Check if user exists
    const user = await userModel
      .findById(resetRequestId)
      .populate("role", ["id", "name"]);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP is correct
    if (user.phoneVerificationCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > user.phoneVerificationCodeExpiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Generate JWT token
    const jwt = await generateJWT(user);

    // Clear OTP fields
    user.phoneVerificationCode = undefined;
    user.phoneVerificationCodeExpiresAt = undefined;
    await user.save();

    res.json({
      message: "Logged in successfully",
      data: user,
      jwt,
    });
  } catch (error) {
    console.error("Error verifying phone number:", error);
    res.status(500).json({ message: "Failed to verify phone number" });
  }
};

//resend otp code
const resendOtp = async (req, res) => {
  try {
    const { resetRequestId } = req.body;

    // Check if user exists
    const user = await userModel.findById(resetRequestId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.status) {
      return res.status(401).send({
        message: "Your Account is blocked",
      });
    }

    // Fetch settings to get OTP expiration time
    // const settings = await Settings.findOne({ status: true, deleted: false });
    let otpExpirationSeconds = 300; // Default to 5 minutes (300 seconds)

    // if (settings && typeof settings.otpExpirationTime === 'number' && settings.otpExpirationTime > 0) {
    //     otpExpirationSeconds = settings.otpExpirationTime * 60; // Convert minutes to seconds
    // }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + otpExpirationSeconds * 1000);

    // Save new OTP to user document
    user.phoneVerificationCode = otp;
    user.phoneVerificationCodeExpiresAt = otpExpiresAt;
    await user.save();

    // Send new OTP via Twilio
    await sendOtp(user.phone, otp);

    res.json({
      resetRequestId: user._id,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

//change password
const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by ID
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
};

const register = async (req, res) => {
  const { name, email, phone, password, image } = req.body;
  let { role } = req.body;

  try {
    if (!role) {
      const userRole = await roleModel.findOne({ name: "USER_ROLE" });
      if (!userRole)
        throw {
          status: 404,
          message: "No se encontró el rol para dar de alta al usuario",
        };
      role = userRole._id;
    }

    const recordExist = await userModel.findOne({ phone, status: true });
    if (recordExist)
      throw { status: 400, message: "El registro está duplicado" };

    const data = new userModel({
      name,
      email,
      phone,
      password,
      role,
    });

    if (image != "") {
      data.image = image;
    }

    //encriptar la contraseña
    const salt = bcrypt.genSaltSync();
    data.password = bcrypt.hashSync(password, salt);

    //guardar en la BD
    await data.save();
    
    //populate role after saving
    await data.populate("role", ["id", "name"]);

    //generar el JWT
    const jwt = await generateJWT(data);

    sendNotificationEmail(
      "NUEVO USUARIO",
      `Se ha creado al usuario ${data.name} con perfil ${data.role.name}.`
    );

    res.status(201).send({
      message: "Registered successfully",
      data: data,
      jwt,
    });
  } catch (error) {
    console.error("Error al registrar evento:", error);
    res.status(error.status || 500).send({
      message: error.message || "Error al guardar el registro",
    });
  }
};

const googleSignIn = async (req, res) => {
  const { id_token } = req.body;

  try {
    const { name, image, email } = await googleVerifyToken(id_token);

    const user = await userModel.findOne({ email }).populate("role");

    if (!user) {
      const data = {
        name,
        email,
        image,
        password: ":PPPPP",
        google: true,
      };

      console.log(data);

      const newUser = new userModel(data);
      await newUser.save();
      res.send({
        msg: "Google SignIn Correcto. Usuario creado",
        newUser,
      });
    }

    if (!user.status) {
      res.status(401).send({
        msg: "Usuario Bloqueado, favor de validar",
      });
    }

    //guardar en la BD
    const userUpdated = await userModel.findOneAndUpdate(
      { email },
      { name, email, image },
      {
        new: true,
      }
    );

    //generar el JWT
    const jwt = await generateJWT(userUpdated);
    console.log(
      `${userUpdated.name} se ha logueado correctamente con Google SignIn!`
    );

    res.send({
      msg: "login correcto",
      user,
      jwt,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      msg: "Error en Google SignIn!",
      error: error,
    });
  }
};

module.exports = {
  login,
  register,
  googleSignIn,
  loginWithPhoneNumber,
  verifyPhoneNumber,
  forgotPassword,
  resendOtp,
  changePassword,
};
