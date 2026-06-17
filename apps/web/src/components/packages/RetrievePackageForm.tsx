import React, { useState } from 'react';
import { Package, Loader2, AlertCircle, KeyRound } from 'lucide-react';
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
    <div className="card">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Retrieve Package</h2>
            <p className="text-sm text-gray-500">Enter your codes to collect your package</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="lockerCode" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="input-field"
            />
            <p className="mt-1.5 text-xs text-gray-400">The locker where your package is stored</p>
          </div>

          <div>
            <label htmlFor="pickupCode" className="block text-sm font-medium text-gray-700 mb-1.5">
              Pickup Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="pickupCode"
                value={pickupCode}
                onChange={(e) => setPickupCode(e.target.value)}
                placeholder="e.g., 123456"
                required
                disabled={isLoading}
                className="input-field pr-10"
              />
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">The 6-digit code provided during storage</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !lockerCode.trim() || !pickupCode.trim()}
            className="btn-success w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Retrieving...
              </>
            ) : (
              'Retrieve Package'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
