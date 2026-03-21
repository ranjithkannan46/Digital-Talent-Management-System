const { Resend } = require("resend");

/*
  In-memory OTP store — maps email → { code, expiresAt, purpose }
  purpose: "register" | "reset"
*/
const otpStore = new Map();
const OTP_TTL  = 10 * 60 * 1000; // 10 minutes

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing from .env");
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const sendEmail = async (to, code, purpose) => {
  const resend  = getResend();
  const subject = purpose === "reset"
    ? "Reset your DTMS password"
    : "Your DTMS Verification Code";

  const heading = purpose === "reset"
    ? "Reset your password"
    : "Verify your email";

  const body = purpose === "reset"
    ? "Use the code below to reset your DTMS password. It expires in <strong style='color:#111827'>10 minutes</strong>."
    : "Use the code below to complete your registration. It expires in <strong style='color:#111827'>10 minutes</strong>.";

  const { data, error } = await resend.emails.send({
    from:    "DTMS <onboarding@resend.dev>",
    to,
    subject,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px 22px;">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.65);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Digital Talent Management System</p>
          <h1 style="margin:0;color:#ffffff;font-size:21px;font-weight:700;">${heading}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.65;">${body}</p>
          <div style="background:#faf5ff;border:2px dashed #7c3aed;border-radius:12px;padding:22px 20px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your code</p>
            <span style="font-size:40px;font-weight:800;color:#7c3aed;letter-spacing:12px;font-family:'Courier New',monospace;">${code}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">
            If you did not request this, please ignore this email.<br/>
            <strong>Never share this code with anyone.</strong>
          </p>
        </div>
        <div style="padding:14px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} DTMS &middot; Rynixsoft</p>
        </div>
      </div>
    `,
  });

  if (error) throw new Error(error.message || "Resend API error");
  return data;
};

/* POST /api/auth/send-otp  — body: { email, purpose } */
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
    await sendEmail(email, code, purpose);
    console.log(`[OTP] ${purpose} code ${code} → ${email}`);
    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("[sendOtp]", err.message);
    otpStore.delete(email.toLowerCase());

    // Give a helpful message if the API key is wrong
    const msg = err.message.includes("RESEND_API_KEY")
      ? "RESEND_API_KEY missing in backend .env"
      : err.message.includes("Invalid API key") || err.message.includes("Unauthorized")
        ? "Invalid Resend API key. Check RESEND_API_KEY in your backend .env file."
        : "Failed to send OTP. Please try again.";

    res.status(500).json({ message: msg });
  }
};

/* POST /api/auth/verify-otp  — body: { email, code } */
const verifyOtp = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const key    = email.toLowerCase();
  const stored = otpStore.get(key);

  if (!stored) {
    return res.status(400).json({
      message: "No OTP found for this email. Please request a new one.",
    });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (stored.code !== code.trim()) {
    return res.status(400).json({ message: "Incorrect code. Please try again." });
  }

  otpStore.delete(key);
  res.json({ message: "OTP verified.", purpose: stored.purpose });
};

module.exports = { sendOtp, verifyOtp };