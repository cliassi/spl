import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService, StorageNotification, RetrievalNotification } from './NotificationService.js';

// Mock the email service
vi.mock('../../infrastructure/email/EmailService.js', () => ({
  emailService: {
    send: vi.fn(),
    verify: vi.fn(),
  },
}));

import { emailService } from '../../infrastructure/email/EmailService.js';

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService = new NotificationService();
  });

  describe('sendStorageConfirmation', () => {
    it('should send storage confirmation email with correct content', async () => {
      const mockSend = vi.mocked(emailService.send).mockResolvedValue({ success: true });

      const notification: StorageNotification = {
        packageReference: 'PKG-001',
        recipientEmail: 'recipient@example.com',
        lockerCode: 'L-S-001',
        pickupCode: '123456',
        storedAt: new Date('2025-01-15T10:00:00Z'),
      };

      await notificationService.sendStorageConfirmation(notification);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];

      expect(call.to).toBe('recipient@example.com');
      expect(call.subject).toContain('PKG-001');
      expect(call.subject).toContain('123456');
      expect(call.text).toContain('PKG-001');
      expect(call.text).toContain('L-S-001');
      expect(call.text).toContain('123456');
      expect(call.html).toContain('Package Stored Successfully');
      expect(call.html).toContain('123456');
    });

    it('should handle email send failure gracefully', async () => {
      const mockSend = vi.mocked(emailService.send).mockResolvedValue({
        success: false,
        error: 'SMTP error',
      });

      const notification: StorageNotification = {
        packageReference: 'PKG-002',
        recipientEmail: 'recipient@example.com',
        lockerCode: 'L-M-001',
        pickupCode: '654321',
        storedAt: new Date(),
      };

      // Should not throw
      await expect(notificationService.sendStorageConfirmation(notification)).resolves.not.toThrow();

      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sendRetrievalConfirmation', () => {
    it('should send retrieval confirmation email with FREE charge', async () => {
      const mockSend = vi.mocked(emailService.send).mockResolvedValue({ success: true });

      const notification: RetrievalNotification = {
        packageReference: 'PKG-003',
        recipientEmail: 'recipient@example.com',
        lockerCode: 'L-L-001',
        retrievedAt: new Date('2025-01-15T12:00:00Z'),
        storageDuration: '2 hours',
        storageCharge: 'FREE',
      };

      await notificationService.sendRetrievalConfirmation(notification);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];

      expect(call.to).toBe('recipient@example.com');
      expect(call.subject).toContain('PKG-003');
      expect(call.subject).toContain('Retrieved');
      expect(call.text).toContain('FREE');
      expect(call.html).toContain('Package Retrieved');
    });

    it('should send retrieval confirmation email with paid charge', async () => {
      const mockSend = vi.mocked(emailService.send).mockResolvedValue({ success: true });

      const notification: RetrievalNotification = {
        packageReference: 'PKG-004',
        recipientEmail: 'recipient@example.com',
        lockerCode: 'L-S-002',
        retrievedAt: new Date(),
        storageDuration: '3 days',
        storageCharge: '$2.00',
      };

      await notificationService.sendRetrievalConfirmation(notification);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];

      expect(call.text).toContain('$2.00');
      expect(call.html).toContain('$2.00');
    });

    it('should handle missing storage charge gracefully', async () => {
      const mockSend = vi.mocked(emailService.send).mockResolvedValue({ success: true });

      const notification: RetrievalNotification = {
        packageReference: 'PKG-005',
        recipientEmail: 'recipient@example.com',
        lockerCode: 'L-M-002',
        retrievedAt: new Date(),
        storageDuration: '1 day',
        // storageCharge is undefined
      };

      await notificationService.sendRetrievalConfirmation(notification);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const call = mockSend.mock.calls[0][0];

      expect(call.text).toContain('FREE');
    });
  });

  describe('verifyEmailConfiguration', () => {
    it('should delegate to emailService.verify', async () => {
      const mockVerify = vi.mocked(emailService.verify).mockResolvedValue(true);

      const result = await notificationService.verifyEmailConfiguration();

      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('should return false when verification fails', async () => {
      const mockVerify = vi.mocked(emailService.verify).mockResolvedValue(false);

      const result = await notificationService.verifyEmailConfiguration();

      expect(result).toBe(false);
    });
  });
});
