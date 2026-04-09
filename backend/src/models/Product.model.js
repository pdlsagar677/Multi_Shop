const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    compareAtPrice: {
      type: Number,
    },

    category: {
      type: String,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    sku: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },

    discountValidUntil: {
      type: Date,
      default: null,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("effectivePrice").get(function () {
  if (this.discountPercent > 0) {
    if (this.discountValidUntil && this.discountValidUntil < new Date()) {
      return this.price;
    }
    return Math.round(this.price * (1 - this.discountPercent / 100) * 100) / 100;
  }
  return this.price;
});

productSchema.index({ vendorId: 1, createdAt: -1 });
productSchema.index({ vendorId: 1, isFeatured: 1, isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
