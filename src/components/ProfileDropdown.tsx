'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, User } from '@/store/useStore';
import { apiService } from '@/services/api';

export default function ProfileDropdown() {
  const { users, currentUser, setCurrentUser, addUser, setLoading, setError } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setIsCreating(false);
        setNewProfileName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter profiles based on search term
  const filteredProfiles = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileSelect = (profile: User) => {
    setCurrentUser(profile);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      setLoading(true);
      const newProfile = await apiService.createProfile(newProfileName.trim()) as User;
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
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-64 px-4 py-3 bg-purple-100 border border-purple-300 rounded-lg hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <span className="text-gray-700 font-medium">
          {currentUser ? currentUser.name : 'Select current profile...'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search current profile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Profile List */}
            <div className="max-h-48 overflow-y-auto mb-4">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No profile found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile._id}
                      onClick={() => handleProfileSelect(profile)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors duration-200 ${
                        currentUser?._id === profile._id ? 'bg-purple-50 border border-purple-200' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{profile.name}</div>
                        <div className="text-xs text-gray-500">
                          {profile.timezone} {profile.isAdmin && '• Admin'}
                        </div>
                      </div>
                      {currentUser?._id === profile._id && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Profile Section */}
            <div className="border-t pt-4">
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Profile</span>
                </button>
              ) : (
                <form onSubmit={handleCreateProfile} className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter profile name..."
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={!newProfileName.trim()}
                      className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewProfileName('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
