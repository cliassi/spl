// Charge calculation service for extended storage
// Calculates charges based on storage duration with grace period
import { Clock } from '../../../shared/domain/Clock.js';

export interface ChargeConfig {
  // Grace period in hours (free storage duration)
  gracePeriodHours: number;
  // Charge per day in minor units (e.g., 500 = $5.00)
  chargePerDayMinorUnits: number;
  // Currency code (e.g., 'USD')
  currency: string;
}

export interface CalculatedCharge {
  // Amount in minor units (cents)
  amountMinorUnits: number;
  // Currency code
  currency: string;
  // Human-readable amount
  displayAmount: string;
  // Number of chargeable days
  chargeableDays: number;
  // Whether charge applies (false if within grace period)
  hasCharge: boolean;
}

export class ChargeCalculationService {
  private readonly config: ChargeConfig;
  private readonly clock: Clock;

  constructor(clock: Clock, config?: Partial<ChargeConfig>) {
    this.clock = clock;
    this.config = {
      gracePeriodHours: 24,
      chargePerDayMinorUnits: 500, // $5.00
      currency: 'USD',
      ...config,
    };
  }

  /**
   * Calculate storage charge based on stored duration
   * @param storedAt - When the package was stored
   * @returns Calculated charge with amount and display format
   */
  public calculateCharge(storedAt: Date): CalculatedCharge {
    const now = this.clock.now();
    const storedDurationMs = now.getTime() - storedAt.getTime();
    const storedDurationHours = storedDurationMs / (1000 * 60 * 60);

    // Check if within grace period
    if (storedDurationHours <= this.config.gracePeriodHours) {
      return {
        amountMinorUnits: 0,
        currency: this.config.currency,
        displayAmount: this.formatAmount(0),
        chargeableDays: 0,
        hasCharge: false,
      };
    }

    // Calculate days after grace period (round up to nearest started day)
    const hoursAfterGrace = storedDurationHours - this.config.gracePeriodHours;
    const daysAfterGrace = Math.ceil(hoursAfterGrace / 24);
    const chargeableDays = Math.max(0, daysAfterGrace);

    // Calculate total charge
    const amountMinorUnits = chargeableDays * this.config.chargePerDayMinorUnits;

    return {
      amountMinorUnits,
      currency: this.config.currency,
      displayAmount: this.formatAmount(amountMinorUnits),
      chargeableDays,
      hasCharge: amountMinorUnits > 0,
    };
  }

  /**
   * Calculate storage duration for display
   */
  public calculateDuration(storedAt: Date): string {
    const now = this.clock.now();
    const durationMs = now.getTime() - storedAt.getTime();

    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  }

  private formatAmount(minorUnits: number): string {
    const dollars = Math.floor(minorUnits / 100);
    const cents = minorUnits % 100;
    return `$${dollars}.${cents.toString().padStart(2, '0')}`;
  }
}
