# Event Management System

A full-stack MERN application built with Next.js for managing events across multiple users and timezones.

## Features

- **Profile Management**: Admin can create multiple user profiles
- **Event Creation**: Create events for one or multiple profiles with timezone support
- **Multi-timezone Support**: All events display according to user's selected timezone
- **Event Updates**: Users can view and update events assigned to them
- **Event Logging**: Track all event changes with timestamps (bonus feature)
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MongoDB with Mongoose
- **State Management**: Zustand
- **Timezone Management**: Day.js
- **Authentication**: Simple session-based (for demo purposes)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-management
   PORT=5000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the `MONGODB_URI` to point to your MongoDB Atlas cluster.

## Running the Application

### Option 1: Run both frontend and backend together
```bash
npm run dev:full
```

### Option 2: Run separately

**Backend (Express.js server):**
```bash
npm run dev:server
```

**Frontend (Next.js):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Initial Setup**: When you first visit the application, you'll be prompted to create an admin account.

2. **Create Profiles**: As an admin, you can create multiple user profiles from the "User Profiles" section.

3. **Create Events**: 
   - Click "Create Event" to add a new event
   - Select one or more profiles to assign the event to
   - Choose the event timezone
   - Set start and end dates/times
   - The system validates that end time is after start time

4. **View Events**: Users can view all events assigned to them in the "My Events" section.

5. **Update Events**: Click on any event to view details and update information.

6. **Timezone Management**: Users can change their timezone, and all events will automatically convert to display in the new timezone.

## API Endpoints

### Authentication
- `POST /api/auth/setup` - Create admin account
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - Get all profiles
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id/timezone` - Update profile timezone
- `GET /api/profiles/:id` - Get profile by ID

### Events
- `GET /api/events` - Get all events
- `GET /api/events/user/:userId` - Get events for specific user
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/:id/logs` - Get event update logs

## Project Structure

```
event-management-system/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── services/           # API service functions
│   └── store/              # Zustand state management
├── models/                 # MongoDB models
├── routes/                 # Express.js API routes
├── server.js              # Express.js server
└── package.json
```

## Key Features Implementation

### Multi-timezone Support
- All dates are stored in UTC in the database
- Frontend converts dates to user's selected timezone using Day.js
- Event creation and updates respect the selected timezone
- Timezone changes automatically update all displayed timestamps

### Event Validation
- End date/time must be after start date/time
- All date inputs are validated before submission
- Timezone-aware date comparisons

### Event Logging (Bonus Feature)
- All event updates are logged with:
  - Changed fields (old vs new values)
  - User who made the change
  - Timestamp in user's timezone
- Logs are displayed in event details modal

## Development

### Adding New Features
1. Backend: Add new routes in `/routes/` directory
2. Frontend: Add new components in `/src/components/`
3. State: Update Zustand store in `/src/store/useStore.ts`
4. API: Add service functions in `/src/services/api.ts`

### Database Schema
- **Users**: name, timezone, isAdmin, timestamps
- **Events**: title, description, profiles, timezone, startDate, endDate, createdBy, timestamps
- **EventLogs**: eventId, updatedBy, changes, userTimezone, timestamp

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and the connection string is correct
2. **Port Conflicts**: Change the PORT in `.env.local` if 5000 is already in use
3. **Timezone Issues**: Verify that Day.js timezone plugin is properly loaded

## License

This project is for demonstration purposes.