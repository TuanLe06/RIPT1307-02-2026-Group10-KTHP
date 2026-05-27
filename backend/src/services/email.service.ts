import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { EmailNotificationModel } from '../models/notification.model';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN || '',
    pass: process.env.BREVO_SMTP_KEY || '',
  },
});

const getFromEmail = (): string => {
  return process.env.BREVO_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@admisx.com';
};

const getFromName = (): string => {
  return process.env.BREVO_FROM_NAME || 'AdmisX';
};

export const sendOtpEmail = async (
  to: string,
  otp: string,
  fullName: string,
  userId: number,
  sentBy?: number,
): Promise<boolean> => {
  try {
    const expiryMinutes = parseInt(process.env.OTP_EXPIRES_IN || '5', 10);

    await transporter.sendMail({
      from: `"${getFromName()}" <${getFromEmail()}>`,
      to,
      subject: 'Yêu cầu đặt lại mật khẩu - AdmisX',
      html: generateOTPEmailHTML(fullName, otp, expiryMinutes),
    });

    await EmailNotificationModel.create({
      receiver_id: userId,
      receiver_email: to,
      subject: 'Yêu cầu đặt lại mật khẩu - AdmisX',
      content: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${expiryMinutes} phút.`,
      type: 'PASSWORD_RESET',
      sent_by: sentBy || userId,
    });

    console.log('Email sent successfully via Brevo SMTP');
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo SMTP:', error);
    return false;
  }
};

function generateOTPEmailHTML(fullName: string, otp: string, expiryMinutes: number): string {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        background: #f4f6f8;
        font-family: Arial, sans-serif;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        overflow: hidden;
      }
      .header {
        background: #3b5bdb;
        color: #ffffff;
        padding: 24px 20px;
        text-align: center;
        border-bottom: 1px solid #e5e5e5;
      }
      .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
      .content {
        padding: 32px;
        background: #f9f9f9;
      }
      .otp-box {
        background: white;
        padding: 22px;
        text-align: center;
        border: 2px dashed #667eea;
        border-radius: 10px;
        margin: 26px 0;
      }
      .otp-code {
        font-size: 36px;
        font-weight: bold;
        color: #667eea;
        letter-spacing: 10px;
      }
      .warning {
        background: #fff4e6;
        border-left: 5px solid #ffa94d;
        padding: 16px;
        border-radius: 6px;
        margin-top: 28px;
      }
      .warning ul {
        margin: 8px 0 0 20px;
        padding: 0;
        color: #8a6d3b;
      }
      .footer {
        text-align: center;
        padding: 16px;
        background: #f1f3f5;
        font-size: 12px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Yêu cầu đặt lại mật khẩu</h1>
      </div>
      <div class="content">
        <p>Kính gửi <strong>${fullName}</strong>,</p>
        <p>
          Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Vui lòng sử dụng mã xác thực (OTP) dưới đây để hoàn tất quá trình.
        </p>
        <div class="otp-box">
          <p style="margin: 0; color: #666; font-size: 15px;">Mã xác thực:</p>
          <div class="otp-code">${otp}</div>
          <p style="margin: 10px 0 0; color: #999; font-size: 14px;">
            Mã có hiệu lực trong ${expiryMinutes} phút
          </p>
        </div>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
        <div class="warning">
          <strong>Lưu ý bảo mật:</strong>
          <ul>
            <li>Không chia sẻ mã xác thực với bất kỳ ai</li>
            <li>Đội ngũ hỗ trợ sẽ không yêu cầu bạn cung cấp mã OTP</li>
          </ul>
        </div>
        <p style="margin-top: 28px;">
          Trân trọng,<br><strong>Bộ phận hỗ trợ khách hàng</strong>
        </p>
      </div>
      <div class="footer">
        Đây là email tự động, vui lòng không trả lời.
      </div>
    </div>
  </body>
  </html>`;
}
