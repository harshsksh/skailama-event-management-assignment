'use client';

import { useState } from 'react';
import { useStore, User } from '@/store/useStore';
import { apiService } from '@/services/api';

export default function ProfileManagement() {
  const { users, addUser, setLoading, setError } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [showAllProfiles, setShowAllProfiles] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      setLoading(true);
      const newProfile = await apiService.createProfile(newProfileName.trim()) as User;
      addUser(newProfile);
      setNewProfileName('');
      setIsCreating(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">User Profiles</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-base font-medium"
        >
          {isCreating ? 'Cancel' : 'Add Profile'}
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Profile</h3>
          <form onSubmit={handleCreateProfile}>
            <div className="space-y-4">
              <div>
                <label htmlFor="profileName" className="block text-sm font-semibold text-gray-900 mb-2">
                  Profile Name <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-3">
                  <input
                    id="profileName"
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Enter the user's full name"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 font-medium"
                  >
                    Create Profile
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">This name will be displayed across the platform</p>
              </div>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-lg">No profiles created yet</p>
                <p className="text-sm text-gray-500 mt-1">Click &quot;Add Profile&quot; to create your first user profile</p>
          </div>
        ) : (
          <>
            {/* Profile Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Profile Summary</h3>
                  <p className="text-sm text-blue-700">
                    Total Profiles: <span className="font-semibold">{Array.isArray(users) ? users.length : 0}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    Admin Profiles: <span className="font-semibold">{Array.isArray(users) ? users.filter(u => u.isAdmin).length : 0}</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Regular Profiles: <span className="font-semibold">{Array.isArray(users) ? users.filter(u => !u.isAdmin).length : 0}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Profiles (Show only last 3) */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Recent Profiles {Array.isArray(users) && users.length > 3 && `(Showing last 3 of ${users.length})`}
              </h4>
              <div className="space-y-2">
                {Array.isArray(users) ? users.slice(-3).map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                        {user.isAdmin && (
                          <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{user.timezone}</p>
                    </div>
                  </div>
                )) : null}
              </div>
              
              {Array.isArray(users) && users.length > 3 && (
                <div className="mt-3 text-center">
                  <button 
                    onClick={() => setShowAllProfiles(!showAllProfiles)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showAllProfiles ? 'Hide Profiles' : `View All Profiles (${users.length})`}
                  </button>
                </div>
              )}
            </div>

            {/* All Profiles View (Expandable) */}
            {showAllProfiles && Array.isArray(users) && users.length > 3 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-md font-semibold text-gray-900 mb-3">All Profiles</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {Array.isArray(users) ? users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                          {user.isAdmin && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{user.timezone}</p>
                      </div>
                    </div>
                  )) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
