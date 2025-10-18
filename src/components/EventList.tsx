'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventList({ editingEvent, setEditingEvent }: { editingEvent: Event | null; setEditingEvent: (event: Event | null) => void }) {
  const { events, setEvents, currentUser, selectedTimezone, setSelectedTimezone, setLoading, setError } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);

  useEffect(() => {
    loadEvents();
  }, [selectedTimezone]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiService.getEvents(selectedTimezone);
      setEvents(eventsData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
          setError(errorMessage);
        } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const logs = await apiService.getEventLogs(event._id, selectedTimezone);
      setEventLogs(logs);
    } catch (error: unknown) {
      console.error('Failed to load event logs:', error);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleViewLogs = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const logs = await apiService.getEventLogs(event._id, selectedTimezone);
      setEventLogs(logs);
    } catch (error: unknown) {
      console.error('Failed to load event logs:', error);
    }
  };

  const formatDateTime = (dateString: string, timezone: string) => {
    return dayjs(dateString).tz(timezone).format('MMM DD, YYYY');
  };

  const formatTime = (dateString: string, timezone: string) => {
    return dayjs(dateString).tz(timezone).format('h:mm A');
  };

  const formatFullDateTime = (dateString: string, timezone: string) => {
    return dayjs(dateString).tz(timezone).format('MMM DD, YYYY [at] h:mm A');
  };

  const getEventStatus = (event: Event) => {
    const now = dayjs();
    const start = dayjs(event.startDate);
    const end = dayjs(event.endDate);

    if (now.isBefore(start)) {
      return { status: 'upcoming', color: 'bg-purple-100 text-purple-800' };
    } else if (now.isAfter(end)) {
      return { status: 'completed', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'ongoing', color: 'bg-green-100 text-green-800' };
    }
  };

  const filteredEvents = events.filter(event => 
    event.profiles.some((profile: any) => profile._id === currentUser?._id)
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Events</h2>
      
      {/* Timezone Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">View in Timezone</label>
        <select
          value={selectedTimezone}
          onChange={(e) => {
            setSelectedTimezone(e.target.value);
          }}
          className="w-full px-3 py-2 bg-purple-100 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
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
      
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events assigned to you</p>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            return (
              <div
                key={event._id}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                {/* Event Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{event.title}</h3>

                {/* Participants */}
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {event.profiles.map((profile: any) => profile.name).join(', ')}
                  </span>
                </div>

                {/* Start Date & Time */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">Start: {formatDateTime(event.startDate, selectedTimezone)}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">{formatTime(event.startDate, selectedTimezone)}</span>
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">End: {formatDateTime(event.endDate, selectedTimezone)}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-6">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">{formatTime(event.endDate, selectedTimezone)}</span>
                  </div>
                </div>

                {/* Event Metadata */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p>Created: {formatFullDateTime(event.createdAt, selectedTimezone)}</p>
                  <p>Updated: {formatFullDateTime(event.updatedAt, selectedTimezone)}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewLogs(event)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">View Logs</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedEvent.description && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Start Time</h3>
                  <p className="text-gray-600">
                    {formatDateTime(selectedEvent.startDate, selectedTimezone)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">End Time</h3>
                  <p className="text-gray-600">
                    {formatDateTime(selectedEvent.endDate, selectedTimezone)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Assigned Profiles</h3>
                <div className="space-y-2">
                  {selectedEvent.profiles.map((profile: any) => (
                    <div
                      key={profile._id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">
                            {profile.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{profile.name}</span>
                          {profile.isAdmin && (
                            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Timezone: {profile.timezone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Event Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Timezone:</span> {selectedEvent.timezone}</p>
                  <p><span className="font-medium">Created by:</span> {selectedEvent.createdBy.name}</p>
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDateTime(selectedEvent.createdAt, selectedTimezone)}
                  </p>
                  <p>
                    <span className="font-medium">Last updated:</span>{' '}
                    {formatDateTime(selectedEvent.updatedAt, selectedTimezone)}
                  </p>
                </div>
              </div>

              {/* Event Logs */}
              {eventLogs.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Update History</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {eventLogs.map((log) => (
                      <div key={log._id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Updated by {log.updatedBy.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(log.timestamp, selectedTimezone)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {log.changes.map((change: any) => (
                            <div key={`${log._id}-${change.field}`} className="text-sm">
                              <span className="font-medium text-gray-700">{change.field}:</span>{' '}
                              <span className="text-red-600 line-through">{String(change.oldValue)}</span>
                              {' → '}
                              <span className="text-green-600">{String(change.newValue)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
