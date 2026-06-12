// LockersPage - main page for locker inventory
import { LockerList } from '../../components/lockers/LockerList.js';

export function LockersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Locker Inventory</h1>
          <p className="mt-2 text-gray-600">
            View available lockers for package storage
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <LockerList />
          </div>
        </div>
      </div>
    </div>
  );
}
