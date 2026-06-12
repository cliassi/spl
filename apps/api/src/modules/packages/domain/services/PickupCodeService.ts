// Pickup code generation and hashing service
// Security-critical: Uses cryptographically secure random generation and bcrypt hashing
import { randomInt } from 'crypto';
import bcrypt from 'bcrypt';

export interface GeneratedPickupCode {
  plaintext: string;
  hash: string;
}

export class PickupCodeService {
  private readonly codeLength: number;
  private readonly saltRounds: number;

  constructor(options: { codeLength?: number; saltRounds?: number } = {}) {
    this.codeLength = options.codeLength ?? 6;
    this.saltRounds = options.saltRounds ?? 12;
  }

  /**
   * Generate a new pickup code with its hash
   * Returns plaintext code (shown only once) and bcrypt hash (stored in database)
   */
  public async generate(): Promise<GeneratedPickupCode> {
    const plaintext = this.generatePlaintextCode();
    const hash = await this.hashCode(plaintext);

    return {
      plaintext,
      hash,
    };
  }

  /**
   * Verify a plaintext pickup code against a stored hash
   * Uses bcrypt.compare() which provides constant-time comparison
   */
  public async verify(plaintextCode: string, storedHash: string): Promise<boolean> {
    return bcrypt.compare(plaintextCode, storedHash);
  }

  /**
   * Generate a cryptographically secure random numeric code
   * Uses crypto.randomInt for unpredictable values
   */
  private generatePlaintextCode(): string {
    // Generate a code with the specified number of digits
    // For 6 digits: range is 100000 to 999999 (ensures leading zeros don't reduce length)
    const min = Math.pow(10, this.codeLength - 1);
    const max = Math.pow(10, this.codeLength) - 1;

    const code = randomInt(min, max + 1);
    return code.toString();
  }

  /**
   * Hash a plaintext code using bcrypt
   * Cost factor (saltRounds) determines computational cost
   */
  private async hashCode(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.saltRounds);
  }
}
