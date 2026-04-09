const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor.model");
const {
  getStoreProducts,
  getStoreProductById,
  getStoreFeaturedProducts,
  getStoreCategories,
  searchStoreProducts,
} = require("../controllers/product.controller");

// ─────────────────────────────────────────
// Middleware — resolve vendor from subdomain param
// ─────────────────────────────────────────
const resolveVendorBySubdomain = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ subdomain: req.params.subdomain, isActive: true });
    if (!vendor) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    req.vendor = vendor;
    next();
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
// Public routes — storefront product access
// ─────────────────────────────────────────
router.get("/store/:subdomain/categories",          resolveVendorBySubdomain, getStoreCategories);
router.get("/store/:subdomain/products/featured",   resolveVendorBySubdomain, getStoreFeaturedProducts);
router.get("/store/:subdomain/products/search",     resolveVendorBySubdomain, searchStoreProducts);
router.get("/store/:subdomain/products",            resolveVendorBySubdomain, getStoreProducts);
router.get("/store/:subdomain/products/:id",        resolveVendorBySubdomain, getStoreProductById);

module.exports = router;
