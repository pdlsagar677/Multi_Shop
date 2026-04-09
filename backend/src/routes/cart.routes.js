const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cart.controller");

router.use(protect);

const addToCartValidation = [
  body("productId").notEmpty().withMessage("Product ID is required").isMongoId().withMessage("Invalid product ID"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

const updateQuantityValidation = [
  body("productId").notEmpty().withMessage("Product ID is required").isMongoId().withMessage("Invalid product ID"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be 0 or more"),
];

router.post("/", addToCartValidation, validateRequest, addToCart);
router.get("/", getCart);
router.put("/", updateQuantityValidation, validateRequest, updateQuantity);
router.delete("/item/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
