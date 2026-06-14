import React, { useState } from 'react';
import { storePackage, StorePackageRequest, PackageApiError } from '../../api/packageApi.js';

interface StorePackageFormProps {
  onSuccess: (result: {
    packageId: string;
    lockerCode: string;
    pickupCode: string;
  }) => void;
}

export const StorePackageForm: React.FC<StorePackageFormProps> = ({ onSuccess }) => {
  const [reference, setReference] = useState('');
  const [size, setSize] = useState<'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const request: StorePackageRequest = {
        reference: reference.trim(),
        size,
      };

      const response = await storePackage(request);
      
      onSuccess({
        packageId: response.packageId,
        lockerCode: response.lockerCode,
        pickupCode: response.pickupCode,
      });
    } catch (err) {
      if (err instanceof PackageApiError) {
        switch (err.statusCode) {
          case 400:
            setError('Invalid request. Please check your input.');
            break;
          case 409:
            setError(err.message || 'Package reference already exists.');
            break;
          case 422:
            setError('No suitable locker available for this package size.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An unexpected error occurred.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Store Package</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Package Reference
          </label>
          <input
            type="text"
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., PKG-001"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Size
          </label>
          <div className="flex gap-4">
            {(['SMALL', 'MEDIUM', 'LARGE'] as const).map((sizeOption) => (
              <label key={sizeOption} className="flex items-center">
                <input
                  type="radio"
                  name="size"
                  value={sizeOption}
                  checked={size === sizeOption}
                  onChange={(e) => setSize(e.target.value as typeof size)}
                  disabled={isLoading}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{sizeOption}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !reference.trim()}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Storing...
            </span>
          ) : (
            'Store Package'
          )}
        </button>
      </form>
    </div>
  );
};
