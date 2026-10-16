const { test, describe, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Ensure environment variables for testing
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_32_characters_long_12345";
process.env.OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || "test_otp_hash_secret_54321";
process.env.OTP_TTL_MINUTES = "5";
process.env.OTP_RESEND_COOLDOWN_SECONDS = "2"; // Shortened for fast testing
process.env.OTP_MAX_ATTEMPTS = "5";
process.env.EMAIL_PROVIDER = "mock";

const User = require("../models/User");
const OtpChallenge = require("../models/OtpChallenge");
const RateLimit = require("../models/RateLimit");
const {
    generateNumericOtp,
    hashOtp,
    createOtpChallenge,
    verifyAndConsumeOtp,
} = require("../utils/otpService");
const { sendEmail, getMockMailbox, clearMockMailbox } = require("../utils/emailService");
const protect = require("../middleware/authMiddleware");

describe("QuickKart Account Security & OTP Test Suite", () => {
    before(async () => {
        require("dotenv").config();
        await mongoose.connect(process.env.MONGO_URI);
    });

    after(async () => {
        // Cleanup test users and challenges
        await User.deleteMany({ email: /@test-quickkart\.com$/ });
        await OtpChallenge.deleteMany({ identifier: /@test-quickkart\.com$/ });
        await RateLimit.deleteMany({ key: /@test-quickkart\.com/ });
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        clearMockMailbox();
        await User.deleteMany({ email: /@test-quickkart\.com$/ });
        await OtpChallenge.deleteMany({ identifier: /@test-quickkart\.com$/ });
        await RateLimit.deleteMany({ key: /@test-quickkart\.com/ });
    });

    describe("1. OTP Generation and Hashing", () => {
        test("1.1 generateNumericOtp generates exactly 6 numeric digits", () => {
            for (let i = 0; i < 50; i++) {
                const otp = generateNumericOtp();
                assert.equal(typeof otp, "string");
                assert.equal(otp.length, 6);
                assert.match(otp, /^\d{6}$/);
            }
        });

        test("1.2 hashOtp is deterministic and purpose-bound", () => {
            const hash1 = hashOtp("register", "user@test-quickkart.com", "123456");
            const hash2 = hashOtp("register", "user@test-quickkart.com", "123456");
            const hashDiffPurpose = hashOtp("forgot-password", "user@test-quickkart.com", "123456");
            const hashDiffEmail = hashOtp("register", "other@test-quickkart.com", "123456");
            const hashDiffOtp = hashOtp("register", "user@test-quickkart.com", "654321");

            assert.equal(hash1, hash2, "Identical inputs must yield identical hash");
            assert.notEqual(hash1, hashDiffPurpose, "Different purpose must yield different hash");
            assert.notEqual(hash1, hashDiffEmail, "Different email must yield different hash");
            assert.notEqual(hash1, hashDiffOtp, "Different OTP must yield different hash");
        });
    });

    describe("2. OTP Challenge Lifecycle & Single Use Enforcement", () => {
        test("2.1 createOtpChallenge generates challenge and stores hashed OTP", async () => {
            const email = "lifecycle@test-quickkart.com";
            const result = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            assert.ok(result.otp, "Must return plain OTP to sender");
            assert.equal(result.otp.length, 6);

            const challengeInDb = await OtpChallenge.findById(result.challengeId);
            assert.ok(challengeInDb);
            assert.equal(challengeInDb.consumed, false);
            assert.equal(challengeInDb.attempts, 0);
            assert.notEqual(challengeInDb.otpHash, result.otp, "Plaintext OTP must NOT be stored in DB");
        });

        test("2.2 verifyAndConsumeOtp succeeds with correct OTP and marks challenge consumed", async () => {
            const email = "verify-success@test-quickkart.com";
            const challenge = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            const verifyResult = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: challenge.otp,
            });

            assert.equal(verifyResult.success, true);
            assert.equal(verifyResult.challenge.consumed, true);

            // Verify that database reflects consumed state
            const challengeInDb = await OtpChallenge.findById(challenge.challengeId);
            assert.equal(challengeInDb.consumed, true);
            assert.ok(challengeInDb.consumedAt);
        });

        test("2.3 Reused OTP is rejected (Single Use Enforcement)", async () => {
            const email = "single-use@test-quickkart.com";
            const challenge = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // First verification: success
            const firstTry = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: challenge.otp,
            });
            assert.equal(firstTry.success, true);

            // Second verification attempt with same code: must fail
            const secondTry = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: challenge.otp,
            });
            assert.equal(secondTry.success, false);
            assert.equal(secondTry.reason, "NOT_FOUND");
        });

        test("2.4 Wrong-purpose OTP is rejected", async () => {
            const email = "purpose-check@test-quickkart.com";
            const challenge = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // Attempt to verify with "forgot-password" purpose
            const result = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "forgot-password",
                otp: challenge.otp,
            });

            assert.equal(result.success, false);
            assert.equal(result.reason, "NOT_FOUND");
        });

        test("2.5 Invalid OTP increments attempt count and enforces maximum 5 attempts", async () => {
            const email = "attempts@test-quickkart.com";
            const challenge = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // 4 invalid attempts
            for (let i = 1; i <= 4; i++) {
                const res = await verifyAndConsumeOtp({
                    identifier: email,
                    purpose: "register",
                    otp: "000000",
                });
                assert.equal(res.success, false);
                assert.equal(res.reason, "INVALID_OTP");
                assert.equal(res.remainingAttempts, 5 - i);
            }

            // 5th invalid attempt -> locks out
            const fifthTry = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: "000000",
            });
            assert.equal(fifthTry.success, false);
            assert.equal(fifthTry.reason, "MAX_ATTEMPTS_EXCEEDED");

            // Even if correct OTP entered now, it is invalidated
            const tryAfterLock = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: challenge.otp,
            });
            assert.equal(tryAfterLock.success, false);
        });

        test("2.6 Resend cooldown is enforced", async () => {
            const email = "cooldown@test-quickkart.com";
            await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // Immediate resend should throw cooldown error
            await assert.rejects(
                async () => {
                    await createOtpChallenge({
                        identifier: email,
                        purpose: "register",
                    });
                },
                (err) => {
                    assert.equal(err.statusCode, 429);
                    assert.ok(err.message.includes("seconds before requesting"));
                    return true;
                }
            );
        });

        test("2.7 Superseded challenge is invalidated when a new challenge is created", async () => {
            const email = "supersede@test-quickkart.com";
            const first = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // Wait for cooldown (2 seconds in test mode)
            await new Promise((r) => setTimeout(r, 2100));

            const second = await createOtpChallenge({
                identifier: email,
                purpose: "register",
            });

            // First OTP should no longer work
            const tryFirst = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: first.otp,
            });
            assert.equal(tryFirst.success, false);

            // Second OTP should work
            const trySecond = await verifyAndConsumeOtp({
                identifier: email,
                purpose: "register",
                otp: second.otp,
            });
            assert.equal(trySecond.success, true);
        });
    });

    describe("3. Email Delivery & Mock Verification", () => {
        test("3.1 Mock email transport records outgoing emails with subject and html", async () => {
            clearMockMailbox();
            await sendEmail("recipient@test-quickkart.com", "Test Subject", "<p>Hello</p>");

            const mailbox = getMockMailbox();
            assert.equal(mailbox.length, 1);
            assert.equal(mailbox[0].to, "recipient@test-quickkart.com");
            assert.equal(mailbox[0].subject, "Test Subject");
        });
    });

    describe("4. Authentication Middleware & Protected Routes", () => {
        test("4.1 Protect rejects requests without a token", async () => {
            const req = { headers: {} };
            let statusCalled = null;
            let jsonCalled = null;
            const res = {
                status: (s) => {
                    statusCalled = s;
                    return { json: (j) => (jsonCalled = j) };
                },
            };

            await protect(req, res, () => {});
            assert.equal(statusCalled, 401);
            assert.equal(jsonCalled.msg, "No token provided");
        });

        test("4.2 Protect rejects tokens with purpose !== 'access' (e.g. password_reset)", async () => {
            const resetToken = jwt.sign(
                { id: new mongoose.Types.ObjectId(), purpose: "password_reset" },
                process.env.JWT_SECRET
            );

            const req = { headers: { authorization: `Bearer ${resetToken}` } };
            let statusCalled = null;
            let jsonCalled = null;
            const res = {
                status: (s) => {
                    statusCalled = s;
                    return { json: (j) => (jsonCalled = j) };
                },
            };

            await protect(req, res, () => {});
            assert.equal(statusCalled, 401);
            assert.equal(jsonCalled.msg, "Invalid token purpose");
        });

        test("4.3 Protect rejects tokens for unverified users with 403", async () => {
            const unverifiedUser = await User.create({
                name: "Unverified Person",
                email: "unverified@test-quickkart.com",
                password: "password123",
                isVerified: false,
            });

            const token = jwt.sign(
                { id: unverifiedUser._id, purpose: "access" },
                process.env.JWT_SECRET
            );

            const req = { headers: { authorization: `Bearer ${token}` } };
            let statusCalled = null;
            let jsonCalled = null;
            const res = {
                status: (s) => {
                    statusCalled = s;
                    return { json: (j) => (jsonCalled = j) };
                },
            };

            await protect(req, res, () => {});
            assert.equal(statusCalled, 403);
            assert.equal(jsonCalled.requiresVerification, true);
        });

        test("4.4 Protect rejects tokens issued before password was changed", async () => {
            const user = await User.create({
                name: "Password Changer",
                email: "pwdchange@test-quickkart.com",
                password: "oldpassword123",
                isVerified: true,
            });

            // Token issued at current time - 100 seconds
            const oldToken = jwt.sign(
                { id: user._id, purpose: "access", iat: Math.floor(Date.now() / 1000) - 100 },
                process.env.JWT_SECRET
            );

            // User changes password now
            user.passwordChangedAt = new Date();
            await user.save();

            const req = { headers: { authorization: `Bearer ${oldToken}` } };
            let statusCalled = null;
            let jsonCalled = null;
            const res = {
                status: (s) => {
                    statusCalled = s;
                    return { json: (j) => (jsonCalled = j) };
                },
            };

            await protect(req, res, () => {});
            assert.equal(statusCalled, 401);
            assert.ok(jsonCalled.msg.includes("recently changed"));
        });

        test("4.5 Protect allows verified users with valid access token", async () => {
            const user = await User.create({
                name: "Verified Person",
                email: "verified@test-quickkart.com",
                password: "password123",
                isVerified: true,
            });

            const token = jwt.sign(
                { id: user._id, purpose: "access" },
                process.env.JWT_SECRET
            );

            const req = { headers: { authorization: `Bearer ${token}` } };
            let nextCalled = false;
            const res = {};

            await protect(req, res, () => {
                nextCalled = true;
            });

            assert.equal(nextCalled, true);
            assert.equal(req.user._id.toString(), user._id.toString());
        });
    });
});
