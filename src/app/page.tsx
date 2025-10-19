'use client';

import { useEffect, useState } from 'react';
import { useStore, Event, User } from '@/store/useStore';
import { apiService } from '@/services/api';
import EventManagement from '@/components/EventManagement';
import EventList from '@/components/EventList';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function Home() {
  const {
    currentUser,
    setCurrentUser,
    users,
    setUsers,
    events,
    setEvents,
    selectedTimezone,
    setSelectedTimezone,
    isLoading,
    setLoading,
    error,
    setError,
  } = useStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      // Check if admin exists, if not show setup
      const profiles = await apiService.getProfiles();
      
      // Ensure profiles is an array
      if (!Array.isArray(profiles)) {
        console.error('Profiles data is not an array:', profiles);
        setUsers([]);
        setIsInitialized(true);
        return;
      }
      
      setUsers(profiles);
      
      const admin = profiles.find((user: User) => user.isAdmin);
      if (admin) {
        setCurrentUser(admin);
        setSelectedTimezone(admin.timezone);
        
        // Load events
        const eventsData = await apiService.getEvents(admin.timezone);
        setEvents(eventsData);
      }
      
      setIsInitialized(true);
    } catch (error: unknown) {
      console.error('Failed to initialize app:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize application';
      setError(errorMessage);
      // Set empty arrays to prevent further errors
      setUsers([]);
      setEvents([]);
      setIsInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetup = async (name: string, timezone: string) => {
    try {
      setLoading(true);
      const admin = await apiService.setupAdmin(name, timezone);
      setCurrentUser(admin);
      setUsers([admin]);
      setSelectedTimezone(timezone);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup admin';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    try {
      setLoading(true);
      setSelectedTimezone(timezone);
      
      // Reload events with new timezone
      const eventsData = await apiService.getEvents(timezone);
      setEvents(eventsData);
      
      // Update current user's timezone if they're not admin
      if (currentUser && !currentUser.isAdmin) {
        await apiService.updateProfileTimezone(currentUser._id, timezone);
        setCurrentUser({ ...currentUser, timezone });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update timezone';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 border border-purple-200">
          <h1 className="text-2xl font-bold text-center mb-6 text-purple-900">Event Management System</h1>
          <h2 className="text-xl font-semibold mb-4 text-purple-800">Admin Setup</h2>
          <p className="text-gray-600 mb-6">
            Welcome! Please set up an admin account to get started.
          </p>
          <AdminSetupForm onSubmit={handleAdminSetup} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-50 shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-purple-900">Event Management System</h1>
              <p className="text-sm text-gray-600">
                Welcome, {currentUser.name} {currentUser.isAdmin && '(Admin)'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <EventManagement 
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
            />
          </div>
          <div>
                <EventList 
                  setEditingEvent={setEditingEvent}
                />
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminSetupForm({ onSubmit, isLoading }: { onSubmit: (name: string, timezone: string) => void; isLoading: boolean }) {
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), timezone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Admin Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
          placeholder="Enter admin name"
          required
        />
      </div>
      
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Asia/Shanghai">Shanghai</option>
        </select>
      </div>

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Setting up...' : 'Setup Admin Account'}
        </button>
    </form>
  );
}
