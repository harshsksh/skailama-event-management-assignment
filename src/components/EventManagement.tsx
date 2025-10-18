'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore, User } from '@/store/useStore';
import { apiService } from '@/services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventManagement({ editingEvent, setEditingEvent }: { editingEvent: any; setEditingEvent: (event: any) => void }) {
  const { users, currentUser, addUser, addEvent, setEvents, setLoading, setError, selectedTimezone } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profiles: [] as string[],
    timezone: selectedTimezone,
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '09:00',
  });

  // Profile dropdown states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileSearchTerm, setProfileSearchTerm] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
        setProfileSearchTerm('');
        setIsCreatingProfile(false);
        setNewProfileName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle editing event
  useEffect(() => {
    if (editingEvent) {
      const startDateTime = dayjs(editingEvent.startDate).tz(editingEvent.timezone);
      const endDateTime = dayjs(editingEvent.endDate).tz(editingEvent.timezone);
      
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        profiles: editingEvent.profiles.map((p: any) => p._id),
        timezone: editingEvent.timezone,
        startDate: startDateTime.format('YYYY-MM-DD'),
        startTime: startDateTime.format('HH:mm'),
        endDate: endDateTime.format('YYYY-MM-DD'),
        endTime: endDateTime.format('HH:mm'),
      });
      setIsCreating(true);
    }
  }, [editingEvent]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.profiles.length || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate current user exists and has valid ID
    if (!currentUser || !currentUser._id) {
      setError('No current user found. Please refresh the page and try again.');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time with validation
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime || '00:00'}`);
      const endDateTime = dayjs(`${formData.endDate} ${formData.endTime || '23:59'}`);
      
      if (!startDateTime.isValid() || !endDateTime.isValid()) {
        setError('Invalid date or time format');
        return;
      }
      
      // Convert to selected timezone
      const startInTz = startDateTime.tz(formData.timezone);
      const endInTz = endDateTime.tz(formData.timezone);

      if (endInTz.isBefore(startInTz)) {
        setError('End date/time must be after start date/time');
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        profiles: formData.profiles,
        timezone: formData.timezone,
        startDate: startInTz.toISOString(),
        endDate: endInTz.toISOString(),
        createdBy: currentUser._id,
      };

      console.log('Creating event with data:', eventData);
      console.log('Current user:', currentUser);
      console.log('CreatedBy ID:', currentUser._id, 'Type:', typeof currentUser._id);
      const newEvent = await apiService.createEvent(eventData);
      addEvent(newEvent);
      resetForm();
      setIsCreating(false);
    } catch (error: any) {
      console.error('Event creation error:', error);
      setError(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!formData.title || !formData.profiles.length || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate current user exists and has valid ID
    if (!currentUser || !currentUser._id) {
      setError('No current user found. Please refresh the page and try again.');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time with validation
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime || '00:00'}`);
      const endDateTime = dayjs(`${formData.endDate} ${formData.endTime || '23:59'}`);
      
      if (!startDateTime.isValid() || !endDateTime.isValid()) {
        setError('Invalid date or time format');
        return;
      }
      
      // Convert to selected timezone
      const startInTz = startDateTime.tz(formData.timezone);
      const endInTz = endDateTime.tz(formData.timezone);

      if (endInTz.isBefore(startInTz)) {
        setError('End date/time must be after start date/time');
        return;
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        profiles: formData.profiles,
        timezone: formData.timezone,
        startDate: startInTz.toISOString(),
        endDate: endInTz.toISOString(),
        updatedBy: currentUser._id,
        userTimezone: selectedTimezone,
      };

      console.log('Updating event with data:', updateData);
      await apiService.updateEvent(editingEvent._id, updateData);
      
      // Reload events to get updated data
      const eventsData = await apiService.getEvents(selectedTimezone);
      setEvents(eventsData);
      
      resetForm();
      setIsCreating(false);
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Event update error:', error);
      setError(error.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      profiles: [],
      timezone: selectedTimezone,
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '09:00',
    });
  };

  const handleProfileToggle = (profileId: string) => {
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter(id => id !== profileId)
        : [...prev.profiles, profileId]
    }));
  };

  const handleCreateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      setLoading(true);
      console.log('Creating profile:', newProfileName.trim(), 'with timezone:', selectedTimezone);
      const newProfile = await apiService.createProfile(newProfileName.trim(), selectedTimezone) as User;
      console.log('Profile created successfully:', newProfile);
      addUser(newProfile);
      
      // Automatically select the newly created profile
      setFormData(prev => ({
        ...prev,
        profiles: [...prev.profiles, newProfile._id]
      }));
      
      setNewProfileName('');
      setIsCreatingProfile(false);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      setError(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setEditingEvent(null);
  };

  // Filter profiles based on search term
  const filteredProfiles = users.filter(user =>
    user.name.toLowerCase().includes(profileSearchTerm.toLowerCase())
  );

  // Get selected profile names
  const selectedProfiles = users.filter(user => formData.profiles.includes(user._id));

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {editingEvent ? 'Edit Event' : 'Event Management'}
        </h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-base font-medium"
          >
            Create Event
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {isCreating && !editingEvent && (
        <form onSubmit={handleCreateEvent} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter a descriptive title for your event"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                  rows={4}
                  placeholder="Provide additional details about the event"
                />
              </div>
            </div>
          </div>

          {/* Profiles Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profiles</h3>
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
              >
                <span className="text-gray-700">
                  {selectedProfiles.length > 0 
                    ? `${selectedProfiles.length} profile(s) selected` 
                    : 'Select profiles...'
                  }
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 float-right transition-transform duration-200 ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                          placeholder="Search profiles..."
                          value={profileSearchTerm}
                          onChange={(e) => setProfileSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Profile List */}
                    <div className="max-h-48 overflow-y-auto mb-4">
                      {filteredProfiles.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          {profileSearchTerm ? 'No profiles found' : 'No profiles available'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredProfiles.map((profile) => (
                            <label
                              key={profile._id}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                    <input
                      type="checkbox"
                                checked={formData.profiles.includes(profile._id)}
                                onChange={() => handleProfileToggle(profile._id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-xs">
                                    {profile.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                    <span className="text-sm font-medium text-gray-900">
                                  {profile.name} {profile.isAdmin && <span className="text-blue-600 text-xs">(Admin)</span>}
                    </span>
                              </div>
                  </label>
                ))}
              </div>
                      )}
                    </div>

                    {/* Add Profile Section */}
                    <div className="border-t pt-4">
                      {!isCreatingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsCreatingProfile(true)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Profile</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Profile Name
                            </label>
                            <input
                              type="text"
                              placeholder="Enter profile name..."
                              value={newProfileName}
                              onChange={(e) => setNewProfileName(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateProfile(e as any);
                                }
                              }}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={handleCreateProfile}
                              disabled={!newProfileName.trim()}
                              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Create
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingProfile(false);
                                setNewProfileName('');
                              }}
                              className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timezone Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timezone</h3>
            <div className="relative">
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 appearance-none"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (BST/GMT)</option>
                <option value="Europe/Paris">Paris (CEST/CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">Shanghai (CST)</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Start Date & Time Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Date & Time</h3>
                <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

          {/* End Date & Time Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">End Date & Time</h3>
                <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
              </div>
            </div>
          </div>

          {/* Create Event Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 text-base font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Event</span>
            </button>
          </div>
        </form>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
                <button
                  onClick={() => {
                    setEditingEvent(null);
                    resetForm();
                    setIsCreating(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateEvent} className="space-y-6">
                {/* Profiles Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profiles</label>
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="w-full px-4 py-2 bg-purple-100 border border-gray-300 rounded-lg hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                    >
                      <span className="text-gray-700">
                        {selectedProfiles.length > 0 
                          ? `${selectedProfiles.length} profiles selected` 
                          : 'Select profiles...'
                        }
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 float-right transition-transform duration-200 ${
                          isProfileDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                                placeholder="Search profiles..."
                                value={profileSearchTerm}
                                onChange={(e) => setProfileSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                              />
                            </div>
                          </div>

                          {/* Profile List */}
                          <div className="max-h-48 overflow-y-auto mb-4">
                            {filteredProfiles.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                {profileSearchTerm ? 'No profiles found' : 'No profiles available'}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filteredProfiles.map((profile) => (
                                  <label
                                    key={profile._id}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.profiles.includes(profile._id)}
                                      onChange={() => handleProfileToggle(profile._id)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-xs">
                                          {profile.name.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {profile.name} {profile.isAdmin && <span className="text-blue-600 text-xs">(Admin)</span>}
                                      </span>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add Profile Section */}
                          <div className="border-t pt-4">
                            {!isCreatingProfile ? (
                              <button
                                type="button"
                                onClick={() => setIsCreatingProfile(true)}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Profile</span>
                              </button>
                            ) : (
                              <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Name
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter profile name..."
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleCreateProfile(e as any);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={handleCreateProfile}
                                    disabled={!newProfileName.trim()}
                                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Create
            </button>
            <button
              type="button"
                                    onClick={() => {
                                      setIsCreatingProfile(false);
                                      setNewProfileName('');
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timezone Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (BST/GMT)</option>
                    <option value="Europe/Paris">Paris (CEST/CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                  </select>
                </div>

                {/* Start Date & Time Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* End Date & Time Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      resetForm();
                      setIsCreating(false);
                    }}
                    className="flex-1 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 text-base font-medium border border-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 text-base font-medium"
                  >
                    Update Event
            </button>
          </div>
        </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
