require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const connectDB = require("../config/mongodb");
const User = require("../models/User.model");

const SUPERADMIN = {
  name: "Super Admin",
  email: "superadmin@admin.com",
  password: "Admin@1234",
  role: "superadmin",
  isActive: true,
  isVerified: true,
};

const seed = async () => {
  try {
    await connectDB();

    await User.deleteOne({ email: SUPERADMIN.email });
    const user = await User.create(SUPERADMIN);

    console.log(`Superadmin created: ${user.email} (${user._id})`);
    console.log(`Password: ${SUPERADMIN.password}`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
