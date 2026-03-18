const express = require("express");
const router = express.Router();
const { getStoreBySubdomain } = require("../controllers/vendor.controller");

// Public route — storefront subdomain lookup
// @route GET /api/store/:subdomain
router.get("/:subdomain", getStoreBySubdomain);

module.exports = router;
