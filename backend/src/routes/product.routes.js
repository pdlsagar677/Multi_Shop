const express = require("express");
const router = express.Router();
const {
  getVendorProducts,
  getVendorProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} = require("../controllers/product.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");

// ─────────────────────────────────────────
// All routes — vendor only
// ─────────────────────────────────────────
router.use(protect);
router.use(restrictTo("vendor"));

const createProductValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ min: 2 }).withMessage("Product name must be at least 2 characters"),
  body("price")
    .notEmpty().withMessage("Price is required")
    .isFloat({ min: 0 }).withMessage("Price must be a number greater than or equal to 0"),
];

router.get("/",         getVendorProducts);
router.get("/:id",      getVendorProductById);
router.post("/",        upload.array("images", 5), createProductValidation, validateRequest, createProduct);
router.put("/:id",      upload.array("images", 5), updateProduct);
router.delete("/:id",   deleteProduct);
router.patch("/:id/toggle", toggleProductStatus);

module.exports = router;
