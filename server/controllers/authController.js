const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

// =========================
// ROLE NORMALIZATION
// =========================
const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  const roleMap = {
    "kitchen staff": "kitchen",
    kitchen: "kitchen",
    "waiter staff": "waiter",
    waiter: "waiter",
    manager: "manager",
    owner: "owner",
    customer: "customer",
  };

  return roleMap[value] || value;
};

// =========================
// CREATE TOKEN
// =========================
const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: normalizeRole(user.role),
      restaurantId: user.restaurantId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// =========================
// EMAIL TRANSPORTER
// =========================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("EMAIL CONNECTION ERROR:", error.message);
  } else {
    console.log("EMAIL SERVER READY");
  }
});

// =========================
// SIGNUP
// =========================
exports.signup = async (req, res) => {
  try {
    const {
      fullName,
      restaurantName,
      restaurantType,
      email,
      phone,
      password,
      role,
    } = req.body;

    const normalizedRole = normalizeRole(role);

    if (!fullName || !email || !password || !normalizedRole) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    if (!["owner", "customer"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid signup role",
      });
    }

    if (
      normalizedRole === "owner" &&
      (!restaurantName?.trim() || !restaurantType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name and type are required for owners",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      restaurantName:
        normalizedRole === "owner"
          ? restaurantName.trim()
          : "",
      restaurantType:
        normalizedRole === "owner"
          ? restaurantType
          : "",
      email: cleanEmail,
      phone: phone?.trim() || "",
      password: hashedPassword,
      role: normalizedRole,
    });

    if (normalizedRole === "owner") {
      const baseSlug = restaurantName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      let slug = baseSlug || `restaurant-${Date.now()}`;
      let counter = 1;

      while (await Restaurant.findOne({ slug })) {
        slug = `${baseSlug || "restaurant"}-${counter}`;
        counter++;
      }

      const restaurant = await Restaurant.create({
        ownerId: user._id,
        name: restaurantName.trim(),
        slug,
        type: restaurantType,
        phone: phone?.trim() || "",
      });

      user.restaurantId = restaurant._id;
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: normalizeRole(user.role),
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Role selected on login screen
    const selectedRole = normalizeRole(role);

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Actual role stored in database
    const accountRole = normalizeRole(user.role);

    // IMPORTANT:
    // Login role MUST match database role.
    if (accountRole !== selectedRole) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as ${accountRole}. Please select the correct role.`,
      });
    }

    // Keep database role canonical
    if (user.role !== accountRole) {
      user.role = accountRole;
      await user.save();
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google login. Please continue with Google.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Token contains the REAL database role
    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: normalizeRole(user.role),
        restaurantId: user.restaurantId,
        restaurantName: user.restaurantName,
        restaurantType: user.restaurantType,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// =========================
// SEND FORGOT PASSWORD OTP
// =========================
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    const mailInfo = await transporter.sendMail({
      from: `"RestroSphere" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "RestroSphere Password Reset OTP",
      text: `Your RestroSphere password reset OTP is ${otp}. It expires in 10 minutes.`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#ff6500">RestroSphere</h2>

          <p>Use this OTP to reset your password:</p>

          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0">
            ${otp}
          </div>

          <p>This OTP expires in <b>10 minutes</b>.</p>

          <p>
            If you did not request this, you can ignore this email.
          </p>
        </div>
      `,
    });

    console.log(
      "MAIL SENT:",
      mailInfo.messageId
    );

    console.log(
      "ACCEPTED:",
      mailInfo.accepted
    );

    console.log(
      "REJECTED:",
      mailInfo.rejected
    );

    return res.json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send OTP. Check email configuration.",
    });
  }
};

// =========================
// VERIFY OTP
// =========================
exports.verifyOtp = async (req, res) => {
  try {
    const email =
      req.body.email?.trim().toLowerCase();

    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "VERIFY OTP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while verifying OTP",
    });
  }
};

// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const email =
      req.body.email?.trim().toLowerCase();

    const otp = req.body.otp?.trim();

    const newPassword =
      req.body.newPassword;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (
      !user.resetOtpExpires ||
      user.resetOtpExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    user.resetOtp = "";
    user.resetOtpExpires = null;

    await user.save();

    return res.json({
      success: true,
      message:
        "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error(
      "RESET PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while resetting password",
    });
  }
};

// =========================
// GET PROFILE
// =========================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select(
      "_id fullName email role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: normalizeRole(user.role),
      },
    });
  } catch (error) {
    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching profile",
    });
  }
};

// =========================
// SELECT RESTAURANT FOR CUSTOMER
// =========================
exports.selectRestaurant = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      normalizeRole(req.user.role) !==
        "customer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: restaurantId,
        isActive: true,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message:
          "Restaurant not found or inactive",
      });
    }

    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    user.restaurantId = restaurant._id;
    user.restaurantName = restaurant.name;
    user.restaurantType = restaurant.type;

    await user.save();

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message:
        "Restaurant selected successfully",

      token,

      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        type: restaurant.type,
        logo: restaurant.logo,
      },
    });
  } catch (error) {
    console.error(
      "SELECT RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to select restaurant",
    });
  }
};