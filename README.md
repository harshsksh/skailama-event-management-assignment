# 🎯 Event Management System

A comprehensive full-stack web application built with modern technologies for managing events across multiple users and timezones. This project demonstrates advanced React patterns, real-time state management, and robust backend architecture.

## 🚀 Live Demo

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:5000

## ✨ Key Features

### 🎨 **Modern UI/UX Design**
- **Consistent Purple Theme**: Professional, cohesive design across all components
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Interactive Components**: Dropdowns, modals, and real-time updates
- **Accessibility**: Proper focus states, keyboard navigation, and ARIA labels

### 👥 **Advanced Profile Management**
- **Multi-User Support**: Create unlimited user profiles
- **Admin Controls**: Admin can manage all profiles and events
- **Profile Dropdown**: Searchable dropdown with real-time profile creation
- **Timezone Per Profile**: Individual timezone settings for each user

### 📅 **Comprehensive Event Management**
- **Multi-Profile Events**: Assign events to multiple users simultaneously
- **Timezone-Aware**: All events respect user timezones
- **Date/Time Validation**: Smart validation ensuring logical event timing
- **Event Editing**: Full CRUD operations with modal-based editing
- **Event Logging**: Complete audit trail of all changes (bonus feature)

### 🔄 **Real-Time State Management**
- **Zustand Store**: Centralized state management
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth loading indicators throughout

## 🛠️ Tech Stack

### **Frontend Technologies**
- **Next.js 15** - Latest React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS 4** - Modern utility-first CSS framework
- **Zustand** - Lightweight state management
- **Day.js** - Modern date/time manipulation with timezone support

### **Backend Technologies**
- **Express.js 5** - Latest Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Mongoose 8** - Modern MongoDB object modeling
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Nodemon** - Auto-restart development server
- **Concurrently** - Run multiple commands simultaneously
- **Turbopack** - Next.js fast bundler

## 📊 Database Schema

### **User Model**
```javascript
{
  name: String (required, trimmed),
  timezone: String (default: 'UTC', required),
  isAdmin: Boolean (default: false),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### **Event Model**
```javascript
{
  title: String (required, trimmed),
  description: String (optional, trimmed),
  profiles: [ObjectId] (ref: 'User', required),
  timezone: String (required, default: 'UTC'),
  startDate: Date (required),
  endDate: Date (required),
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-updated)
}
```

### **EventLog Model** (Bonus Feature)
```javascript
{
  eventId: ObjectId (ref: 'Event', required),
  updatedBy: ObjectId (ref: 'User', required),
  changes: [{
    field: String (required),
    oldValue: Mixed,
    newValue: Mixed
  }],
  userTimezone: String (required),
  timestamp: Date (auto-generated)
}
```

## 🚀 Quick Start Guide

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd event-management-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-management
   PORT=5000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Ensure MongoDB is running locally or update `MONGODB_URI` for MongoDB Atlas.

### **Running the Application**

#### **Option 1: Full Stack (Recommended)**
```bash
npm run dev:full
```
This runs both frontend and backend simultaneously.

#### **Option 2: Separate Services**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev
```

## 🎯 Application Workflow

### **1. Initial Setup**
- First-time users create an admin account
- System validates admin creation and sets up initial state

### **2. Profile Management**
- Admin creates multiple user profiles
- Each profile has individual timezone settings
- Searchable profile dropdown with real-time creation

### **3. Event Creation**
- Select multiple profiles for event assignment
- Choose event timezone (independent of user timezones)
- Set start and end dates/times with validation
- System ensures end time is after start time

### **4. Event Management**
- View events assigned to current user
- Edit events with pre-populated modal forms
- View complete event history and logs
- Timezone-aware display of all timestamps

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/setup` - Create admin account
- `GET /api/auth/me` - Get current user information

### **Profile Management**
- `GET /api/profiles` - Retrieve all user profiles
- `POST /api/profiles` - Create new user profile
- `PUT /api/profiles/:id/timezone` - Update profile timezone
- `GET /api/profiles/:id` - Get specific profile details

### **Event Management**
- `GET /api/events` - Get all events (with timezone conversion)
- `GET /api/events/user/:userId` - Get events for specific user
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update existing event
- `GET /api/events/:id` - Get specific event details
- `GET /api/events/:id/logs` - Get event update history

## 🏗️ Project Architecture

```
event-management-system/
├── 📁 src/
│   ├── 📁 app/                    # Next.js 15 App Router
│   │   ├── page.tsx              # Main dashboard
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── 📁 components/            # React components
│   │   ├── EventManagement.tsx   # Event creation/editing
│   │   ├── EventList.tsx         # Event display and management
│   │   ├── ProfileDropdown.tsx   # Profile selection dropdown
│   │   └── ProfileManagement.tsx # Profile management (legacy)
│   ├── 📁 services/             # API service layer
│   │   └── api.ts                # Centralized API calls
│   └── 📁 store/                 # State management
│       └── useStore.ts           # Zustand store
├── 📁 models/                    # MongoDB schemas
│   ├── User.js                   # User/Profile model
│   ├── Event.js                  # Event model
│   └── EventLog.js               # Event logging model
├── 📁 routes/                    # Express.js API routes
│   ├── auth.js                   # Authentication routes
│   ├── profiles.js               # Profile management routes
│   └── events.js                 # Event management routes
├── server.js                     # Express.js server
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🎨 Design System

### **Color Palette**
- **Primary**: Purple-600 (#9333ea)
- **Secondary**: Purple-700 (#7c3aed)
- **Accent**: Purple-500 (#a855f7)
- **Background**: Purple-100 (#f3e8ff)
- **Text**: Gray-900 (#111827)

### **Component Patterns**
- **Consistent Spacing**: Tailwind's spacing scale
- **Hover States**: Smooth transitions (200ms)
- **Focus States**: Purple ring indicators
- **Loading States**: Skeleton loaders and spinners
- **Error States**: Red-50 backgrounds with clear messaging

## 🔧 Advanced Features

### **Timezone Management**
- All dates stored in UTC in database
- Frontend converts to user's selected timezone using Day.js
- Real-time timezone switching without page reload
- Event creation respects selected timezone

### **Event Validation**
- Client-side validation for immediate feedback
- Server-side validation for data integrity
- Timezone-aware date comparisons
- End date must be after start date validation

### **Event Logging System** (Bonus Feature)
- Automatic logging of all event changes
- Tracks field-level changes (old vs new values)
- Records user who made changes
- Stores timestamp in user's timezone
- Displays in chronological order in event details

### **State Management**
- Centralized Zustand store for global state
- Optimistic updates for better UX
- Error boundary handling
- Loading state management

## 🧪 Development Guidelines

### **Code Quality**
- TypeScript for type safety
- ESLint for code linting
- Consistent naming conventions
- Component-based architecture

### **Adding New Features**
1. **Backend**: Add routes in `/routes/` directory
2. **Frontend**: Create components in `/src/components/`
3. **State**: Update Zustand store in `/src/store/useStore.ts`
4. **API**: Add service functions in `/src/services/api.ts`

### **Testing Considerations**
- All API endpoints return proper HTTP status codes
- Error handling with user-friendly messages
- Input validation on both client and server
- Timezone conversion accuracy

## 🐛 Troubleshooting

### **Common Issues**

1. **MongoDB Connection**
   ```bash
   # Ensure MongoDB is running
   mongod
   
   # Or use MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management
   ```

2. **Port Conflicts**
   ```bash
   # Change port in .env.local
   PORT=5001
   ```

3. **Dependencies Issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Timezone Issues**
   - Verify Day.js timezone plugin is loaded
   - Check timezone string format (e.g., 'America/New_York')

## 📈 Performance Optimizations

- **Next.js Turbopack**: Fast bundling and hot reloading
- **Concurrent Rendering**: React 19 concurrent features
- **Optimistic Updates**: Immediate UI feedback
- **Efficient State Management**: Zustand's minimal re-renders
- **Database Indexing**: Optimized MongoDB queries

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Both client and server-side validation
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Sensitive data protection

## 🎯 Why This Project Stands Out

### **Technical Excellence**
- **Modern Stack**: Latest versions of React, Next.js, and Express
- **Type Safety**: Full TypeScript implementation
- **Clean Architecture**: Separation of concerns and modular design
- **Performance**: Optimized for speed and user experience

### **User Experience**
- **Intuitive Design**: Clean, professional interface
- **Real-time Updates**: Immediate feedback on user actions
- **Accessibility**: Proper focus management and keyboard navigation
- **Responsive**: Works seamlessly on all device sizes

### **Code Quality**
- **Maintainable**: Well-structured, documented code
- **Scalable**: Easy to extend with new features
- **Robust**: Comprehensive error handling and validation
- **Professional**: Production-ready code standards

## 📝 License

This project is created for demonstration purposes and showcases modern full-stack development practices.

---

**Built with ❤️ using Next.js, React, Express.js, and MongoDB**