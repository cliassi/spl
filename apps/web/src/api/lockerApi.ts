// API client for locker endpoints
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface Locker {
  id: string;
  code: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListLockersParams {
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  available?: boolean;
}

export async function fetchLockers(params?: ListLockersParams): Promise<Locker[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.size) {
    queryParams.append('size', params.size);
  }
  if (params?.available !== undefined) {
    queryParams.append('available', params.available.toString());
  }
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/v1/lockers${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch lockers: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchLockerById(id: string): Promise<Locker> {
  const url = `${API_BASE_URL}/api/v1/lockers/${id}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Locker not found');
    }
    throw new Error(`Failed to fetch locker: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchLockerByCode(code: string): Promise<Locker> {
  const url = `${API_BASE_URL}/api/v1/lockers/code/${code}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Locker not found');
    }
    throw new Error(`Failed to fetch locker: ${response.statusText}`);
  }
  
  return response.json();
}
