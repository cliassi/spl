import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { notificationService, emailService } from '../../NotificationService.js';
import { z } from 'zod';

const testEmailSchema = z.object({
  to: z.string().email(),
  type: z.enum(['storage', 'retrieval']).default('storage'),
});

const verifyEmailSchema = z.object({
  to: z.string().email(),
});

export async function notificationRoutes(app: FastifyInstance) {
  // Test email configuration
  app.get('/notifications/verify', async (_request, reply) => {
    const isConfigured = await notificationService.verifyEmailConfiguration();
    
    return reply.status(200).send({
      configured: isConfigured,
      smtp: {
        host: process.env.SMTP_HOST || 'mail.cogent.space',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        from: process.env.SMTP_FROM || 'spl@cogent.space',
      },
    });
  });

  // Send test email
  app.post('/notifications/test', async (request: FastifyRequest, reply: FastifyReply) => {
    const bodyResult = testEmailSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        code: 'INVALID_REQUEST',
        message: 'Invalid request body',
        details: bodyResult.error.errors,
      });
    }

    const { to, type } = bodyResult.data;

    try {
      if (type === 'storage') {
        await notificationService.sendStorageConfirmation({
          packageReference: 'TEST-PKG-001',
          recipientEmail: to,
          lockerCode: 'L-S-001',
          pickupCode: '123456',
          storedAt: new Date(),
        });
      } else {
        await notificationService.sendRetrievalConfirmation({
          packageReference: 'TEST-PKG-001',
          recipientEmail: to,
          lockerCode: 'L-S-001',
          retrievedAt: new Date(),
          storageDuration: '2 hours',
          storageCharge: 'FREE',
        });
      }

      return reply.status(200).send({
        success: true,
        message: `Test ${type} notification sent to ${to}`,
      });
    } catch (error) {
      return reply.status(500).send({
        code: 'EMAIL_FAILED',
        message: 'Failed to send test email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Send simple verification email
  app.post('/notifications/verify-email', async (request: FastifyRequest, reply: FastifyReply) => {
    const bodyResult = verifyEmailSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        code: 'INVALID_REQUEST',
        message: 'Invalid request body',
        details: bodyResult.error.errors,
      });
    }

    const { to } = bodyResult.data;

    const result = await emailService.send({
      to,
      subject: 'Smart Package Locker - Email Verification',
      text: `
Hello!

This is a test email from the Smart Package Locker system.
If you received this email, the notification system is working correctly.

Best regards,
Smart Package Locker Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #4CAF50;">✅ Email Verification</h2>
  <p>Hello!</p>
  <p>This is a test email from the <strong>Smart Package Locker</strong> system.</p>
  <p style="background: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50;">
    If you received this email, the notification system is working correctly!
  </p>
  <p>Best regards,<br>Smart Package Locker Team</p>
</div>
      `,
    });

    if (result.success) {
      return reply.status(200).send({
        success: true,
        message: `Verification email sent to ${to}`,
      });
    } else {
      return reply.status(500).send({
        code: 'EMAIL_FAILED',
        message: 'Failed to send verification email',
        error: result.error,
      });
    }
  });
}
