// Package status enum representing lifecycle states
export enum PackageStatus {
  CREATED = 'CREATED',
  STORED = 'STORED',
  RETRIEVED = 'RETRIEVED',
}

export const packageStatusOrder: Record<PackageStatus, number> = {
  [PackageStatus.CREATED]: 0,
  [PackageStatus.STORED]: 1,
  [PackageStatus.RETRIEVED]: 2,
};
