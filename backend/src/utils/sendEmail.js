const nodemailer = require("nodemailer");
const THEMES = require("../config/themes");

// ─────────────────────────────────────────
// Create Ethereal transporter for demo/dev
// ─────────────────────────────────────────
const createTransporter = async () => {
  if (process.env.NODE_ENV === "production") {
    // TODO: swap with real SMTP credentials in production
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Dev/demo: auto-create Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// ─────────────────────────────────────────
// Send OTP verification email to customer
// ─────────────────────────────────────────
const sendVerificationEmail = async ({ name, email, otp, vendor }) => {
  const transporter = await createTransporter();

  const brandName = vendor?.storeName || "Multi-Tenant Shop";
  const brandColor = vendor ? (THEMES[vendor.theme]?.primaryColor || "#4F46E5") : "#4F46E5";

  const mailOptions = {
    from: `"${brandName}" <no-reply@multishop.com>`,
    to: email,
    subject: `Verify Your Email — ${brandName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #111;">Hi ${name},</h2>
        <p>Thanks for signing up${vendor ? ` at ${brandName}` : ""}! Use the OTP below to verify your email address.</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: ${brandColor};
          background: #F3F4F6;
          padding: 20px;
          text-align: center;
          border-radius: 8px;
          margin: 24px 0;
        ">
          ${otp}
        </div>
        <p style="color: #6B7280;">This OTP expires in <strong>10 minutes</strong>.</p>
        <p style="color: #6B7280;">If you didn't sign up, ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Email preview URL:", nodemailer.getTestMessageUrl(info));
  }
};

// ─────────────────────────────────────────
// Send temp password email to new vendor
// ─────────────────────────────────────────
const sendVendorWelcomeEmail = async ({ name, email, tempPassword, storeName, subdomain, theme }) => {
  const transporter = await createTransporter();

  const brandName = storeName || "Multi-Tenant Shop";
  const brandColor = theme ? (THEMES[theme]?.primaryColor || "#4F46E5") : "#4F46E5";
  const loginUrl = subdomain
    ? `http://${subdomain}.localhost:3000/login`
    : "http://localhost:3000/login";

  const mailOptions = {
    from: `"${brandName}" <no-reply@multishop.com>`,
    to: email,
    subject: `Your ${brandName} Account is Ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #111;">Hi ${name},</h2>
        <p>Your vendor account for <strong>${brandName}</strong> has been created.</p>
        <p>Use the credentials below to log in:</p>
        <div style="
          background: #F3F4F6;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
        ">
          <p><strong>Store URL:</strong> <a href="${loginUrl}" style="color: ${brandColor};">${loginUrl}</a></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <span style="color: ${brandColor}; font-size: 18px;">${tempPassword}</span></p>
        </div>
        <p style="color: #EF4444;"><strong>You will be asked to change your password on first login.</strong></p>
        <p style="color: #6B7280;">If you did not expect this email, please contact support.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Vendor email preview URL:", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = {
  sendVerificationEmail,
  sendVendorWelcomeEmail,
};