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
    <div className="max-w-lg mx-auto">
      {storedResult ? (
        <StorePackageSuccess
          lockerCode={storedResult.lockerCode}
          pickupCode={storedResult.pickupCode}
          onStoreAnother={handleStoreAnother}
        />
      ) : (
        <StorePackageForm onSuccess={handleSuccess} />
      )}
    </div>
  );
};
