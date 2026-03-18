const Vendor = require("../models/Vendor.model");

const resolveTenant = async (req, res, next) => {
  try {

    let subdomain = req.headers["x-vendor-subdomain"];

    // fallback for localhost development
    if (!subdomain && process.env.NODE_ENV !== "production") {
      subdomain = req.query.vendor;
    }

    if (!subdomain) {
      req.vendor = null;
      return next();
    }

    const vendor = await Vendor.findOne({
      subdomain,
      isActive: true
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    req.vendor = vendor;
    next();

  } catch (err) {
    next(err);
  }
};

module.exports = { resolveTenant };