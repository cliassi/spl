import React from 'react';
import { CheckCircle2, Clock, DollarSign, Tag, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RetrievePackageResponse } from '../../api/packageApi.js';

interface RetrievePackageSuccessProps {
  result: RetrievePackageResponse;
  onRetrieveAnother: () => void;
}

export const RetrievePackageSuccess: React.FC<RetrievePackageSuccessProps> = ({
  result,
  onRetrieveAnother,
}) => {
  const isFree = result.storageCharge.amountMinorUnits === 0;

  return (
    <div className="card">
      {/* Success Header */}
      <div className="px-6 py-5 bg-emerald-50 border-b border-emerald-100 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Package Retrieved!</h2>
        <p className="text-sm text-gray-600 mt-1">Your package is ready for collection</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Tag className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">Reference</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{result.packageReference}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <LayoutGrid className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">Locker</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{result.lockerCode}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{result.storageDuration}</p>
          </div>

          <div className={`p-3 rounded-lg ${isFree ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className={`w-3 h-3 ${isFree ? 'text-emerald-400' : 'text-indigo-400'}`} />
              <p className={`text-xs ${isFree ? 'text-emerald-600' : 'text-indigo-600'}`}>Charge</p>
            </div>
            <p className={`text-lg font-bold ${isFree ? 'text-emerald-700' : 'text-indigo-700'}`}>
              {isFree ? 'FREE' : result.storageCharge.displayAmount}
            </p>
          </div>
        </div>

        {!isFree && (
          <p className="text-xs text-gray-500 text-center">
            Charged at $5.00/day after 24-hour grace period
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onRetrieveAnother} className="btn-secondary flex-1">
            Retrieve Another
          </button>
          <Link to="/" className="btn-primary flex-1 text-center">
            Done
          </Link>
        </div>
      </div>
    </div>
  );
};
