const sendEmail = require("../utils/mailer");

/*
  In-memory OTP store — maps email → { code, expiresAt, purpose }
*/
const otpStore = new Map();
const OTP_TTL = 10 * 60 * 1000; // 10 minutes

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* POST /api/auth/send-otp */
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
    await sendEmail(
      email,
      purpose === "reset"
        ? "Reset your DTMS password"
        : "Your DTMS Verification Code",
      `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        
        <div style="background:#4f46e5;padding:20px;color:#fff;">
          <h2 style="margin:0;">DTMS Verification</h2>
        </div>

        <div style="padding:24px;text-align:center;">
          <p style="font-size:14px;color:#6b7280;">
            Your OTP code (valid for 10 minutes)
          </p>

          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#4f46e5;margin:20px 0;">
            ${code}
          </div>

          <p style="font-size:12px;color:#9ca3af;">
            Do not share this code with anyone.
          </p>
        </div>

      </div>
      `
    );

    console.log(`OTP ${code} sent to ${email}`);

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("OTP ERROR:", err.message);

    otpStore.delete(email.toLowerCase());

    res.status(500).json({
      message: "Failed to send OTP. Check email configuration.",
    });
  }
};

/* POST /api/auth/verify-otp */
const verifyOtp = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const key = email.toLowerCase();
  const stored = otpStore.get(key);

  if (!stored) {
    return res.status(400).json({
      message: "No OTP found. Please request again.",
    });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({
      message: "OTP expired. Request a new one.",
    });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({
      message: "Incorrect OTP.",
    });
  }

  otpStore.delete(key);

  res.json({
    message: "OTP verified successfully",
    purpose: stored.purpose,
  });
};

module.exports = { sendOtp, verifyOtp };