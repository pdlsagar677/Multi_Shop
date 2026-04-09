const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
      minlength: [2, "Store name must be at least 2 characters"],
      maxlength: [50, "Store name cannot exceed 50 characters"],
    },

    subdomain: {
      type: String,
      required: [true, "Subdomain is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Subdomain can only contain lowercase letters, numbers and hyphens",
      ],
    },

    // The vendor admin user linked to this store
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    theme: {
      type: String,
      enum: ["sunrise","midnight","forest","ocean","rose","violet","coral","slate","candy","gold"],
      default: "sunrise",
    },

    template: {
      type: String,
      enum: ["template1","template2","template3","template4","template5"],
      default: "template1",
    },

    branding: {
      logo:           { type: String, default: null },
      storeBanner:    { type: String, default: null },
      tagline:        { type: String, default: null },
    },

    contact: {
      email:   { type: String, default: null },
      phone:   { type: String, default: null },
      address: { type: String, default: null },
    },

    payment: {
      esewa: {
        merchantCode: { type: String, default: null },
        secretKey:    { type: String, default: null, select: false },
        isEnabled:    { type: Boolean, default: false },
      },
      khalti: {
        secretKey: { type: String, default: null, select: false },
        isEnabled: { type: Boolean, default: false },
      },
    },

    subscription: {
      plan: {
        type: String,
        enum: ["basic", "pro", "premium"],
        default: "basic",
      },
      status: {
        type: String,
        enum: ["active", "suspended", "cancelled"],
        default: "active",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Super admin who created this vendor
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// subdomain already has unique:true which creates an index
vendorSchema.index({ ownerId: 1 });

module.exports = mongoose.model("Vendor", vendorSchema);