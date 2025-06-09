const otpStore = new Map(); // In-memory store: { identifier: { otp, expiresAt } }
const OTP_EXPIRY_MINUTES = 5;

function generateOtp() {
    const otpGenerator = require('otp-generator');
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
        digits: true
    });
}

function storeOtp(identifier, otp) {
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    otpStore.set(identifier, { otp, expiresAt });
    console.log(`OTP stored for ${identifier}: ${otp}, expires: ${new Date(expiresAt)}`);
}

function verifyOtp(identifier, otpToVerify) {
    const storedEntry = otpStore.get(identifier);
    if (!storedEntry) return false;
    const { otp, expiresAt } = storedEntry;
    if (Date.now() > expiresAt) {
        otpStore.delete(identifier);
        return false;
    }
    if (otp === otpToVerify) {
        otpStore.delete(identifier);
        return true;
    }
    return false;
}

module.exports = { generateOtp, storeOtp, verifyOtp }; 