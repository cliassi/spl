import { emailService } from '../../infrastructure/email/EmailService.js';

export interface StorageNotification {
  packageReference: string;
  recipientEmail: string;
  lockerCode: string;
  pickupCode: string;
  storedAt: Date;
}

export interface RetrievalNotification {
  packageReference: string;
  recipientEmail: string;
  lockerCode: string;
  retrievedAt: Date;
  storageDuration: string;
  storageCharge?: string;
}

export { emailService };

export class NotificationService {
  async sendStorageConfirmation(notification: StorageNotification): Promise<void> {
    const { packageReference, recipientEmail, lockerCode, pickupCode, storedAt } = notification;

    const subject = `Package ${packageReference} Stored - Pickup Code: ${pickupCode}`;
    
    const text = `
Your package has been stored successfully!

Package Reference: ${packageReference}
Locker: ${lockerCode}
Pickup Code: ${pickupCode}
Stored At: ${storedAt.toLocaleString()}

IMPORTANT: Save your pickup code - it will not be shown again!

To retrieve your package:
1. Go to the locker ${lockerCode}
2. Enter pickup code: ${pickupCode}
3. Retrieve your package within 24 hours for free storage

After 24 hours, storage charges will apply ($1.00 per day).

---
Smart Package Locker System
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .important { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .code { background: #e9ecef; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Package Stored Successfully!</h1>
    </div>
    
    <div class="content">
      <p>Your package has been stored in our secure locker system.</p>
      
      <h3>Package Details:</h3>
      <ul>
        <li><strong>Reference:</strong> ${packageReference}</li>
        <li><strong>Locker:</strong> ${lockerCode}</li>
        <li><strong>Stored At:</strong> ${storedAt.toLocaleString()}</li>
      </ul>
      
      <div class="important">
        <strong>⚠️ IMPORTANT:</strong> Save your pickup code now - it will <strong>NOT</strong> be shown again!
      </div>
      
      <h3>Your Pickup Code:</h3>
      <div class="code">${pickupCode}</div>
      
      <h3>How to Retrieve:</h3>
      <ol>
        <li>Go to locker <strong>${lockerCode}</strong></li>
        <li>Enter pickup code: <strong>${pickupCode}</strong></li>
        <li>Collect your package</li>
      </ol>
      
      <p><strong>Free Storage:</strong> 24 hours from storage time<br>
      <strong>After 24h:</strong> $1.00 per day</p>
    </div>
    
    <div class="footer">
      Smart Package Locker System<br>
      This is an automated notification. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`;

    const result = await emailService.send({
      to: recipientEmail,
      subject,
      text,
      html,
    });

    if (result.success) {
      console.log(`[NotificationService] Storage notification sent to ${recipientEmail}`);
    } else {
      console.error(`[NotificationService] Failed to send storage notification:`, result.error);
    }
  }

  async sendRetrievalConfirmation(notification: RetrievalNotification): Promise<void> {
    const { packageReference, recipientEmail, lockerCode, retrievedAt, storageDuration, storageCharge } = notification;

    const subject = `Package ${packageReference} Retrieved`;
    
    const chargeText = storageCharge && storageCharge !== 'FREE' 
      ? `Storage Charge: ${storageCharge}` 
      : 'Storage Charge: FREE (within 24h grace period)';

    const text = `
Your package has been retrieved successfully!

Package Reference: ${packageReference}
Locker: ${lockerCode}
Retrieved At: ${retrievedAt.toLocaleString()}
Storage Duration: ${storageDuration}
${chargeText}

Thank you for using our Smart Package Locker system.

---
Smart Package Locker System
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; }
    .charge { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; }
    .charge.paid { background: #ffebee; border-left-color: #f44336; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Package Retrieved</h1>
    </div>
    
    <div class="content">
      <p>Your package has been successfully retrieved from our locker system.</p>
      
      <h3>Retrieval Details:</h3>
      <ul>
        <li><strong>Package Reference:</strong> ${packageReference}</li>
        <li><strong>Locker:</strong> ${lockerCode}</li>
        <li><strong>Retrieved At:</strong> ${retrievedAt.toLocaleString()}</li>
        <li><strong>Storage Duration:</strong> ${storageDuration}</li>
      </ul>
      
      <div class="charge ${storageCharge && storageCharge !== 'FREE' ? 'paid' : ''}">
        <strong>💰 Storage Charge:</strong> ${storageCharge || 'FREE'}<br>
        ${storageCharge === 'FREE' ? '<small>Within 24-hour grace period</small>' : '<small>Thank you for your payment</small>'}
      </div>
      
      <p>Thank you for using Smart Package Locker!</p>
    </div>
    
    <div class="footer">
      Smart Package Locker System<br>
      This is an automated notification. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`;

    const result = await emailService.send({
      to: recipientEmail,
      subject,
      text,
      html,
    });

    if (result.success) {
      console.log(`[NotificationService] Retrieval notification sent to ${recipientEmail}`);
    } else {
      console.error(`[NotificationService] Failed to send retrieval notification:`, result.error);
    }
  }

  async verifyEmailConfiguration(): Promise<boolean> {
    return emailService.verify();
  }
}

// Singleton instance
export const notificationService = new NotificationService();
