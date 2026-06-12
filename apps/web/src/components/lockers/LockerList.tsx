// LockerList component - displays list of lockers with filters
import { useState } from 'react';
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading lockers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 font-medium">Error loading lockers</div>
        <div className="text-red-500 text-sm mt-1">{error.message}</div>
      </div>
    );
  }

  if (!lockers || lockers.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-yellow-700">No lockers found</div>
      </div>
    );
  }

  const availableCount = lockers.filter((l) => l.isAvailable).length;
  const occupiedCount = lockers.length - availableCount;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="size-filter" className="font-medium text-gray-700">
            Size:
          </label>
          <select
            id="size-filter"
            value={filters.size || 'ALL'}
            onChange={handleSizeChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Sizes</option>
            <option value="SMALL">Small</option>
            <option value="MEDIUM">Medium</option>
            <option value="LARGE">Large</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="availability-filter" className="font-medium text-gray-700">
            Availability:
          </label>
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
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="available">Available Only</option>
            <option value="occupied">Occupied Only</option>
          </select>
        </div>

        <div className="flex items-center gap-4 ml-auto text-sm text-gray-600">
          <span className="text-green-600 font-medium">
            {availableCount} Available
          </span>
          <span className="text-red-600 font-medium">
            {occupiedCount} Occupied
          </span>
          <span className="text-gray-400">|</span>
          <span>Total: {lockers.length}</span>
        </div>
      </div>

      {/* Locker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lockers.map((locker) => (
          <LockerCard key={locker.id} locker={locker} />
        ))}
      </div>
    </div>
  );
}
