const nodemailer = require("nodemailer");

// Using Nodemailer for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Generic email sender
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    console.log(`[smtp] 🕊️ Delivering email to: ${to} | Subject: ${subject}`);
    
    const info = await transporter.sendMail({
      from: `"DTMS Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[smtp] ✅ Email sent! ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[smtp] ❌ FAILED to send to ${to}`);
    console.error(`[smtp] ⚠️ Reason: ${err.message}`);
    
    try {
      require('fs').appendFileSync('mailer_error.log', `[${new Date().toISOString()}] To: ${to} | Error: ${err.message}\n`);
    } catch (e) {}
    
    throw err;
  }
};

/**
 * Sends a verification email (OTP)
 */
const sendVerificationEmail = async (to, code, purpose) => {
  const subject = purpose === "reset" ? "Reset your DTMS Password" : "Verify your DTMS Email";
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #7c3aed; text-align: center;">DTMS Security</h2>
      <p style="font-size: 16px; color: #333;">Your verification code is below. Please use it within 10 minutes.</p>
      <div style="background: #f4f4f5; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 5px; color: #000;">${code}</span>
      </div>
      <p style="font-size: 13px; color: #999; text-align: center;">If you didn't request this code, you can ignore this email.</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Sends a task assignment email
 */
const sendTaskEmail = async (to, userName, taskTitle, priority) => {
  const subject = `New Task Assigned: ${taskTitle}`;
  const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#3b82f6';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #7c3aed;">New Task Assigned</h2>
      <p style="font-size: 16px; color: #333;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">You have been assigned a new task in the Digital Talent Management System.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
        <div style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">${taskTitle}</div>
        <div style="font-size: 14px; color: #64748b;">Priority: <span style="color: ${priorityColor}; font-weight: 600; text-transform: uppercase;">${priority}</span></div>
      </div>
      
      <p style="font-size: 16px; color: #333;">Please log in to your dashboard to view the full details and update your progress.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" style="background: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">View My Tasks</a>
      </div>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Notifies the admin about a new registration waiting for approval
 */
const sendAdminApprovalNotification = async (newUser) => {
  const to = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const subject = `Action Required: New User Approval (${newUser.name})`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #7c3aed;">New Registration</h2>
      <p style="font-size: 16px; color: #333;">A new user has registered and is waiting for your approval.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0;">
        <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">User Details:</div>
        <div style="font-size: 18px; font-weight: 700; color: #1e293b;">${newUser.name}</div>
        <div style="font-size: 14px; color: #64748b;">${newUser.email}</div>
      </div>
      
      <p style="font-size: 16px; color: #333;">Please log in to the admin dashboard to review and approve this account.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Review Registration</a>
      </div>
    </div>
  `;
  return sendMail({ to, subject, html });
};

/**
 * Notifies the user that their account has been approved
 */
const sendUserApprovedEmail = async (to, userName) => {
  const subject = "Your DTMS Account is Active!";
  
  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 40px; border: 1px solid #eee; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🎉</span>
      </div>
      <h2 style="color: #7c3aed; text-align: center;">Account Approved</h2>
      <p style="font-size: 16px; color: #333;">Hello <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Great news! Your account on the Digital Talent Management System has been approved by the administrator.</p>
      <p style="font-size: 16px; color: #333;">You can now log in to access your dashboard and manage your tasks.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/" style="background: #7c3aed; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Log In Now</a>
      </div>
      
      <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">Welcome to the team!</p>
    </div>
  `;
  return sendMail({ to, subject, html });
};

module.exports = { 
  sendVerificationEmail, 
  sendTaskEmail, 
  sendAdminApprovalNotification, 
  sendUserApprovedEmail 
};