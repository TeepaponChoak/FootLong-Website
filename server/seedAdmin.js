import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "FootLong" });
    
    if (existingAdmin) {
      // Update to admin if not already
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log("Updated existing user 'FootLong' to admin");
      } else {
        console.log("Admin user 'FootLong' already exists");
      }
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash("footlong.29", 10);
      const admin = new User({
        username: "FootLong",
        email: "admin@footlong.web",
        password: hashedPassword,
        isAdmin: true
      });
      await admin.save();
      console.log("Admin user 'FootLong' created successfully");
    }

    await mongoose.connection.close();
    console.log("Done");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();