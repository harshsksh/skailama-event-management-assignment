'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';

export default function ProfileManagement() {
  const { users, addUser, setLoading, setError } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      setLoading(true);
      const newProfile = await apiService.createProfile(newProfileName.trim());
      addUser(newProfile);
      setNewProfileName('');
      setIsCreating(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">User Profiles</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isCreating ? 'Cancel' : 'Add Profile'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateProfile} className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter profile name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No profiles created yet</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.isAdmin && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Admin
                  </span>
                )}
                <p className="text-sm text-gray-600">Timezone: {user.timezone}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
