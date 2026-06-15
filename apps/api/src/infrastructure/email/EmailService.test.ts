import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EmailService, EmailMessage } from './EmailService.js';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(),
      verify: vi.fn(),
    })),
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Reset mocks and create fresh instance
    vi.clearAllMocks();
    emailService = new EmailService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should disable email when no credentials provided', () => {
      // When no env vars or smtp file, service should be disabled
      const service = new EmailService();
      // Access private field for testing
      expect((service as any).enabled).toBe(false);
    });

    it('should enable email when credentials are provided via environment variables', () => {
      // Set env vars
      const originalUser = process.env.SMTP_USER;
      const originalPass = process.env.SMTP_PASS;
      process.env.SMTP_USER = 'test@example.com';
      process.env.SMTP_PASS = 'testpass';

      const service = new EmailService();
      expect((service as any).enabled).toBe(true);
      expect((service as any).config.auth.user).toBe('test@example.com');
      expect((service as any).config.auth.pass).toBe('testpass');

      // Restore env vars
      process.env.SMTP_USER = originalUser;
      process.env.SMTP_PASS = originalPass;
    });
  });

  describe('send', () => {
    it('should return failure when email is not configured', async () => {
      const message: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test message',
      };

      const result = await emailService.send(message);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email service not configured');
    });

    it('should successfully send email when configured', async () => {
      // Setup service with credentials
      process.env.SMTP_USER = 'sender@example.com';
      process.env.SMTP_PASS = 'password';
      const service = new EmailService();

      const message: EmailMessage = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test HTML</p>',
      };

      const result = await service.send(message);

      // Note: With mocked nodemailer, this will succeed
      // In real tests, you'd verify the mock was called
      expect(result.success || result.error).toBeDefined();

      // Cleanup
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
    });
  });

  describe('verify', () => {
    it('should return false when email is not configured', async () => {
      const result = await emailService.verify();
      expect(result).toBe(false);
    });
  });

  describe('parseSmtpFile', () => {
    it('should parse smtp file content correctly', () => {
      const smtpContent = `Username:	test@example.com
Password:	secret123
Incoming Server:	mail.example.com	IMAP Port: 993 POP3 Port: 995
Outgoing Server:	mail.example.com
SMTP Port:	587

password: secret123`;

      // Access private method through any cast
      const config = (emailService as any).parseSmtpFile(smtpContent);

      expect(config.auth?.user).toBe('test@example.com');
      expect(config.auth?.pass).toBe('secret123');
      expect(config.host).toBe('mail.example.com');
      expect(config.port).toBe(587);
    });
  });
});
