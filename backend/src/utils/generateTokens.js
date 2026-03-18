const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId || null,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const setTokenCookies = (res, accessToken) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/",
    ...(isProd && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    maxAge: 15 * 60 * 1000,
  });
};

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const generateTempPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  generateOTP,
  generateTempPassword,
};