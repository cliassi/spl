import React from 'react';

interface StorePackageSuccessProps {
  lockerCode: string;
  pickupCode: string;
  onStoreAnother: () => void;
}

export const StorePackageSuccess: React.FC<StorePackageSuccessProps> = ({
  lockerCode,
  pickupCode,
  onStoreAnother,
}) => {
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
        <h2 className="text-2xl font-bold text-gray-800">Package Stored Successfully!</h2>
      </div>

      <div className="space-y-6">
        {/* Locker Code */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium mb-1">Locker Code</p>
          <p className="text-3xl font-bold text-blue-800 tracking-wider">{lockerCode}</p>
          <p className="text-sm text-blue-600 mt-1">Place package in this locker</p>
        </div>

        {/* Pickup Code - Most Important */}
        <div className="p-6 bg-amber-50 rounded-lg border-2 border-amber-300">
          <p className="text-sm text-amber-700 font-medium mb-2">Pickup Code</p>
          <p className="text-5xl font-bold text-amber-800 tracking-widest text-center py-4">
            {pickupCode}
          </p>
          
          <div className="mt-4 p-3 bg-amber-100 rounded border border-amber-300">
            <p className="text-amber-800 text-sm font-semibold flex items-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Save your pickup code - it will not be shown again!
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>1. Place the package in locker <strong>{lockerCode}</strong></p>
          <p>2. Close the locker door securely</p>
          <p>3. Give the pickup code <strong>{pickupCode}</strong> to the recipient</p>
        </div>

        {/* Store Another Button */}
        <button
          onClick={onStoreAnother}
          className="w-full py-2 px-4 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Store Another Package
        </button>
      </div>
    </div>
  );
};
