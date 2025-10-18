import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  timezone: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  profiles: User[];
  timezone: string;
  startDate: string;
  endDate: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface EventLog {
  _id: string;
  eventId: string;
  updatedBy: User;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  userTimezone: string;
  timestamp: string;
}

interface AppState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Users/Profiles
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  
  // Events
  events: Event[];
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  
  // Event logs
  eventLogs: EventLog[];
  setEventLogs: (logs: EventLog[]) => void;
  
  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Selected timezone for display
  selectedTimezone: string;
  setSelectedTimezone: (timezone: string) => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // Current user
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      
      // Users/Profiles
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (userId, updates) =>
        set((state) => ({
          users: state.users.map((user) =>
            user._id === userId ? { ...user, ...updates } : user
          ),
        })),
      
      // Events
      events: [],
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (eventId, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event._id === eventId ? { ...event, ...updates } : event
          ),
        })),
      
      // Event logs
      eventLogs: [],
      setEventLogs: (logs) => set({ eventLogs: logs }),
      
      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      
      // Selected timezone
      selectedTimezone: 'UTC',
      setSelectedTimezone: (timezone) => set({ selectedTimezone: timezone }),
    }),
    {
      name: 'event-management-store',
    }
  )
);
