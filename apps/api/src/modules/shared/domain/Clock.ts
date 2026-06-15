// Clock interface for time-dependent operations
// Allows injection of testable time sources
export interface Clock {
  now(): Date;
}

// System clock implementation - uses actual system time
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

// Fixed clock implementation - for testing with specific timestamps
export class FixedClock implements Clock {
  constructor(private readonly fixedTime: Date) {}

  now(): Date {
    return new Date(this.fixedTime.getTime());
  }
}
