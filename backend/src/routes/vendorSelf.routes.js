const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor.model");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../utils/cloudinary");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");

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

// ─────────────────────────────────────────
// @route   PATCH /api/vendor/banner
// @desc    Upload, replace, or remove store banner
// @access  Private (vendor only)
// ─────────────────────────────────────────
router.patch("/banner", upload.single("banner"), async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ ownerId: req.user.userId });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    // Upload or replace banner
    if (req.file) {
      // Delete old banner from Cloudinary if exists
      if (vendor.branding.storeBanner) {
        const oldId = getPublicIdFromUrl(vendor.branding.storeBanner);
        if (oldId) await deleteFromCloudinary(oldId);
      }
      const result = await uploadToCloudinary(
        req.file.buffer,
        `multi-tenant/${vendor.subdomain}/branding`
      );
      vendor.branding.storeBanner = result.url;
      await vendor.save();
      return res.status(200).json({ success: true, storeBanner: result.url });
    }

    // Remove banner
    if (req.body.remove === "true") {
      if (vendor.branding.storeBanner) {
        const oldId = getPublicIdFromUrl(vendor.branding.storeBanner);
        if (oldId) await deleteFromCloudinary(oldId);
      }
      vendor.branding.storeBanner = null;
      await vendor.save();
      return res.status(200).json({ success: true, storeBanner: null });
    }

    return res.status(400).json({ success: false, message: "No file uploaded and no remove action specified." });
  } catch (err) {
    next(err);
  }
});

// ─── Order management ───
const {
  getVendorOrders,
  updateOrderStatus,
  updatePaymentSettings,
  updateKhaltiSettings,
} = require("../controllers/order.controller");

router.get("/orders", getVendorOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
const esewaSettingsValidation = [
  body("merchantCode").optional().trim().isString(),
  body("isEnabled").isBoolean().withMessage("isEnabled must be a boolean"),
  body("password").notEmpty().withMessage("Password is required"),
];
router.patch("/payment-settings", esewaSettingsValidation, validateRequest, updatePaymentSettings);

const khaltiSettingsValidation = [
  body("secretKey").optional().trim().isString(),
  body("isEnabled").isBoolean().withMessage("isEnabled must be a boolean"),
  body("password").notEmpty().withMessage("Password is required"),
];
router.patch("/khalti-settings", khaltiSettingsValidation, validateRequest, updateKhaltiSettings);

// ─── Customer management ───
const {
  getVendorCustomers,
  getVendorCustomerById,
  updateVendorCustomer,
  deleteVendorCustomer,
} = require("../controllers/vendorCustomer.controller");

router.get("/customers", getVendorCustomers);
router.get("/customers/:id", getVendorCustomerById);
const updateCustomerValidation = [
  body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("phone").optional().trim(),
  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];
router.put("/customers/:id", updateCustomerValidation, validateRequest, updateVendorCustomer);
router.delete("/customers/:id", deleteVendorCustomer);

module.exports = router;