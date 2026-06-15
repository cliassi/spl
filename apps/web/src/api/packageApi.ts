// API client for package endpoints
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface StorePackageRequest {
  reference: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
}

export interface StorePackageResponse {
  packageId: string;
  lockerCode: string;
  pickupCode: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

export class PackageApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode: string
  ) {
    super(message);
    this.name = 'PackageApiError';
  }
}

export async function storePackage(request: StorePackageRequest): Promise<StorePackageResponse> {
  const url = `${API_BASE_URL}/api/v1/packages`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    }));
    
    throw new PackageApiError(
      errorData.message,
      response.status,
      errorData.code
    );
  }
  
  return response.json();
}

export interface RetrievePackageRequest {
  lockerCode: string;
  pickupCode: string;
}

export interface StorageCharge {
  amountMinorUnits: number;
  currency: string;
  displayAmount: string;
}

export interface RetrievePackageResponse {
  packageId: string;
  packageReference: string;
  lockerCode: string;
  storedAt: string;
  retrievedAt: string;
  storageDuration: string;
  storageCharge: StorageCharge;
}

export async function retrievePackage(request: RetrievePackageRequest): Promise<RetrievePackageResponse> {
  const url = `${API_BASE_URL}/api/v1/packages/retrieval`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    }));
    
    throw new PackageApiError(
      errorData.message,
      response.status,
      errorData.code
    );
  }
  
  return response.json();
}
