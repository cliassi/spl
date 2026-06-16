import React from 'react';
import { CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card">
      {/* Success Header */}
      <div className="px-6 py-5 bg-emerald-50 border-b border-emerald-100 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Package Stored!</h2>
        <p className="text-sm text-gray-600 mt-1">Your package has been assigned to a locker</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Locker Code */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Assigned Locker</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 tracking-wide">{lockerCode}</p>
            <button
              onClick={() => copyToClipboard(lockerCode)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Place the package in this locker</p>
        </div>

        {/* Pickup Code - Critical */}
        <div className="p-5 bg-amber-50 rounded-lg border-2 border-amber-200">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Pickup Code</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-bold text-amber-900 tracking-widest font-mono">
              {pickupCode}
            </p>
            <button
              onClick={() => copyToClipboard(pickupCode)}
              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-colors"
              title="Copy"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-100/60 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium text-amber-800">
              Save this code now — it will not be shown again!
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2.5 text-sm text-gray-600">
          <p className="font-medium text-gray-700 text-xs uppercase tracking-wide">Next Steps</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li>Place the package in locker <strong className="text-gray-900">{lockerCode}</strong></li>
            <li>Close the locker door securely</li>
            <li>Give the pickup code <strong className="text-gray-900">{pickupCode}</strong> to the recipient</li>
          </ol>
        </div>

        {/* Store Another */}
        <button onClick={onStoreAnother} className="btn-secondary w-full">
          Store Another Package
        </button>
      </div>
    </div>
  );
};
