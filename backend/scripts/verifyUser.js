require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
    const args = process.argv.slice(2);
    const email = args[0];

    if (!email) {
        console.log("\nUsage:");
        console.log("  1. Verify an existing user directly:");
        console.log("     node scripts/verifyUser.js <email>");
        console.log("\n  2. Verify and change email (e.g. from dummy to real email):");
        console.log("     node scripts/verifyUser.js <current-email> <new-email>\n");
        console.log("Example:");
        console.log("  node scripts/verifyUser.js admin@quickkart.com");
        console.log("  node scripts/verifyUser.js admin@quickkart.com myrealemail@gmail.com\n");
        process.exit(1);
    }

    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI missing in .env");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        console.error(`\n❌ User not found with email: ${email}`);
        process.exit(1);
    }

    const newEmail = args[1]?.trim().toLowerCase();

    if (newEmail && newEmail !== user.email) {
        const taken = await User.findOne({ email: newEmail });
        if (taken) {
            console.error(`\n❌ Target email ${newEmail} is already in use by another account.`);
            process.exit(1);
        }
        console.log(`Updating email from ${user.email} to ${newEmail}...`);
        user.email = newEmail;
    }

    user.isVerified = true;
    await user.save();

    console.log(`\n✅ Account verified successfully!`);
    console.log(`   Name:        ${user.name}`);
    console.log(`   Email:       ${user.email}`);
    console.log(`   Is Verified: ${user.isVerified}`);
    console.log(`   Is Admin:    ${user.isAdmin}`);
    console.log(`\nYou can now log in at http://localhost:5173/login directly with your password!\n`);

    process.exit(0);
};

run().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
});
