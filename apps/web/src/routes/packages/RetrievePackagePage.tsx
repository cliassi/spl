import React, { useState } from 'react';
import { RetrievePackageForm } from '../../components/packages/RetrievePackageForm.js';
import { RetrievePackageSuccess } from '../../components/packages/RetrievePackageSuccess.js';
import type { RetrievePackageResponse } from '../../api/packageApi.js';

type ViewState = 'form' | 'success';

export const RetrievePackagePage: React.FC = () => {
  const [view, setView] = useState<ViewState>('form');
  const [result, setResult] = useState<RetrievePackageResponse | null>(null);

  const handleSuccess = (response: RetrievePackageResponse) => {
    setResult(response);
    setView('success');
  };

  const handleRetrieveAnother = () => {
    setResult(null);
    setView('form');
  };

  return (
    <div className="max-w-lg mx-auto">
      {view === 'form' && (
        <RetrievePackageForm onSuccess={handleSuccess} />
      )}

      {view === 'success' && result && (
        <RetrievePackageSuccess
          result={result}
          onRetrieveAnother={handleRetrieveAnother}
        />
      )}
    </div>
  );
};
