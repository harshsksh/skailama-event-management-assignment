'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventManagement() {
  const { users, currentUser, addEvent, setLoading, setError, selectedTimezone } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profiles: [] as string[],
    timezone: selectedTimezone,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.profiles.length || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime}`).tz(formData.timezone);
      const endDateTime = dayjs(`${formData.endDate} ${formData.endTime}`).tz(formData.timezone);

      if (endDateTime.isBefore(startDateTime)) {
        setError('End date/time must be after start date/time');
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        profiles: formData.profiles,
        timezone: formData.timezone,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        createdBy: currentUser!._id,
      };

      const newEvent = await apiService.createEvent(eventData);
      addEvent(newEvent);
      resetForm();
      setIsCreating(false);
    } catch (error: any) {
      setError(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      setLoading(true);
      
      // Combine date and time
      const startDateTime = dayjs(`${formData.startDate} ${formData.startTime}`).tz(formData.timezone);
      const endDateTime = dayjs(`${formData.endDate} ${formData.endTime}`).tz(formData.timezone);

      if (endDateTime.isBefore(startDateTime)) {
        setError('End date/time must be after start date/time');
        return;
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        profiles: formData.profiles,
        timezone: formData.timezone,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        updatedBy: currentUser!._id,
        userTimezone: selectedTimezone,
      };

      await apiService.updateEvent(editingEvent._id, updateData);
      resetForm();
      setEditingEvent(null);
    } catch (error: any) {
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
      startTime: '',
      endDate: '',
      endTime: '',
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

  const handleEditEvent = (event: any) => {
    const startDateTime = dayjs(event.startDate).tz(event.timezone);
    const endDateTime = dayjs(event.endDate).tz(event.timezone);
    
    setFormData({
      title: event.title,
      description: event.description || '',
      profiles: event.profiles.map((p: any) => p._id),
      timezone: event.timezone,
      startDate: startDateTime.format('YYYY-MM-DD'),
      startTime: startDateTime.format('HH:mm'),
      endDate: endDateTime.format('YYYY-MM-DD'),
      endTime: endDateTime.format('HH:mm'),
    });
    setEditingEvent(event);
    setIsCreating(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setEditingEvent(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingEvent ? 'Edit Event' : 'Event Management'}
        </h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Event
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter event description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Profiles *
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.profiles.includes(user._id)}
                    onChange={() => handleProfileToggle(user._id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {user.name} {user.isAdmin && '(Admin)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
