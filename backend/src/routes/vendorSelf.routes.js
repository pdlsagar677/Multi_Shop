const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor.model");
const { protect, restrictTo } = require("../middleware/auth.middleware");

// All routes — vendor only
router.use(protect);
router.use(restrictTo("vendor"));

// ─────────────────────────────────────────
// @route   GET /api/vendor/store
// @desc    Get vendor's own store info + theme
// @access  Private (vendor only)
// ─────────────────────────────────────────
router.get("/store", async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    res.status(200).json({ success: true, store: vendor });
  } catch (err) {
    next(err);
  }
});

// ─── Order management ───
const {
  getVendorOrders,
  updateOrderStatus,
  updatePaymentSettings,
} = require("../controllers/order.controller");

router.get("/orders", getVendorOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.patch("/payment-settings", updatePaymentSettings);

// ─── Customer management ───
const {
  getVendorCustomers,
  getVendorCustomerById,
  updateVendorCustomer,
  deleteVendorCustomer,
} = require("../controllers/vendorCustomer.controller");

router.get("/customers", getVendorCustomers);
router.get("/customers/:id", getVendorCustomerById);
router.put("/customers/:id", updateVendorCustomer);
router.delete("/customers/:id", deleteVendorCustomer);

module.exports = router;