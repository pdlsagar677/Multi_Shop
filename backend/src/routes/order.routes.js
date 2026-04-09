const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  createOrder,
  initiatePayment,
  verifyPayment,
  verifyKhaltiPayment,
  getOrderById,
  cancelCustomerOrder,
} = require("../controllers/order.controller");

// Strict rate limit for public payment verification endpoints
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: "Too many payment verification attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public — payment gateway redirects here after payment
router.get("/payment/verify", paymentLimiter, verifyPayment);
router.get("/payment/khalti-verify", paymentLimiter, verifyKhaltiPayment);

// Protected routes
router.use(protect);

const createOrderValidation = [
  body("customer.firstName").trim().notEmpty().withMessage("First name is required"),
  body("customer.lastName").trim().notEmpty().withMessage("Last name is required"),
  body("customer.email").trim().isEmail().withMessage("Valid email is required"),
  body("customer.phone").trim().notEmpty().withMessage("Phone is required"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("paymentMethod").optional().isIn(["esewa", "khalti", "cod"]).withMessage("Invalid payment method"),
];

router.post("/", createOrderValidation, validateRequest, createOrder);
router.post("/:orderId/pay", initiatePayment);
router.get("/:orderId", getOrderById);
router.delete("/:orderId", cancelCustomerOrder);

module.exports = router;
