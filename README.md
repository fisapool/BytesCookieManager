# Cookie Manager Web Application

## Overview
A full-stack web application for managing browser cookies with a modern React frontend and Express backend. The application provides a secure and efficient way to handle cookie operations.

## Features
- 🔄 **Cookie Management**
  - Export and import cookies
  - Secure cookie handling
  - Validation and error checking
  - Support for various cookie formats

- 🎨 **Modern UI/UX**
  - Clean, responsive interface
  - Real-time feedback
  - Error notifications
  - Loading states

- 🔒 **Security**
  - Local operations
  - Secure cookie validation
  - Error boundaries
  - Type-safe operations

## Tech Stack
- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Radix UI Components
  - React Query

- **Backend**:
  - Express.js
  - Node.js
  - TypeScript
  - PostgreSQL (via Drizzle ORM)
  - WebSocket support

## Prerequisites
- Node.js 20.x or higher
- NPM or Yarn package manager
- PostgreSQL database

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Ensure DATABASE_URL is set for PostgreSQL connection

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

## Project Structure
```
/
├── client/               # Frontend React application
│   ├── public/          # Static assets
│   └── src/             # React source code
├── server/              # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database operations
├── shared/             # Shared types and utilities
└── migrations/         # Database migrations
```

## Features In Progress
- **User Authentication**: Secure login and registration system
- **Automatic Updates**: Extension updates using Chrome Web Store or custom update server
- **Automatic Sync**: Real-time cookie synchronization
- **Custom Dialogs**: Enhanced alert and confirmation system
- **Notifications**: Cookie expiration alerts
- **Feedback System**: In-app user feedback collection
- **Customizable Themes**: User-defined color schemes
- **Header Settings**: Improved settings accessibility

## Auto-Update Configuration
The extension supports automatic updates through Chrome's built-in update system. For development:

1. **Chrome Web Store Updates**: 
   - Upload your extension to Chrome Web Store
   - Chrome will automatically check for updates

2. **Self-Hosted Updates (Development)**:
   - Deploy update manifest on Replit
   - Add `"update_url": "https://your-repl.replit.dev/updates.xml"` to manifest.json
   - Host versioned extension files on your Replit deployment


## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

## API Endpoints
The server runs on port 5000 and includes:
- Cookie management endpoints
- User authentication
- WebSocket connections for real-time updates

## Deployment
The application is configured for deployment on Replit:
- Auto-scaling support
- Production build optimization
- Secure environment variable handling

## Notes
- The server always runs on port 5000
- Both API and client are served from the same port
- WebSocket support is included for real-time features

## License
MIT License