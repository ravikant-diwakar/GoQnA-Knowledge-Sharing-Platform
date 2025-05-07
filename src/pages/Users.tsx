import React from 'react';
import { useFirestore } from '../hooks/useFirestore';

interface User {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  reputation: number;
  avatarUrl?: string;
}

function Users() {
  const { documents: users } = useFirestore<User>('users');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Community Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-semibold">
                    {user.displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {user.displayName}
                </h2>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium text-indigo-600">
                  Reputation: {user.reputation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;