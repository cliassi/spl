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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Smart Package Locker</h1>
          <p className="text-gray-600 mt-2">Retrieve your package securely</p>
        </header>

        {view === 'form' && (
          <RetrievePackageForm onSuccess={handleSuccess} />
        )}

        {view === 'success' && result && (
          <RetrievePackageSuccess
            result={result}
            onRetrieveAnother={handleRetrieveAnother}
          />
        )}

        <div className="mt-8 text-center">
          <a
            href="/packages/store"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Store a Package →
          </a>
        </div>
      </div>
    </div>
  );
};
