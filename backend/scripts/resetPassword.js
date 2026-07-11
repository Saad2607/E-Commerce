require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

const run = async () => {
    const [email, newPassword] = process.argv.slice(2);

    if (!email || !newPassword) {
        console.log("\nUsage: node scripts/resetPassword.js <email> <new-password>\n");
        console.log("Example: node scripts/resetPassword.js admin@gmail.com MyNewPass123\n");
        process.exit(1);
    }

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
        console.log(`No user found with email: ${email}`);
        process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log(`Password updated for: ${user.email}${user.isAdmin ? " (Admin)" : ""}`);
    process.exit(0);
};

run().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
