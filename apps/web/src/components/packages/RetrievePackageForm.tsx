import React, { useState } from 'react';
import { retrievePackage, RetrievePackageRequest, PackageApiError } from '../../api/packageApi.js';
import type { RetrievePackageResponse } from '../../api/packageApi.js';

interface RetrievePackageFormProps {
  onSuccess: (result: RetrievePackageResponse) => void;
}

export const RetrievePackageForm: React.FC<RetrievePackageFormProps> = ({ onSuccess }) => {
  const [lockerCode, setLockerCode] = useState('');
  const [pickupCode, setPickupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const request: RetrievePackageRequest = {
        lockerCode: lockerCode.trim(),
        pickupCode: pickupCode.trim(),
      };

      const response = await retrievePackage(request);
      
      onSuccess(response);
    } catch (err) {
      if (err instanceof PackageApiError) {
        // Security: All retrieval failures return generic message
        // Don't distinguish between wrong code, already retrieved, or non-existent
        switch (err.statusCode) {
          case 400:
            setError('Invalid request. Please check your input.');
            break;
          case 401:
            setError('Invalid pickup code or locker code.');
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
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Retrieve Package</h2>
      <p className="text-gray-600 mb-6">Enter your locker code and pickup code to retrieve your package.</p>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="lockerCode" className="block text-sm font-medium text-gray-700 mb-1">
            Locker Code
          </label>
          <input
            type="text"
            id="lockerCode"
            value={lockerCode}
            onChange={(e) => setLockerCode(e.target.value)}
            placeholder="e.g., L-M-001"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label htmlFor="pickupCode" className="block text-sm font-medium text-gray-700 mb-1">
            Pickup Code
          </label>
          <input
            type="text"
            id="pickupCode"
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value)}
            placeholder="e.g., 123456"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !lockerCode.trim() || !pickupCode.trim()}
          className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Retrieving...
            </span>
          ) : (
            'Retrieve Package'
          )}
        </button>
      </form>
    </div>
  );
};
