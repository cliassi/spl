// LockersPage - main page for locker inventory
import { LockerList } from '../../components/lockers/LockerList.js';

export function LockersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Locker Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and filter available lockers for package storage
        </p>
      </div>

      <div className="card p-6">
        <LockerList />
      </div>
    </div>
  );
}
