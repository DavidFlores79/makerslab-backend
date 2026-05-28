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

const generateOtp = (phone) => {
  const mockPhone = process.env.MOCK_OTP_PHONE;
  const mockCode = process.env.MOCK_OTP_CODE;
  if (mockPhone && mockCode && phone === mockPhone) {
    console.log(`[DEV] Mock OTP for ${phone}: ${mockCode}`);
    return mockCode;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    const otp = generateOtp(user.phone);
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

//resend otp code (supports both password reset and registration)
const resendOtp = async (req, res) => {
  try {
    const { resetRequestId, registrationId } = req.body;
    const userId = resetRequestId || registrationId;

    if (!userId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // For password reset, check if account is blocked
    // For registration (status: false), allow resend
    if (resetRequestId && !user.status) {
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
    const otp = generateOtp(user.phone);
    const otpExpiresAt = new Date(Date.now() + otpExpirationSeconds * 1000);

    // Save new OTP to user document
    user.phoneVerificationCode = otp;
    user.phoneVerificationCodeExpiresAt = otpExpiresAt;
    await user.save();

    // Send new OTP via Twilio
    await sendOtp(user.phone, otp);

    const responseId = registrationId 
      ? { registrationId: user._id }
      : { resetRequestId: user._id };

    res.json({
      ...responseId,
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

    // Check if user already exists and is active
    const recordExist = await userModel.findOne({ phone, status: true, deleted: false });
    if (recordExist)
      throw { status: 400, message: "Este teléfono ya está registrado" };

    // Check if there's a pending registration (user exists but not verified)
    let data = await userModel.findOne({ phone, status: false, deleted: false });
    
    if (data) {
      // Update existing pending registration
      data.name = name;
      data.email = email;
      data.password = password;
      data.role = role;
      if (image != "") {
        data.image = image;
      }
    } else {
      // Create new user
      data = new userModel({
        name,
        email,
        phone,
        password,
        role,
        status: false, // User is not active until OTP verification
      });

      if (image != "") {
        data.image = image;
      }
    }

    // Encrypt password
    const salt = bcrypt.genSaltSync();
    data.password = bcrypt.hashSync(password, salt);

    // Generate OTP
    let otpExpirationSeconds = 300; // 5 minutes
    const otp = generateOtp(data.phone);
    const otpExpiresAt = new Date(Date.now() + otpExpirationSeconds * 1000);

    // Save OTP to user document
    data.phoneVerificationCode = otp;
    data.phoneVerificationCodeExpiresAt = otpExpiresAt;

    // Save to database
    await data.save();

    // Send OTP via Twilio
    await sendOtp(data.phone, otp);

    console.log(`Registration initiated for: ${data.phone}`);

    res.status(201).send({
      message: "OTP sent successfully. Please verify your phone number to complete registration.",
      registrationId: data._id,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(error.status || 500).send({
      message: error.message || "Error al guardar el registro",
    });
  }
};

// Verify OTP and complete registration
const verifyRegistrationOtp = async (req, res) => {
  try {
    const { registrationId, otp } = req.body;

    // Find user by ID
    const user = await userModel
      .findById(registrationId)
      .populate("role", ["id", "name"]);
    
    if (!user) {
      return res.status(400).json({ message: "Registration not found" });
    }

    // Check if user is already verified
    if (user.status) {
      return res.status(400).json({ message: "User already verified. Please login." });
    }

    // Check if OTP is correct
    if (user.phoneVerificationCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > user.phoneVerificationCodeExpiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Activate user and clear OTP fields
    user.status = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationCodeExpiresAt = undefined;
    await user.save();

    // Generate JWT token
    const jwt = await generateJWT(user);

    // Send notification email to admins
    sendNotificationEmail(
      "NUEVO USUARIO",
      `Se ha registrado al usuario ${user.name} con perfil ${user.role.name}.`
    );

    console.log(`User registered and verified: ${user.name} - ${user.phone}`);

    res.json({
      message: "Registration completed successfully",
      data: user,
      jwt,
    });
  } catch (error) {
    console.error("Error verifying registration OTP:", error);
    res.status(500).json({ message: "Failed to verify registration" });
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
  verifyRegistrationOtp,
  googleSignIn,
  loginWithPhoneNumber,
  verifyPhoneNumber,
  forgotPassword,
  resendOtp,
  changePassword,
};
