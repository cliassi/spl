import React from 'react';
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Package Retrieved!</h2>
        <p className="text-gray-600 mt-1">Your package has been successfully retrieved.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Package Reference</p>
          <p className="text-lg font-semibold text-gray-800">{result.packageReference}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Locker</p>
          <p className="text-lg font-semibold text-gray-800">{result.lockerCode}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-1">Storage Duration</p>
          <p className="text-lg font-semibold text-gray-800">{result.storageDuration}</p>
        </div>

        <div className={`p-4 rounded-md ${isFree ? 'bg-green-50' : 'bg-blue-50'}`}>
          <p className="text-sm text-gray-600 mb-1">Storage Charge</p>
          <p className={`text-2xl font-bold ${isFree ? 'text-green-600' : 'text-blue-600'}`}>
            {isFree ? 'FREE' : result.storageCharge.displayAmount}
          </p>
          {!isFree && (
            <p className="text-xs text-gray-500 mt-1">
              Charged at $5.00 per day after 24-hour grace period
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetrieveAnother}
          className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Retrieve Another
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
};
