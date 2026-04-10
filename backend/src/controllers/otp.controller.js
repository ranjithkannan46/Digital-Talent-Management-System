const { sendVerificationEmail } = require("../utils/mailers");

const otpStore = new Map();
const verifiedEmails = new Map(); // Track emails that successfully completed OTP
const OTP_TTL = 10 * 60 * 1000;
const VERIFIED_TTL = 10 * 60 * 1000; // Success state lasts 10 mins

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { email, purpose = "register" } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const code = generateCode();

  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL,
    purpose,
  });

  try {
    await sendVerificationEmail(email, code, purpose);
    console.log(`OTP ${code} sent to ${email}`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(`[otp] ❌ ${err.message}`);
    otpStore.delete(email.toLowerCase());

    res.status(500).json({ 
      message: "Failed to send OTP", 
      error: err.message 
    });
  }
};

const verifyOtp = (req, res) => {
  const { email, code } = req.body;
  const key = email.toLowerCase();
  const stored = otpStore.get(key);

  if (!stored) {
    return res.status(400).json({ message: "No OTP found" });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (stored.code !== code) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // Success! Record verification status
  verifiedEmails.set(key, {
    verified: true,
    expiresAt: Date.now() + VERIFIED_TTL,
    purpose: stored.purpose
  });

  otpStore.delete(key);
  res.json({ message: "OTP verified" });
};

/**
 * Middleware-like helper to check if email was verified via OTP
 */
const checkVerification = (email, purpose) => {
  const entry = verifiedEmails.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verifiedEmails.delete(email.toLowerCase());
    return false;
  }
  return entry.verified && entry.purpose === purpose;
};

/**
 * Consume the verification status (delete after check to prevent reuse)
 */
const consumeVerification = (email, purpose) => {
  const isValid = checkVerification(email, purpose);
  if (isValid) verifiedEmails.delete(email.toLowerCase());
  return isValid;
};

module.exports = { sendOtp, verifyOtp, checkVerification, consumeVerification };