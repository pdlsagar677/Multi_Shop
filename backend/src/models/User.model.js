const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Please enter a valid phone number"],
      default: null,
    },

    age: {
      type: Number,
      min: [13, "You must be at least 13 years old"],
      max: [120, "Please enter a valid age"],
      default: null,
    },

    role: {
      type: String,
      enum: ["superadmin", "vendor", "customer"],
      default: "customer",
    },

    // Links vendor admin to their store (null for superadmin/customer)
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },

    // ── Customer only ──
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Vendor only ──
    isFirstLogin: {
      type: Boolean,
      default: false,
    },

    // ── General ──
    isActive: {
      type: Boolean,
      default: true,
    },

    // Refresh token stored in DB for rotation
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────
// Hash password before saving
// ─────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ─────────────────────────────────────────
// Method to compare passwords on login
// ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);