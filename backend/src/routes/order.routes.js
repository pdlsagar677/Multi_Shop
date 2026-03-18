const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createOrder,
  initiatePayment,
  verifyPayment,
  getOrderById,
  cancelCustomerOrder,
} = require("../controllers/order.controller");

// Public — eSewa redirects here after payment
router.get("/payment/verify", verifyPayment);

// Protected routes
router.use(protect);

router.post("/", createOrder);
router.post("/:orderId/pay", initiatePayment);
router.get("/:orderId", getOrderById);
router.delete("/:orderId", cancelCustomerOrder);

module.exports = router;
