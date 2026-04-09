const crypto = require("crypto");
const User = require("../models/User.model");
const Vendor = require("../models/Vendor.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  generateOTP,
} = require("../utils/generateTokens");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/sendEmail");

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public (customers only)
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, age } = req.body;

    // Customers can only register on a storefront subdomain
    if (!req.vendor) {
      return res.status(400).json({
        success: false,
        message: "Customer registration is only available on a store subdomain.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Generate OTP + expiry (10 mins)
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Create customer user scoped to vendor
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null,
      age: age || null,
      role: "customer",
      vendorId: req.vendor._id,
      isVerified: false,
      verificationToken: otp,
      verificationTokenExpiry: otpExpiry,
    });

    // Send verification email with vendor branding
    await sendVerificationEmail({ name, email, otp, vendor: req.vendor });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP.",
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────
const verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // Fetch user with hidden fields
    const user = await User.findById(userId).select(
      "+verificationToken +verificationTokenExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    // Check OTP match
    if (user.verificationToken !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/resend-otp
// @access  Public
// ─────────────────────────────────────────
const resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select(
      "+verificationToken +verificationTokenExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail({ name: user.name, email: user.email, otp, vendor: req.vendor });

    res.status(200).json({
      success: true,
      message: "New OTP sent to your email.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public (all roles)
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password field
    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated. Contact support." });
    }

    // ── Domain-context login enforcement ──
    if (req.vendor) {
      if (user.role === "superadmin") {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
      if (user.role === "vendor" && String(req.vendor.ownerId) !== String(user._id)) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
      if (user.role === "customer" && String(user.vendorId) !== String(req.vendor._id)) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
    } else {
      if (user.role !== "superadmin") {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
    }

    // Customer must verify email first
    if (user.role === "customer" && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        userId: user._id,
      });
    }

    // Vendor must change password on first login
    if (user.role === "vendor" && user.isFirstLogin) {
      // Clear any existing token cookie (e.g. from a previous superadmin session)
      const isProdEnv = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProdEnv,
        sameSite: isProdEnv ? "strict" : "lax",
        path: "/",
        ...(isProdEnv && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      });
      return res.status(403).json({
        success: false,
        message: "Please change your temporary password before logging in.",
        userId: user._id,
        requiresPasswordChange: true,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Refresh token saved in DB only — never sent to browser
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // ✅ Only access token goes to browser cookie
    setTokenCookies(res, accessToken);

    // Build user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      vendorId: user.vendorId,
    };

    // Include vendor store info if vendor
    if (user.role === "vendor" && user.vendorId) {
      const vendorStore = await Vendor.findById(user.vendorId).select("subdomain storeName theme");
      if (vendorStore) {
        userResponse.vendor = {
          subdomain: vendorStore.subdomain,
          storeName: vendorStore.storeName,
          theme: vendorStore.theme,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/refresh
// @access  Public (called silently by frontend)
// ─────────────────────────────────────────
const refreshAccessToken = async (req, res, next) => {
  try {
    // Read the expired access token from cookie
    const expiredToken = req.cookies.accessToken;

    if (!expiredToken) {
      return res.status(401).json({ success: false, message: "No token found" });
    }

    // Decode without verifying expiry to get userId
    let decoded;
    try {
      decoded = jwt.verify(expiredToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      // If expired, decode payload without verification
      if (err.name === "TokenExpiredError") {
        decoded = jwt.decode(expiredToken);
      } else {
        return res.status(401).json({ success: false, message: "Invalid token" });
      }
    }

    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    // Find user and get their refresh token from DB
    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || !user.refreshToken) {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    // Verify the DB refresh token is still valid
    try {
      jwt.verify(user.refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      // Refresh token expired — force re-login
      user.refreshToken = null;
      await user.save();
      const isProdEnv = process.env.NODE_ENV === "production";
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProdEnv,
        sameSite: isProdEnv ? "strict" : "lax",
        path: "/",
        ...(isProdEnv && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
      });
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }

    // ✅ Rotate — generate new both tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token in DB only
    user.refreshToken = newRefreshToken;
    await user.save();

    // Send only new access token to browser
    setTokenCookies(res, newAccessToken);

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      // Find user by decoding token and clear refresh token from DB
      const decoded = jwt.decode(token);
      if (decoded?.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    }

    // Clear only access token cookie (must match options used in setTokenCookies)
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      ...(isProd && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/change-password
// @access  Private (vendor first login)
// ─────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Verify old password before allowing change
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      isFirstLogin: false,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully. You can now log in.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-refreshToken -verificationToken -verificationTokenExpiry"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = user.toObject();

    // If vendor, include their store info
    if (user.role === "vendor" && user.vendorId) {
      const vendor = await Vendor.findById(user.vendorId).select("subdomain storeName theme");
      if (vendor) {
        userData.vendor = {
          subdomain: vendor.subdomain,
          storeName: vendor.storeName,
          theme: vendor.theme,
        };
      }
    }

    res.status(200).json({ success: true, user: userData });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, age } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone || null;
    if (age !== undefined) updateFields.age = age || null;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateFields,
      { new: true, runValidators: true }
    ).select("-refreshToken -verificationToken -verificationTokenExpiry");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   DELETE /api/auth/account
// @access  Private
// ─────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.user.userId);

    // Clear access token cookie
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      path: "/",
      ...(isProd && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    });

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    // Build reset URL based on domain context
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    let resetUrl;
    if (req.vendor) {
      const baseDomain = process.env.CLIENT_BASE_DOMAIN || "localhost:3000";
      resetUrl = `${protocol}://${req.vendor.subdomain}.${baseDomain}/reset-password?token=${resetToken}`;
    } else {
      resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    }

    // Look up vendor for branding
    let vendor = req.vendor;
    if (!vendor && user.vendorId) {
      vendor = await Vendor.findById(user.vendorId);
    }

    await sendPasswordResetEmail({
      name: user.name,
      email: user.email,
      resetUrl,
      vendor,
    });

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token to match what's stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpiry");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new reset link.",
      });
    }

    // Update password and clear reset fields
    user.password = newPassword; // pre-save hook will hash it
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshAccessToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  deleteAccount,
};