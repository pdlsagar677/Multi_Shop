const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customer: {
      firstName: { type: String, required: true },
      lastName:  { type: String, required: true },
      email:     { type: String, required: true },
      phone:     { type: String, required: true },
    },

    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, default: null },
      zipCode: { type: String, default: null },
      country: { type: String, default: "Nepal" },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name:     { type: String, required: true },
        price:    { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image:    { type: String, default: null },
      },
    ],

    summary: {
      subtotal:       { type: Number, required: true },
      shippingCharge: { type: Number, default: 0 },
      serviceCharge:  { type: Number, default: 0 },
      taxAmount:      { type: Number, default: 0 },
      total:          { type: Number, required: true },
    },

    payment: {
      method: {
        type: String,
        enum: ["esewa", "cod"],
        default: "esewa",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      transactionId: { type: String, default: null },
      esewaRefId:    { type: String, default: null },
      paidAt:        { type: Date, default: null },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    notes: { type: String, default: null },
  },
  { timestamps: true }
);

// Auto-generate order number before validation
orderSchema.pre("validate", async function () {
  if (!this.orderNumber) {
    const lastOrder = await mongoose
      .model("Order")
      .findOne({ vendorId: this.vendorId })
      .sort({ orderNumber: -1 })
      .select("orderNumber");

    let nextNum = 1;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }
    this.orderNumber = `ORD-${String(nextNum).padStart(5, "0")}`;
  }
});

orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, orderNumber: 1 }, { unique: true });
orderSchema.index({ "payment.transactionId": 1 });

module.exports = mongoose.model("Order", orderSchema);
