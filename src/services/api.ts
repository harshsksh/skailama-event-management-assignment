const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async setupAdmin(name: string, timezone: string = 'UTC') {
    return this.request('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ name, timezone }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Profile endpoints
  async getProfiles() {
    return this.request('/profiles');
  }

  async createProfile(name: string, timezone: string = 'UTC') {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, timezone }),
    });
  }

  async updateProfileTimezone(profileId: string, timezone: string) {
    return this.request(`/profiles/${profileId}/timezone`, {
      method: 'PUT',
      body: JSON.stringify({ timezone }),
    });
  }

  async getProfile(profileId: string) {
    return this.request(`/profiles/${profileId}`);
  }

  // Event endpoints
  async getEvents(userTimezone?: string) {
    const params = userTimezone ? `?timezone=${encodeURIComponent(userTimezone)}` : '';
    return this.request(`/events${params}`);
  }

  async getUserEvents(userId: string, userTimezone?: string) {
    const params = userTimezone ? `?timezone=${encodeURIComponent(userTimezone)}` : '';
    return this.request(`/events/user/${userId}${params}`);
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    profiles: string[];
    timezone: string;
    startDate: string;
    endDate: string;
    createdBy: string;
  }) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(
    eventId: string,
    updates: {
      title?: string;
      description?: string;
      profiles?: string[];
      timezone?: string;
      startDate?: string;
      endDate?: string;
      updatedBy: string;
      userTimezone: string;
    }
  ) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getEvent(eventId: string, userTimezone?: string) {
    const params = userTimezone ? `?timezone=${encodeURIComponent(userTimezone)}` : '';
    return this.request(`/events/${eventId}${params}`);
  }

  async getEventLogs(eventId: string, userTimezone?: string) {
    const params = userTimezone ? `?timezone=${encodeURIComponent(userTimezone)}` : '';
    return this.request(`/events/${eventId}/logs${params}`);
  }
}

export const apiService = new ApiService();
