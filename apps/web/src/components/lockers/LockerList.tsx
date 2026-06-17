// LockerList component - displays list of lockers with filters
import { useState } from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useLockers } from '../../hooks/useLockers.js';
import { LockerCard } from './LockerCard.js';
import type { ListLockersParams } from '../../api/lockerApi.js';

export function LockerList() {
  const [filters, setFilters] = useState<ListLockersParams>({});
  const { data: lockers, isLoading, error } = useLockers(filters);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      size: value === 'ALL' ? undefined : (value as ListLockersParams['size']),
    }));
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      available: value === 'all' ? undefined : value === 'available',
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Loading lockers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800">Error loading lockers</p>
          <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!lockers || lockers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Inbox className="w-10 h-10 mb-3" />
        <p className="text-sm">No lockers found</p>
      </div>
    );
  }

  const availableCount = lockers.filter((l) => l.isAvailable).length;
  const occupiedCount = lockers.length - availableCount;

  return (
    <div className="space-y-5">
      {/* Filters & Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          id="size-filter"
          value={filters.size || 'ALL'}
          onChange={handleSizeChange}
          className="input-field w-auto"
        >
          <option value="ALL">All Sizes</option>
          <option value="SMALL">Small</option>
          <option value="MEDIUM">Medium</option>
          <option value="LARGE">Large</option>
        </select>

        <select
          id="availability-filter"
          value={
            filters.available === undefined
              ? 'all'
              : filters.available
              ? 'available'
              : 'occupied'
          }
          onChange={handleAvailabilityChange}
          className="input-field w-auto"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>

        <div className="ml-auto flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {availableCount} available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {occupiedCount} occupied
          </span>
        </div>
      </div>

      {/* Locker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {lockers.map((locker) => (
          <LockerCard key={locker.id} locker={locker} />
        ))}
      </div>
    </div>
  );
}
