// LockerCard component - displays individual locker information
import { Lock, Unlock } from 'lucide-react';
import type { Locker } from '../../api/lockerApi.js';

interface LockerCardProps {
  locker: Locker;
}

const sizeConfig = {
  SMALL: { label: 'S', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  MEDIUM: { label: 'M', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  LARGE: { label: 'L', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

export function LockerCard({ locker }: LockerCardProps) {
  const size = sizeConfig[locker.size];

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 ${
        locker.isAvailable
          ? 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold ${size.color}`}
          >
            {size.label}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{locker.code}</p>
            <p className="text-xs text-gray-500">{locker.size.toLowerCase()}</p>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            locker.isAvailable
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {locker.isAvailable ? (
            <Unlock className="w-3 h-3" />
          ) : (
            <Lock className="w-3 h-3" />
          )}
          {locker.isAvailable ? 'Free' : 'In Use'}
        </div>
      </div>
    </div>
  );
}
