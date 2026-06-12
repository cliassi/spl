// TanStack Query hooks for locker data fetching
import { useQuery } from '@tanstack/react-query';
import { fetchLockers, fetchLockerById, fetchLockerByCode, type ListLockersParams } from '../api/lockerApi.js';

const LOCKERS_QUERY_KEY = 'lockers';

export function useLockers(params?: ListLockersParams) {
  return useQuery({
    queryKey: [LOCKERS_QUERY_KEY, params],
    queryFn: () => fetchLockers(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

export function useLocker(id: string) {
  return useQuery({
    queryKey: [LOCKERS_QUERY_KEY, id],
    queryFn: () => fetchLockerById(id),
    enabled: !!id, // Only run when id is provided
    staleTime: 30 * 1000,
  });
}

export function useLockerByCode(code: string) {
  return useQuery({
    queryKey: [LOCKERS_QUERY_KEY, 'code', code],
    queryFn: () => fetchLockerByCode(code),
    enabled: !!code, // Only run when code is provided
    staleTime: 30 * 1000,
  });
}
