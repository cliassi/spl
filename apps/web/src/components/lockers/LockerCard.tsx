// LockerCard component - displays individual locker information
import type { Locker } from '../../api/lockerApi.js';

interface LockerCardProps {
  locker: Locker;
}

export function LockerCard({ locker }: LockerCardProps) {
  const sizeColors = {
    SMALL: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-green-100 text-green-800',
    LARGE: 'bg-purple-100 text-purple-800',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        locker.isAvailable
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-800">
            {locker.code}
          </span>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              sizeColors[locker.size]
            }`}
          >
            {locker.size}
          </span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            locker.isAvailable
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {locker.isAvailable ? 'Available' : 'Occupied'}
        </div>
      </div>
    </div>
  );
}
