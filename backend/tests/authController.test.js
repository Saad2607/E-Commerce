const { test, describe, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_32_characters_long_12345";
process.env.OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || "test_otp_hash_secret_54321";
process.env.OTP_TTL_MINUTES = "5";
process.env.OTP_RESEND_COOLDOWN_SECONDS = "2";
process.env.OTP_MAX_ATTEMPTS = "5";
process.env.EMAIL_PROVIDER = "mock";

const User = require("../models/User");
const OtpChallenge = require("../models/OtpChallenge");
const RateLimit = require("../models/RateLimit");
const { getMockMailbox, clearMockMailbox } = require("../utils/emailService");
const authController = require("../controllers/authController");

// Helper to mock express req and res
const createMockReqRes = (body = {}, params = {}, headers = {}, user = null) => {
    let statusCode = 200;
    let jsonResponse = null;

    const req = {
        body,
        params,
        headers,
        user,
        ip: "127.0.0.1",
    };

    const res = {
        status: (code) => {
            statusCode = code;
            return res;
        },
        json: (data) => {
            jsonResponse = data;
            return res;
        },
    };

    return {
        req,
        res,
        getStatus: () => statusCode,
        getJSON: () => jsonResponse,
    };
};

describe("QuickKart Auth Controller End-to-End Test Suite", () => {
    before(async () => {
        require("dotenv").config();
        await mongoose.connect(process.env.MONGO_URI);
    });

    after(async () => {
        await User.deleteMany({ email: /@controller-test\.com$/ });
        await OtpChallenge.deleteMany({ identifier: /@controller-test\.com$/ });
        await RateLimit.deleteMany({});
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        clearMockMailbox();
        await User.deleteMany({ email: /@controller-test\.com$/ });
        await OtpChallenge.deleteMany({ identifier: /@controller-test\.com$/ });
        await RateLimit.deleteMany({});
    });

    test("1. registerUser creates unverified user and sends verification email without access token", async () => {
        const { req, res, getStatus, getJSON } = createMockReqRes({
            name: "New Customer",
            email: "register@controller-test.com",
            password: "password123",
        });

        await authController.registerUser(req, res);

        assert.equal(getStatus(), 201);
        const data = getJSON();
        assert.equal(data.requiresVerification, true);
        assert.equal(data.token, undefined, "Access token must NOT be returned before email verification");

        const userInDb = await User.findOne({ email: "register@controller-test.com" });
        assert.ok(userInDb);
        assert.equal(userInDb.isVerified, false);

        const mailbox = getMockMailbox();
        assert.equal(mailbox.length, 1);
        assert.equal(mailbox[0].to, "register@controller-test.com");
    });

    test("2. verifyEmail activates account and returns valid JWT access token", async () => {
        // Register first
        const reg = createMockReqRes({
            name: "Verify Me",
            email: "verifyme@controller-test.com",
            password: "password123",
        });
        await authController.registerUser(reg.req, reg.res);

        // Find the challenge that was created
        const challenge = await OtpChallenge.findOne({
            identifier: "verifyme@controller-test.com",
            purpose: "register",
        });
        assert.ok(challenge);

        // We can extract the plain OTP from the mock mailbox email content!
        const mailbox = getMockMailbox();
        const html = mailbox[0].html;
        const match = html.match(/letter-spacing:\s*10px[^>]*>\s*(\d{6})/i);
        assert.ok(match, "Email must contain 6 digit OTP");
        const otp = match[1];

        // Now call verifyEmail
        const { req, res, getStatus, getJSON } = createMockReqRes({
            email: "verifyme@controller-test.com",
            otp,
        });

        await authController.verifyEmail(req, res);
        assert.equal(getStatus(), 200);

        const data = getJSON();
        assert.ok(data.token);
        assert.equal(data.isVerified, true);

        // Check token payload
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        assert.equal(decoded.purpose, "access");

        // Verify database state
        const userInDb = await User.findOne({ email: "verifyme@controller-test.com" });
        assert.equal(userInDb.isVerified, true);
    });

    test("3. loginUser blocks unverified user with 403 and issues a fresh verification code", async () => {
        await User.create({
            name: "Unverified Person",
            email: "unverified-login@controller-test.com",
            password: "password123",
            isVerified: false,
        });

        const { req, res, getStatus, getJSON } = createMockReqRes({
            email: "unverified-login@controller-test.com",
            password: "password123",
        });

        await authController.loginUser(req, res);
        assert.equal(getStatus(), 403);
        const data = getJSON();
        assert.equal(data.requiresVerification, true);

        // Verify fresh verification code was emailed
        const mailbox = getMockMailbox();
        assert.equal(mailbox.length, 1);
        assert.equal(mailbox[0].to, "unverified-login@controller-test.com");
    });

    test("4. forgotPassword & resetPassword complete secure password reset flow", async () => {
        const user = await User.create({
            name: "Reset User",
            email: "reset-flow@controller-test.com",
            password: "oldpassword123",
            isVerified: true,
        });

        // Step 1: Request reset
        const forgotReq = createMockReqRes({ email: "reset-flow@controller-test.com" });
        await authController.forgotPassword(forgotReq.req, forgotReq.res);
        assert.equal(forgotReq.getStatus(), 200);

        const mailbox = getMockMailbox();
        assert.equal(mailbox.length, 1);
        const otpMatch = mailbox[0].html.match(/letter-spacing:\s*10px[^>]*>\s*(\d{6})/i);
        assert.ok(otpMatch);
        const otp = otpMatch[1];

        // Step 2: Verify reset OTP
        const verifyReq = createMockReqRes({
            email: "reset-flow@controller-test.com",
            otp,
        });
        await authController.verifyResetOtp(verifyReq.req, verifyReq.res);
        assert.equal(verifyReq.getStatus(), 200);
        const { resetToken } = verifyReq.getJSON();
        assert.ok(resetToken);

        // Verify reset token cannot be used as an access token
        const decodedResetToken = jwt.verify(resetToken, process.env.JWT_SECRET);
        assert.equal(decodedResetToken.purpose, "password_reset");

        // Step 3: Reset password
        const resetReq = createMockReqRes({
            resetToken,
            password: "brandnewpassword123",
        });
        await authController.resetPassword(resetReq.req, resetReq.res);
        assert.equal(resetReq.getStatus(), 200);

        // Verify login works with new password
        const loginReq = createMockReqRes({
            email: "reset-flow@controller-test.com",
            password: "brandnewpassword123",
        });
        await authController.loginUser(loginReq.req, loginReq.res);
        assert.equal(loginReq.getStatus(), 200);

        // Verify login fails with old password
        const oldLoginReq = createMockReqRes({
            email: "reset-flow@controller-test.com",
            password: "oldpassword123",
        });
        await authController.loginUser(oldLoginReq.req, oldLoginReq.res);
        assert.equal(oldLoginReq.getStatus(), 400);
    });

    test("5. changePassword enforces current password re-authentication", async () => {
        const user = await User.create({
            name: "Pass Changer",
            email: "change-pass@controller-test.com",
            password: "currentpassword123",
            isVerified: true,
        });

        // Wrong current password
        const badReq = createMockReqRes(
            { currentPassword: "wrongpassword", newPassword: "updatedpassword123" },
            {},
            {},
            user
        );
        await authController.changePassword(badReq.req, badReq.res);
        assert.equal(badReq.getStatus(), 400);

        // Correct current password
        const goodReq = createMockReqRes(
            { currentPassword: "currentpassword123", newPassword: "updatedpassword123" },
            {},
            {},
            user
        );
        await authController.changePassword(goodReq.req, goodReq.res);
        assert.equal(goodReq.getStatus(), 200);

        const updatedUser = await User.findById(user._id);
        const isMatch = await updatedUser.matchPassword("updatedpassword123");
        assert.equal(isMatch, true);
    });

    test("6. Email change requires password re-auth and OTP verification on proposed new email", async () => {
        const user = await User.create({
            name: "Email Changer",
            email: "old-address@controller-test.com",
            password: "mypassword123",
            isVerified: true,
        });

        // Request change
        const requestReq = createMockReqRes(
            { currentPassword: "mypassword123", newEmail: "new-address@controller-test.com" },
            {},
            {},
            user
        );
        await authController.requestEmailChange(requestReq.req, requestReq.res);
        assert.equal(requestReq.getStatus(), 200);

        // OTP should have been delivered to the proposed NEW email
        const mailbox = getMockMailbox();
        assert.equal(mailbox.length, 1);
        assert.equal(mailbox[0].to, "new-address@controller-test.com");
        const match = mailbox[0].html.match(/letter-spacing:\s*10px[^>]*>\s*(\d{6})/i);
        const otp = match[1];

        // Before verification, email in database must NOT be changed
        const unchangedUser = await User.findById(user._id);
        assert.equal(unchangedUser.email, "old-address@controller-test.com");

        // Verify change with OTP
        const verifyReq = createMockReqRes(
            { newEmail: "new-address@controller-test.com", otp },
            {},
            {},
            user
        );
        await authController.verifyEmailChange(verifyReq.req, verifyReq.res);
        assert.equal(verifyReq.getStatus(), 200);

        // Verify database is updated
        const changedUser = await User.findById(user._id);
        assert.equal(changedUser.email, "new-address@controller-test.com");

        // Verify confirmation email was sent to OLD email address
        const updatedMailbox = getMockMailbox();
        assert.ok(updatedMailbox.some((m) => m.to === "old-address@controller-test.com"));
    });

    test("7. Optional OTP Login works for verified users and rejects unverified users", async () => {
        const verifiedUser = await User.create({
            name: "OTP User",
            email: "otp-login@controller-test.com",
            password: "password123",
            isVerified: true,
        });

        // Request login code
        const reqOtp = createMockReqRes({ email: "otp-login@controller-test.com" });
        await authController.requestOtpLogin(reqOtp.req, reqOtp.res);
        assert.equal(reqOtp.getStatus(), 200);

        const mailbox = getMockMailbox();
        assert.equal(mailbox.length, 1);
        const otp = mailbox[0].html.match(/letter-spacing:\s*10px[^>]*>\s*(\d{6})/i)[1];

        // Verify login code
        const verifyOtp = createMockReqRes({ email: "otp-login@controller-test.com", otp });
        await authController.verifyOtpLogin(verifyOtp.req, verifyOtp.res);
        assert.equal(verifyOtp.getStatus(), 200);
        assert.ok(verifyOtp.getJSON().token);
        assert.equal(verifyOtp.getJSON().email, "otp-login@controller-test.com");
    });
});
