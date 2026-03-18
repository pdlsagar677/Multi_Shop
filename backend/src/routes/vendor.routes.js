const express = require("express");
const router = express.Router();
const {
  createVendor,
  getAllVendors,
  getVendorById,
  toggleVendorStatus,
  deleteVendor,
  getStoreBySubdomain,
} = require("../controllers/vendor.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");

// ─────────────────────────────────────────
// Public route — storefront subdomain lookup
// ─────────────────────────────────────────
router.get("/store/:subdomain", getStoreBySubdomain);

// ─────────────────────────────────────────
// All routes below — superadmin only
// ─────────────────────────────────────────
router.use(protect);
router.use(restrictTo("superadmin"));

const createVendorValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Vendor owner name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),
  body("storeName")
    .trim()
    .notEmpty().withMessage("Store name is required")
    .isLength({ min: 2 }).withMessage("Store name must be at least 2 characters"),
  body("subdomain")
    .trim()
    .notEmpty().withMessage("Subdomain is required")
    .matches(/^[a-z0-9-]+$/).withMessage("Subdomain can only contain lowercase letters, numbers and hyphens")
    .isLength({ min: 2, max: 30 }).withMessage("Subdomain must be 2-30 characters"),
  body("theme")
    .optional()
    .isIn(["sunrise","midnight","forest","ocean","rose","violet","coral","slate","candy","gold"])
    .withMessage("Invalid theme selected"),
  body("plan")
    .optional()
    .isIn(["basic", "pro", "premium"]).withMessage("Plan must be basic, pro or premium"),
];

router.post("/",        createVendorValidation, validateRequest, createVendor);
router.get("/",         getAllVendors);
router.get("/:id",      getVendorById);
router.patch("/:id/toggle", toggleVendorStatus);
router.delete("/:id",   deleteVendor);

module.exports = router;