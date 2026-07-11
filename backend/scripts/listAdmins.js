require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const admins = await User.find({ isAdmin: true }).select("name email isAdmin");

    if (admins.length === 0) {
        console.log("No admin users found.");
    } else {
        console.log("\nAdmin account(s):\n");
        admins.forEach((admin) => {
            console.log(`  Name:  ${admin.name}`);
            console.log(`  Email: ${admin.email}\n`);
        });
    }

    process.exit(0);
};

run().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
