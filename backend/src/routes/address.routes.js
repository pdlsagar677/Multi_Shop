const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validate.middleware");
const { protect } = require("../middleware/auth.middleware");
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} = require("../controllers/address.controller");

router.use(protect);

const addressValidation = [
  body("street").trim().notEmpty().withMessage("Street is required"),
  body("city").trim().notEmpty().withMessage("City is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
];

router.post("/", addressValidation, validateRequest, addAddress);
router.get("/", getAddresses);
router.put("/:id", addressValidation, validateRequest, updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
