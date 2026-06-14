import React, { useState } from 'react';
import { StorePackageForm } from '../../components/packages/StorePackageForm.js';
import { StorePackageSuccess } from '../../components/packages/StorePackageSuccess.js';

interface StoredPackageResult {
  packageId: string;
  lockerCode: string;
  pickupCode: string;
}

export const StorePackagePage: React.FC = () => {
  const [storedResult, setStoredResult] = useState<StoredPackageResult | null>(null);

  const handleSuccess = (result: StoredPackageResult) => {
    setStoredResult(result);
  };

  const handleStoreAnother = () => {
    setStoredResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Package Storage
        </h1>

        {storedResult ? (
          <StorePackageSuccess
            lockerCode={storedResult.lockerCode}
            pickupCode={storedResult.pickupCode}
            onStoreAnother={handleStoreAnother}
          />
        ) : (
          <StorePackageForm onSuccess={handleSuccess} />
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Locker Inventory
          </a>
        </div>
      </div>
    </div>
  );
};
