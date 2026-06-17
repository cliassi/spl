import React, { useState } from 'react';
import { Box, Loader2, AlertCircle } from 'lucide-react';
import { storePackage, StorePackageRequest, PackageApiError } from '../../api/packageApi.js';

interface StorePackageFormProps {
  onSuccess: (result: {
    packageId: string;
    lockerCode: string;
    pickupCode: string;
  }) => void;
}

const sizes = [
  { value: 'SMALL' as const, label: 'Small', desc: 'Letters & small parcels' },
  { value: 'MEDIUM' as const, label: 'Medium', desc: 'Standard boxes' },
  { value: 'LARGE' as const, label: 'Large', desc: 'Oversized packages' },
];

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
    <div className="card">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store a Package</h2>
            <p className="text-sm text-gray-500">Assign a locker for your package</p>
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
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="input-field"
            />
            <p className="mt-1.5 text-xs text-gray-400">A unique identifier for tracking</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((opt) => (
                <label
                  key={opt.value}
                  className={`relative flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    size === opt.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={opt.value}
                    checked={size === opt.value}
                    onChange={(e) => setSize(e.target.value as typeof size)}
                    disabled={isLoading}
                    className="sr-only"
                  />
                  <span className={`text-sm font-semibold ${size === opt.value ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5 text-center">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !reference.trim()}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Storing...
              </>
            ) : (
              'Store Package'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
