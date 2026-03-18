const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { getCustomerOrders } = require("../controllers/order.controller");

router.use(protect);

// GET /api/customer/orders
router.get("/orders", getCustomerOrders);

module.exports = router;
