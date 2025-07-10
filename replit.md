# EventConnect - Mobile Event Discovery App

## Overview

EventConnect is a mobile-first event discovery and management platform that allows users to find, create, and participate in local events. Built with React, Express, and PostgreSQL, it features a clean mobile interface with authentication, event management, and social features. The app includes an interest selection system where users can choose up to 3 interests to display on their profile and share with other users.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions
- **API Design**: RESTful endpoints with JSON responses

### Mobile-First Design
- **Target**: Maximum width of 384px (sm breakpoint)
- **Layout**: Bottom navigation with tab-based interface
- **Components**: Touch-friendly UI with proper spacing
- **Responsive**: Optimized for mobile devices

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: PostgreSQL-based session store
- **User Management**: Automatic user creation/updates
- **Security**: HTTP-only cookies with secure flags

### Event Management
- **Categories**: Music, Sports, Arts, Food, Tech
- **RSVP System**: Attending/maybe/not attending statuses
- **Pricing**: Free and paid events support
- **Location**: Address-based event locations
- **Images**: Event image upload capabilities

### Database Schema
- **Users**: Profile information with anime avatar seeds
- **Events**: Complete event details with pricing
- **RSVPs**: User event participation tracking
- **Sessions**: Authentication session storage

### UI Components
- **AnimeAvatar**: Consistent avatar generation
- **EventCard**: Event display with status indicators and organizer interests
- **CategoryFilter**: Event filtering by category
- **BottomNav**: Mobile navigation interface
- **CreateEvent**: Event creation modal
- **InterestSelector**: User interest selection (up to 3 interests)

## Data Flow

### Event Discovery
1. User selects category filter
2. Frontend queries `/api/events` with category parameter
3. Backend retrieves events from database with user RSVP status
4. Events displayed in mobile-optimized cards

### Event Creation
1. User fills out event creation form
2. Form validation using Zod schemas
3. POST request to `/api/events` with event data
4. Database insertion and immediate UI update

### RSVP Management
1. User interacts with RSVP buttons
2. POST request to `/api/events/:id/rsvp`
3. Database update for user's RSVP status
4. UI reflects new status immediately

## External Dependencies

### Database
- **Provider**: Neon PostgreSQL (serverless)
- **Connection**: Connection pooling with @neondatabase/serverless
- **Migrations**: Drizzle Kit for schema management

### Authentication
- **Provider**: Replit Auth service
- **Configuration**: OIDC discovery with environment variables
- **Session**: PostgreSQL session store with TTL

### UI Framework
- **Components**: Extensive Shadcn/UI component library
- **Icons**: Lucide React icons
- **Animations**: Framer Motion for transitions

## Deployment Strategy

### Development
- **Server**: Express with Vite middleware
- **Hot Reload**: Vite HMR for frontend changes
- **Database**: Direct connection to development database
- **Environment**: NODE_ENV=development

### Production
- **Build Process**: Vite build for frontend, esbuild for backend
- **Static Files**: Served directly by Express
- **Database**: Production PostgreSQL connection
- **Environment**: NODE_ENV=production

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit authentication identifier
- `ISSUER_URL`: OIDC issuer endpoint

## Mobile App Development

### Capacitor Integration
- **Framework**: Capacitor for native mobile app development
- **App ID**: com.eventconnect.app
- **Build Directory**: dist/ (web build output)
- **Platforms**: Android and iOS support

### Mobile Features
- **Core Plugins**: App state, haptics, keyboard, status bar, splash screen
- **Event Features**: Geolocation, camera, share, push notifications, filesystem
- **Touch Optimized**: Already mobile-first design works perfectly
- **Native Performance**: Web app wrapped in native container

### Development Commands
- Build web app: `npm run build`
- Add platforms: `npx cap add android/ios`
- Sync builds: `npx cap sync`
- Run on device: `npx cap run android/ios`
- Open in IDE: `npx cap open android/ios`

### Publishing Ready
- Google Play Store: Build signed APK in Android Studio
- Apple App Store: Build in Xcode and upload to App Store Connect
- Configuration files: capacitor.config.ts, mobile-setup.md

## Changelog

- July 09, 2025. Fixed RSVP system to show events in MyEvents page when RSVPed from Browse page
- July 09, 2025. Added RSVP → EventContent navigation from all pages (Browse, MyEvents, Home)
- July 09, 2025. Implemented tab preference memory in EventContent (remembers last active tab)
- July 09, 2025. Added Capacitor for native mobile app development with Android/iOS support
- July 09, 2025. Redesigned home page with Bumble-style swipe interface, moved scrolling list to Browse page
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.