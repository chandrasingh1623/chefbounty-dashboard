import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';
import jwt from 'jsonwebtoken';


const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface EmailVerificationData {
  userId: number;
  email: string;
}

export class EmailService {
  static generateVerificationToken(userId: number, email: string): string {
    return jwt.sign(
      { userId, email, type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyEmailToken(token: string): EmailVerificationData | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.type === 'email_verification') {
        return {
          userId: decoded.userId,
          email: decoded.email
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async sendVerificationEmail(
    email: string, 
    name: string, 
    verificationToken: string,
    baseUrl: string = 'http://localhost:5000'
  ): Promise<boolean> {
    if (!resend) {
      console.warn('Resend API key not configured. Email verification disabled.');
      return true; // Return true for development to not block registration
    }
    
    try {
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
      
      const { data, error } = await resend.emails.send({
        from: 'ChefBounty <noreply@chefbounty.com>', // Update with your verified domain
        to: [email],
        subject: 'Verify your ChefBounty account',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your ChefBounty Account</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0a51be 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ChefBounty</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Professional Chef Marketplace</p>
              </div>
              
              <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to ChefBounty, ${name}!</h2>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                  Thank you for signing up! To get started and access all features, please verify your email address.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background: #0a51be; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 14px; color: #64748b;">
                  This verification link will expire in 24 hours. If you didn't create a ChefBounty account, you can safely ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <div style="font-size: 12px; color: #94a3b8; text-align: center;">
                  <p>ChefBounty - Connecting Hosts and Professional Chefs</p>
                  <p>If you're having trouble with the button above, copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all;">${verificationUrl}</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Welcome to ChefBounty, ${name}!

Thank you for signing up! To get started and access all features, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create a ChefBounty account, you can safely ignore this email.

---
ChefBounty - Connecting Hosts and Professional Chefs

If you're having trouble with the link above, copy and paste this URL into your browser:
${verificationUrl}
        `
      });

      if (error) {
        console.error('Resend error:', error);
        return false;
      }

      console.log('Verification email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(
    email: string, 
    name: string, 
    role: string,
    baseUrl: string = 'http://localhost:5000'
  ): Promise<boolean> {
    if (!resend) {
      console.warn('Resend API key not configured. Welcome email disabled.');
      return true;
    }
    
    try {
      const dashboardUrl = `${baseUrl}/dashboard`;
      const roleSpecificContent = role === 'chef' ? 
        'Create your professional profile, showcase your specialties, and start receiving booking requests from hosts.' :
        'Post your events, browse available chefs, and find the perfect culinary professional for your occasions.';

      const { data, error } = await resend.emails.send({
        from: 'ChefBounty <noreply@chefbounty.com>',
        to: [email],
        subject: `Welcome to ChefBounty, ${name}! 🎉`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to ChefBounty</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0a51be 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ChefBounty!</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Your culinary journey starts here</p>
              </div>
              
              <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">Hi ${name}, your account is ready!</h2>
                
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                  Your email has been successfully verified and you now have full access to ChefBounty as a <strong>${role}</strong>.
                </p>
                
                <p style="margin: 0 0 30px 0; font-size: 16px;">
                  ${roleSpecificContent}
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${dashboardUrl}" 
                     style="background: #0a51be; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                    Go to Dashboard
                  </a>
                </div>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                  <h3 style="color: #1e293b; margin: 0 0 15px 0;">Quick Start Tips:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${role === 'chef' ? `
                      <li>Complete your profile with bio and specialties</li>
                      <li>Set your hourly rate and availability</li>
                      <li>Browse available events and submit bids</li>
                      <li>Upload portfolio images to showcase your work</li>
                    ` : `
                      <li>Post your first event with detailed requirements</li>
                      <li>Browse our network of professional chefs</li>
                      <li>Review and accept bids from interested chefs</li>
                      <li>Use our messaging system to communicate</li>
                    `}
                  </ul>
                </div>
                
                <p style="margin: 20px 0; font-size: 14px; color: #64748b; text-align: center;">
                  Need help getting started? Reply to this email and our team will assist you!
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <div style="font-size: 12px; color: #94a3b8; text-align: center;">
                  <p>ChefBounty - Connecting Hosts and Professional Chefs</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to ChefBounty, ${name}!

Your email has been successfully verified and you now have full access to ChefBounty as a ${role}.

${roleSpecificContent}

Get started: ${dashboardUrl}

Quick Start Tips:
${role === 'chef' ? `
- Complete your profile with bio and specialties
- Set your hourly rate and availability  
- Browse available events and submit bids
- Upload portfolio images to showcase your work
` : `
- Post your first event with detailed requirements
- Browse our network of professional chefs
- Review and accept bids from interested chefs
- Use our messaging system to communicate
`}

Need help getting started? Reply to this email and our team will assist you!

---
ChefBounty - Connecting Hosts and Professional Chefs
        `
      });

      if (error) {
        console.error('Resend error:', error);
        return false;
      }

      console.log('Welcome email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(
    email: string, 
    name: string, 
    resetToken: string,
    baseUrl: string = 'http://localhost:5000'
  ): Promise<boolean> {
    if (!resend) {
      console.warn('Resend API key not configured. Password reset email disabled.');
      return true; // Return true for development to not block functionality
    }
    
    try {
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      
      const { data, error } = await resend.emails.send({
        from: 'ChefBounty <noreply@chefbounty.com>',
        to: [email],
        subject: 'Reset your ChefBounty password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your ChefBounty Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0a51be 0%, #1e3a8a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">ChefBounty</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Professional Chef Marketplace</p>
              </div>
              
              <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 20px 0;">Password Reset Request</h2>
                
                <p style="color: #475569; margin: 0 0 20px 0;">
                  Hi ${name},
                </p>
                
                <p style="color: #475569; margin: 0 0 20px 0;">
                  We received a request to reset your password for your ChefBounty account. If you didn't make this request, you can safely ignore this email.
                </p>
                
                <p style="color: #475569; margin: 0 0 30px 0;">
                  To reset your password, click the button below. This link will expire in 24 hours for security reasons.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background: #0a51be; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                    Reset My Password
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="color: #0a51be; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">
                  ${resetUrl}
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  This password reset link will expire in 24 hours. If you need help, contact our support team.
                </p>
                
                <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
                  Best regards,<br>
                  The ChefBounty Team
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error('Password reset email error:', error);
        return false;
      }

      console.log('Password reset email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  static async sendRawEmail(
    email: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    if (!resend) {
      console.warn('Resend API key not configured. Email disabled.');
      return true; // Return true for development to not block functionality
    }
    
    try {
      const { data, error } = await resend.emails.send({
        from: 'ChefBounty <noreply@chefbounty.com>',
        to: [email],
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        console.error('Resend error:', error);
        return false;
      }

      console.log('Raw email sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send raw email:', error);
      return false;
    }
  }
}