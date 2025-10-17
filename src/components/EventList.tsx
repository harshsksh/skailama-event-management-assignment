'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventList() {
  const { events, setEvents, currentUser, selectedTimezone, setLoading, setError } = useStore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventLogs, setEventLogs] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
  }, [selectedTimezone]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiService.getEvents(selectedTimezone);
      setEvents(eventsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: any) => {
    setSelectedEvent(event);
    try {
      const logs = await apiService.getEventLogs(event._id, selectedTimezone);
      setEventLogs(logs);
    } catch (error: any) {
      console.error('Failed to load event logs:', error);
    }
  };

  const formatDateTime = (dateString: string, timezone: string) => {
    return dayjs(dateString).tz(timezone).format('MMM DD, YYYY [at] h:mm A');
  };

  const getEventStatus = (event: any) => {
    const now = dayjs();
    const start = dayjs(event.startDate);
    const end = dayjs(event.endDate);

    if (now.isBefore(start)) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' };
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Events</h2>
      
      {filteredEvents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No events assigned to you</p>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            return (
              <div
                key={event._id}
                onClick={() => handleEventClick(event)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                    {status.status}
                  </span>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                )}
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">Start:</span>{' '}
                    {formatDateTime(event.startDate, selectedTimezone)}
                  </p>
                  <p>
                    <span className="font-medium">End:</span>{' '}
                    {formatDateTime(event.endDate, selectedTimezone)}
                  </p>
                  <p>
                    <span className="font-medium">Timezone:</span> {event.timezone}
                  </p>
                  <p>
                    <span className="font-medium">Created by:</span> {event.createdBy.name}
                  </p>
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
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.profiles.map((profile: any) => (
                    <span
                      key={profile._id}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {profile.name}
                    </span>
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
                    {eventLogs.map((log, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Updated by {log.updatedBy.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(log.timestamp, selectedTimezone)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {log.changes.map((change: any, changeIndex: number) => (
                            <div key={changeIndex} className="text-sm">
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
