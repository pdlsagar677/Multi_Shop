const express = require("express");
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  logout,
  changePassword,
  getMe,
  updateProfile,
  deleteAccount,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");

// ─────────────────────────────────────────
// Validation rules
// ─────────────────────────────────────────
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage("Please enter a valid phone number"),
  body("age")
    .optional()
    .isInt({ min: 13, max: 120 }).withMessage("Age must be between 13 and 120"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

const otpValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("otp")
    .notEmpty().withMessage("OTP is required")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const changePasswordValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
];

// ─────────────────────────────────────────
// Routes
// ─────────────────────────────────────────

// Public routes
router.post("/register", registerValidation, validateRequest, register);
router.post("/verify-otp", otpValidation, validateRequest, verifyOTP);
router.post("/resend-otp", body("userId").notEmpty(), validateRequest, resendOTP);
router.post("/login", loginValidation, validateRequest, login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/change-password", changePasswordValidation, validateRequest, changePassword);

// Private routes (requires valid access token)
router.get("/me", protect, getMe);

const profileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s\-]{7,15}$/).withMessage("Please enter a valid phone number"),
  body("age")
    .optional()
    .isInt({ min: 13, max: 120 }).withMessage("Age must be between 13 and 120"),
];

router.put("/profile", protect, profileValidation, validateRequest, updateProfile);
router.delete("/account", protect, [
  body("password").notEmpty().withMessage("Password is required"),
], validateRequest, deleteAccount);

module.exports = router;