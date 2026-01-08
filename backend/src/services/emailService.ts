import nodemailer from 'nodemailer';
import logger from '../config/logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        const emailEnabled = process.env.EMAIL_ENABLED === 'true';
        
        if (!emailEnabled) {
            logger.info('📧 Email service is disabled (set EMAIL_ENABLED=true to enable)');
            return;
        }

        try {
            // Create reusable transporter
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });

            logger.info('✅ Email service initialized');
        } catch (error) {
            logger.error('❌ Failed to initialize email service:', error);
        }
    }

    /**
     * Send email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.transporter) {
            logger.warn('Email service not configured, email not sent');
            // In development, log the email content
            if (process.env.NODE_ENV === 'development') {
                logger.info('📧 [DEV MODE] Email would be sent:', options);
            }
            return false;
        }

        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'Weather Dashboard'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });

            logger.info(`✅ Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            logger.error('❌ Failed to send email:', error);
            return false;
        }
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌤️ Welcome to Weather Dashboard!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>Thank you for registering with Weather Dashboard. To complete your registration, please verify your email address.</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                            ${verificationUrl}
                        </p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: email,
            subject: 'Verify Your Email - Weather Dashboard',
            html,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email: string, username: string, token: string): Promise<boolean> {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>We received a request to reset your password for your Weather Dashboard account.</p>
                        <p style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                            ${resetUrl}
                        </p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul>
                                <li>This link will expire in 1 hour</li>
                                <li>It can only be used once</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        <p>If you didn't request a password reset, your account is still secure and you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: email,
            subject: 'Password Reset Request - Weather Dashboard',
            html,
        });
    }

    /**
     * Send OTP for email verification or password reset
     */
    async sendOTPEmail(email: string, username: string, otp: string, type: 'registration' | 'password_reset'): Promise<boolean> {
        const subject = type === 'registration' 
            ? 'Email Verification Code - Weather Dashboard'
            : 'Password Reset Code - Weather Dashboard';

        const title = type === 'registration'
            ? 'Email Verification'
            : 'Password Reset';

        const description = type === 'registration'
            ? 'Use this code to verify your email and complete your registration:'
            : 'Use this code to reset your password:';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #3b82f6; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3b82f6; font-family: monospace; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                    .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; color: #856404; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌤️ ${title}</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>${description}</p>
                        <div class="otp-box">
                            <p style="margin: 0; color: #666; font-size: 12px; margin-bottom: 10px;">Enter this code:</p>
                            <div class="otp-code">${otp}</div>
                        </div>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.
                        </div>
                        <p style="color: #999; font-size: 12px;">This code will expire in <strong>5 minutes</strong>. If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: email,
            subject,
            html,
        });
    }

    /**
     * Send welcome email (after verification)
     */
    async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Weather Dashboard!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>Your email has been verified successfully! You're all set to start using Weather Dashboard.</p>
                        <div class="features">
                            <h3>Here's what you can do:</h3>
                            <ul>
                                <li>🌤️ Check current weather for any city worldwide</li>
                                <li>⭐ Save your favorite cities for quick access</li>
                                <li>🌡️ View detailed weather information</li>
                                <li>📱 Access from any device</li>
                            </ul>
                        </div>
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Go to Dashboard</a>
                        </p>
                        <p>Have questions or need help? Feel free to reach out to our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail({
            to: email,
            subject: 'Welcome to Weather Dashboard! 🌤️',
            html,
        });
    }
}

export default new EmailService();
