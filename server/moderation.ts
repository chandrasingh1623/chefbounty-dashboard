import { EmailService } from './email';

interface ModerationEventData {
  eventId: number;
  eventTitle: string;
  hostName: string;
  location: string;
  eventDate: string;
  budget: string;
}

export async function sendEventModerationEmail(eventData: ModerationEventData) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

  const subject = `New Event Requires Moderation - ${eventData.eventTitle}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Moderation Required</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a51be 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .event-details { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #475569; }
        .detail-value { color: #1e293b; }
        .actions { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; }
        .btn-approve { background-color: #10b981; color: white; }
        .btn-reject { background-color: #ef4444; color: white; }
        .btn:hover { opacity: 0.9; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .status-badge { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎯 Event Moderation Required</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A new event submission needs your review</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="status-badge">PENDING APPROVAL</span>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">Event Details</h2>
          
          <div class="event-details">
            <div class="detail-row">
              <span class="detail-label">Event Title:</span>
              <span class="detail-value">${eventData.eventTitle}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Host:</span>
              <span class="detail-value">${eventData.hostName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${eventData.location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Date:</span>
              <span class="detail-value">${new Date(eventData.eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Budget:</span>
              <span class="detail-value">$${parseFloat(eventData.budget).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="actions">
            <a href="http://localhost:5000/api/events/approve/${eventData.eventId}" 
               class="btn btn-approve">✅ Approve Event</a>
            <a href="http://localhost:5000/api/events/reject/${eventData.eventId}" 
               class="btn btn-reject">❌ Reject Event</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            You can also review this event in the <a href="https://dashboard.chefbounty.com" style="color: #0a51be;">Admin Dashboard</a>.
          </p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from ChefBounty Event Moderation System</p>
          <p style="margin: 5px 0;">© 2025 ChefBounty. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email to all admin addresses
  for (const adminEmail of adminEmails) {
    try {
      await EmailService.sendRawEmail(adminEmail, subject, htmlContent);
      console.log(`Moderation email sent to: ${adminEmail}`);
    } catch (error) {
      console.error(`Failed to send moderation email to ${adminEmail}:`, error);
    }
  }
}

export async function sendEventApprovalEmail(hostEmail: string, eventTitle: string) {
  const subject = `🎉 Your Event "${eventTitle}" Has Been Approved!`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Approved</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .cta-button { display: inline-block; background: #0a51be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Event Approved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your event is now live on ChefBounty</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <span class="success-badge">✅ APPROVED</span>
          </div>
          
          <h2 style="color: #1e293b; margin-bottom: 20px;">Great news!</h2>
          
          <p>Your event "<strong>${eventTitle}</strong>" has been reviewed and approved by our moderation team. It's now live on the ChefBounty platform and visible to all our professional chefs.</p>
          
          <p>Here's what happens next:</p>
          <ul style="color: #475569; margin: 20px 0;">
            <li>🔍 Professional chefs can now discover and bid on your event</li>
            <li>📧 You'll receive email notifications when chefs submit bids</li>
            <li>💬 You can message interested chefs directly through the platform</li>
            <li>✅ Review and accept the perfect chef for your event</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="https://dashboard.chefbounty.com/my-events" class="cta-button">
              View My Events
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            💡 <strong>Pro Tip:</strong> Events with detailed descriptions and clear requirements typically receive more high-quality bids from our chef community.
          </p>
        </div>
        
        <div class="footer">
          <p>Happy cooking! 👨‍🍳👩‍🍳</p>
          <p style="margin: 5px 0;">© 2025 ChefBounty. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await EmailService.sendRawEmail(hostEmail, subject, htmlContent);
    console.log(`Approval email sent to host: ${hostEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${hostEmail}:`, error);
    throw error;
  }
}

export async function sendEventRejectionEmail(hostEmail: string, eventTitle: string) {
  const subject = `Event Submission Update - "${eventTitle}"`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Submission Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .rejection-badge { background: #dc2626; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
        .cta-button { display: inline-block; background: #0a51be; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        .help-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📋 Event Submission Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Regarding your recent event submission</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <span class="rejection-badge">⚠️ NEEDS REVISION</span>
          </div>
          
          <p>Thank you for submitting your event "<strong>${eventTitle}</strong>" to ChefBounty. After careful review, our moderation team has determined that this event needs some adjustments before it can go live on our platform.</p>
          
          <div class="help-box">
            <h3 style="color: #92400e; margin-top: 0;">📝 Common Areas for Improvement:</h3>
            <ul style="color: #92400e; margin: 10px 0;">
              <li>Add more specific details about the event requirements</li>
              <li>Clarify the cuisine preferences and dietary restrictions</li>
              <li>Provide clearer venue information and accessibility details</li>
              <li>Ensure the budget range is realistic for the requested services</li>
              <li>Include any special equipment or setup requirements</li>
            </ul>
          </div>
          
          <p>Don't worry – this is a normal part of our quality assurance process to ensure the best experience for both hosts and chefs on our platform.</p>
          
          <h3 style="color: #1e293b;">Next Steps:</h3>
          <ol style="color: #475569;">
            <li>Review your event details and make any necessary improvements</li>
            <li>Resubmit your event through your dashboard</li>
            <li>Our team will review it again within 24 hours</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="https://dashboard.chefbounty.com/post-event" class="cta-button">
              Create New Event
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            💡 <strong>Need Help?</strong> Feel free to reach out to our support team if you have questions about our event guidelines.
          </p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing ChefBounty!</p>
          <p style="margin: 5px 0;">© 2025 ChefBounty. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await EmailService.sendRawEmail(hostEmail, subject, htmlContent);
    console.log(`Rejection email sent to host: ${hostEmail}`);
  } catch (error) {
    console.error(`Failed to send rejection email to ${hostEmail}:`, error);
    throw error;
  }
}