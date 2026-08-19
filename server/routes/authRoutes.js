const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getProfile,
  selectRestaurant,
} = require("../controllers/authController");
const router = express.Router();

/* Normal Signup */
router.post("/signup", signup);
/* Select Restaurant - Customer */
router.post(
  "/select-restaurant",
  protect,
  selectRestaurant
);
/* Normal Login */
router.post("/login", login);

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getProfile
);

/* Forgot Password */
router.post("/forgot-password", forgotPassword);

/* Verify OTP */
router.post("/verify-otp", verifyOtp);

/* Reset Password */
router.post("/reset-password", resetPassword);

/* Google Login */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* Google Callback */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/signup",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.redirect(
        `http://localhost:5173/google-success?token=${token}`
      );
    } catch (error) {
      console.error(error);

      res.redirect(
        "http://localhost:5173/signup?error=google"
      );
    }
  }
);

module.exports = router;
