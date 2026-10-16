require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI is missing in environment variables.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.\n");

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });
    const legacyUsers = await User.countDocuments({ isVerified: { $exists: false } });

    console.log("=== User Account Verification Summary ===");
    console.log(`Total Accounts:        ${totalUsers}`);
    console.log(`Explicitly Verified:   ${verifiedUsers}`);
    console.log(`Pending Verification:  ${unverifiedUsers}`);
    console.log(`Legacy (Unspecified):  ${legacyUsers}\n`);

    const shouldMigrate = process.argv.includes("--verify-legacy");

    if (shouldMigrate) {
        console.log("Migrating legacy accounts to isVerified: true...");
        const result = await User.updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: true } }
        );
        console.log(`Migration complete. Updated ${result.modifiedCount} accounts.`);
    } else {
        console.log("Dry run only. To mark existing legacy accounts as verified, run:");
        console.log("  node scripts/migrateLegacyUsers.js --verify-legacy\n");
    }

    process.exit(0);
};

run().catch((err) => {
    console.error("Migration script failed:", err.message);
    process.exit(1);
});
