import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;
  private enabled: boolean = false;

  constructor() {
    // Load credentials from smtp file if exists
    const smtpFilePath = path.join(process.cwd(), '..', '..', 'smtp');
    let config: Partial<EmailConfig> = {};
    
    if (fs.existsSync(smtpFilePath)) {
      const content = fs.readFileSync(smtpFilePath, 'utf-8');
      config = this.parseSmtpFile(content);
    }

    // Override with environment variables if provided
    this.config = {
      host: process.env.SMTP_HOST || config.host || 'mail.cogent.space',
      port: parseInt(process.env.SMTP_PORT || String(config.port || '465'), 10),
      secure: process.env.SMTP_SECURE === 'true' || config.secure !== false,
      auth: {
        user: process.env.SMTP_USER || config.auth?.user || '',
        pass: process.env.SMTP_PASS || config.auth?.pass || '',
      },
      from: process.env.SMTP_FROM || config.auth?.user || 'spl@cogent.space',
    };

    this.enabled = !!(this.config.auth.user && this.config.auth.pass);
    
    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });
    }
  }

  private parseSmtpFile(content: string): Partial<EmailConfig> {
    const lines = content.split('\n');
    let user = '';
    let pass = '';
    let host = '';
    let port = 465;

    for (const line of lines) {
      if (line.includes('Username:')) {
        user = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('Password:')) {
        pass = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('Outgoing Server:')) {
        host = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('SMTP Port:')) {
        port = parseInt(line.split(':')[1]?.trim() || '465', 10);
      }
    }

    return {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      from: user,
    };
  }

  async send(message: EmailMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.enabled || !this.transporter) {
      console.log('[EmailService] Email disabled or not configured');
      console.log('[EmailService] Would have sent:', message);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.config.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      console.log('[EmailService] Email sent:', result.messageId);
      return { success: true };
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async verify(): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified');
      return true;
    } catch (error) {
      console.error('[EmailService] SMTP verification failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
