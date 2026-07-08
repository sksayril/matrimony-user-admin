import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  // If SMTP is not fully configured, log to console and return false
  if (!host || !user || !pass) {
    console.log(`[SMTP_NOT_CONFIGURED] OTP for ${to} is ${otp}`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports (like 587)
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"LoveLink Verification" <${user}>`,
      to,
      subject: "LoveLink Verification Code",
      text: `Your LoveLink OTP verification code is: ${otp}. Please do not share this code with anyone.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #fbf9f6;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 480px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
              border: 1px solid #f5ebd9;
            }
            .header {
              background-color: #c21a5c;
              padding: 32px 24px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 32px;
              text-align: center;
            }
            .content p {
              font-size: 14px;
              color: #4a4a4a;
              line-height: 1.6;
              margin: 0 0 24px 0;
            }
            .otp-container {
              background-color: #fff5f8;
              border: 1px dashed #fcc6d8;
              border-radius: 16px;
              padding: 20px;
              margin: 24px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: 900;
              color: #c21a5c;
              letter-spacing: 6px;
              margin: 0;
              font-family: 'Courier New', Courier, monospace;
            }
            .footer {
              background-color: #faf8f5;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #f5ebd9;
            }
            .footer p {
              font-size: 11px;
              color: #9b9b9b;
              margin: 0 0 8px 0;
              line-height: 1.5;
            }
            .footer .brand {
              font-weight: 800;
              color: #c21a5c;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LoveLink</h1>
            </div>
            <div class="content">
              <p>Assalamu Alaikum,</p>
              <p>Welcome to LoveLink. Please use the following One-Time Password (OTP) to complete your verification. This code is valid for 10 minutes.</p>
              <div class="otp-container">
                <div class="otp-code">${otp}</div>
              </div>
              <p style="font-size: 12px; color: #7a7a7a;">If you did not request this code, please ignore this email or contact support if you have concerns.</p>
            </div>
            <div class="footer">
              <p>This is an automated security email. Please do not reply directly.</p>
              <div class="brand">LoveLink Sanctuary</div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP_SUCCESS] OTP email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP_ERROR] Failed to send OTP to ${to}:`, error);
    // Print fallback log to console so developers/users can still see it
    console.log(`[FALLBACK] OTP for ${to} is ${otp}`);
    return false;
  }
}
