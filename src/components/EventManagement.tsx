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
    if (!formData.title || !formData.profiles.length || !formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields including start and end times');
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

      {isCreating && (
        <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-6">
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

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Assign to Profiles <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">Select the users who should participate in this event</p>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 bg-white">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.profiles.includes(user._id)}
                      onChange={() => handleProfileToggle(user._id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {user.name} {user.isAdmin && <span className="text-blue-600 text-xs font-semibold">(Admin)</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Zone</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Event Time Zone <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">Select the time zone in which the event will take place</p>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
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
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Date and Time</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Start Date and Time <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">End Date and Time <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-base font-medium"
            >
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 text-base font-medium border-2 border-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
