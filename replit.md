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

- July 10, 2025. IMPLEMENTED SUBCATEGORY SYSTEM: Added comprehensive subcategory feature to events with dynamic CreateEvent form functionality. Database schema updated with subCategory field, existing events populated with appropriate subcategories (Art Workshop, Live Concert, Cooking Class, etc.), and UI components updated to display subcategories in EventCard, EventDetail, and EventContentCard components. CreateEvent form now shows category-specific subcategory options that reset when main category changes.
- July 10, 2025. REVOLUTIONIZED AI AVATAR GENERATION: Completely redesigned avatar generation system to use OpenAI DALL-E 3 for creating custom anime-style portraits directly from user descriptions. Replaced DiceBear seed-based approach with AI image generation that produces highly relevant, personalized avatars matching exact user specifications. System now generates unique anime-style portraits with clean backgrounds, perfect for profile pictures, ensuring complete alignment with user descriptions and app's aesthetic.
- July 10, 2025. COMPLETED AI AVATAR GENERATION: Fully implemented AI-powered avatar generation feature using OpenAI API. Users can now click their profile image anywhere in the app, describe their desired portrait, and generate custom avatars. Updated all AnimeAvatar components across the application to support custom avatar URLs. Added database schema for customAvatarUrl field, created AvatarUpdateModal component with preview functionality, and integrated avatar generation/update API endpoints.
- July 10, 2025. ENHANCED EVENTCARD CONFIRMATIONS: Implemented two-step confirmation dialogs for EventCard component's "Remove RSVP" and "Cancel Event" buttons, matching the same pattern used in EventDetail component. Users now receive contextual warning messages about consequences before confirming destructive actions, preventing accidental event cancellations or RSVP removals.
- July 10, 2025. REFINED PROFILE LAYOUT: Updated Event History section to display in 2-column grid layout with reduced gap spacing (gap-1), providing more compact and visually organized presentation of past events with better space utilization.
- July 10, 2025. COMPLETED MESSAGES TAB NAVIGATION FIX: Fixed critical navigation issue where clicking "Morning Yoga in Central Park" from Messages tab failed to load EventContent. Implemented robust fallback system that fetches specific events when not found in home page events array, ensuring seamless navigation from Messages tab to any group chat regardless of whether event is in swipe interface.
- July 10, 2025. FIXED GROUP CHAT EXIT SYSTEM: Enhanced getUserEventIds function to properly exclude events where users have left group chats from appearing in Messages tab, ensuring clean chat participation management with proper database-level filtering that respects both organizer and attendee left-chat states. Attending tab continues to show all RSVP'd events regardless of chat participation status.
- July 10, 2025. COMPLETED CHAT REJOIN FUNCTIONALITY: Implemented rejoin-chat API endpoint with EventDetail component integration showing "Rejoin Chat" button (green) when user has left chat, enabling seamless re-entry to group conversations while preserving RSVP status
- July 10, 2025. ENHANCED EXIT BUTTON FOR PAST EVENTS: Modified EventContentCard exit button logic to show for ALL participants (organizers and attendees) in past events, while maintaining current behavior for future events (non-organizers only), enabling users to leave group chats for events that have already concluded
- July 10, 2025. ENHANCED EVENT HISTORY SECTION: Updated Profile page Event History to show up to 6 past events (increased from 2) with smaller 8x8 icons (reduced from 12x12), combined hosted and attended events in single chronological list sorted by date descending (most recent first), with compact layout and reduced padding for better space utilization
- July 10, 2025. IMPLEMENTED HISTORICAL EVENTS FILTERING: Added pastOnly parameter to user events API allowing Profile page to display Event History section showing only past events user attended or organized, with updated UI labels "Hosted/Attended" and gray icons to distinguish from current events
- July 10, 2025. ADDED EXTERNAL WEB CRAWL API: Created `/api/external/events` endpoint for partners to post events from web crawl jobs without authentication, automatically handles organizer creation and includes comprehensive API documentation with examples
- July 10, 2025. ADDED EXIT GROUP CHAT BUTTON: Implemented exit button in EventContentCard header allowing users to leave group chats by removing their RSVP, with confirmation dialog and automatic navigation back to previous view (only visible to non-organizers)
- July 10, 2025. ENHANCED GROUP CHAT ACCESS: Updated EventDetail component to only show Group Chat button when user has RSVPed to event or is organizing it, improving user experience by preventing unauthorized chat access attempts
- July 10, 2025. EXPANDED MESSAGE HISTORY: Increased chat message limit from 50 to 1000 messages per event for comprehensive chat history, updated both backend storage and API routes with proper cache invalidation
- July 10, 2025. FIXED CRITICAL REACT LOOP: Resolved infinite useEffect loop in EventContentCard component by removing markEventAsRead from dependencies array, eliminating console warnings and performance issues
- July 10, 2025. FIXED CRITICAL BUG: Resolved WebSocket message broadcasting issue where wrong messages were being sent due to database query ordering problem. Implemented direct message retrieval by ID, ensuring correct real-time message delivery with complete user data. AUTO-READ functionality working perfectly to prevent self-notification badges.
- July 10, 2025. Successfully implemented complete real-time WebSocket messaging system with unread notification management - notifications clear when users enter event group chats, auto-refresh messages every 5 seconds while in chat, enhanced Messages Tab with up to 99+ notification badges, and smart WebSocket connection management that only connects when chat tab is active
- July 10, 2025. Fixed EventContent component to mark events as read both when entering the component and when switching to chat tab, ensuring unread notifications properly clear across all navigation paths
- July 10, 2025. Successfully fixed skipped events system - now properly updates both database AND React Query cache when events are skipped, ensuring persistent filtering across all navigation
- July 10, 2025. Added cache invalidation to handleSkipAnimationComplete to refresh events query after skipping, eliminating stale data display
- July 10, 2025. Successfully migrated skipped events system from localStorage to database storage with persistent tracking across sessions
- July 10, 2025. Added skippedEvents (array) and eventsShownSinceSkip (integer) fields to user schema with automatic reset after 20 events
- July 10, 2025. Implemented database-level filtering to exclude skipped events from getEvents query for improved performance
- July 10, 2025. Created API endpoints (/api/events/:id/skip, /api/events/increment-shown) for managing skipped events counter
- July 10, 2025. Updated Home page swipe handlers to use database API calls instead of localStorage state management
- July 10, 2025. Successfully implemented skipped events system with 20-event threshold before reappearing
- July 10, 2025. Enhanced My Events tab filtering to exclude user-organized events from "Attending" tab - events now only show in appropriate tabs (Organizing vs Attending)
- July 10, 2025. Confirmed Home page correctly filters out events user is organizing or attending - only shows new discovery events for swiping
- July 10, 2025. Successfully resized EventDetail modal from full-screen to centered card layout matching Home page proportions
- July 10, 2025. Removed all group chat access restrictions - now allows any authenticated user to join any event's group chat
- July 10, 2025. Updated server-side authentication checks to only verify event exists, not user permissions
- July 10, 2025. Simplified Group Chat button logic to show for all authenticated users on all events
- July 10, 2025. Successfully implemented event filtering in Home page swipe interface - now excludes events user is already attending or organizing to prevent duplicate interactions
- July 10, 2025. Successfully fixed organizer button priority in EventDetail - now correctly shows "Organizing" status for events user organizes, regardless of RSVP status (confirmed working)
- July 10, 2025. Updated button click behavior to prioritize organizer actions (cancel event) over RSVP actions (remove RSVP) when user is the organizer
- July 10, 2025. Implemented complete notification system with mark-as-read functionality - unread message indicators disappear when users view group chat messages, bell icon navigates to My Events Messages tab
- July 10, 2025. Fixed RSVP system - users can now properly remove and re-add RSVPs using separate POST/DELETE endpoints instead of status toggling
- July 10, 2025. Added comprehensive user data - created interests, personality traits, and AI signatures for all database users to ensure consistent signature display across all components
- July 10, 2025. Updated home page header to display user signature instead of interests, with proper styling and truncation for long signatures
- July 10, 2025. Fixed AI signature database storage - now saves generated signatures to user profile and displays persisted signature from database instead of local state
- July 10, 2025. Expanded personality options from 24 to 60 traits with diverse characteristics, reduced selection limit from 5 to 3 traits for more focused personality profiles
- July 10, 2025. Enhanced AI signature display by removing title/icon header and increasing text size from small to base for better readability and cleaner appearance
- July 10, 2025. Added AI-powered personal signature generation using OpenAI GPT-4o based on user's selected interests and personality traits, displayed in profile header with generate/regenerate functionality
- July 10, 2025. Expanded interests options from 10 to 59 diverse categories including outdoor activities, intellectual pursuits, creative hobbies, lifestyle interests, and professional development areas with scrollable compact grid layout
- July 10, 2025. Added comprehensive Personality section to Profile page with 24 personality traits, allowing users to select up to 5 traits that describe them best with emoji icons and purple-themed UI
- July 10, 2025. Fixed EventContent navigation from EventDetailCard to hide back button and show "Keep Exploring" button, while showing back button when entered from other pages (Browse, My Events, Messages)
- July 10, 2025. Enhanced Messages tab to show group chats for ALL events where user is attending OR organizing, with visual indicators and proper query invalidation
- July 10, 2025. Added 25 more events for the week starting July 9th with diverse timing (morning to evening) and comprehensive details across all categories
- July 10, 2025. Created 25 comprehensive sample events with detailed descriptions hosted by 5 new users (Fan Jiang, Xiehuang, Tangbao, Riri, Susu) across all categories and time slots
- July 10, 2025. Added 5 new users to database with diverse interests and locations (San Francisco, New York, Los Angeles, Seattle, Austin)
- July 10, 2025. Enhanced Group Chat button visibility - now shows whenever user has RSVPed to an event ('going' status) regardless of entry point, enabling immediate access to group chat after RSVP
- July 10, 2025. Fixed Group Chat navigation to properly open EventContent for specific event with chat tab active from all pages (Browse, My Events, Home)
- July 10, 2025. Fixed Browse page time filtering to use local timezone instead of UTC, eliminating one-day difference in event filtering
- July 10, 2025. Added persistent time filter selection for Browse page - now remembers selected time filter when switching away and returning
- July 10, 2025. Fixed EventContent navigation from Browse page - now shows back button and hides "Keep Exploring" button when entering from Browse, with proper back navigation to main swipe interface
- July 10, 2025. Fixed back button behavior in EventContent to always return to EventDetail component regardless of entry point
- July 10, 2025. Enhanced all 61 sample events with comprehensive details including capacity, duration, meeting points, parking info, what to bring, requirements, special notes, contact info, and cancellation policies
- July 10, 2025. Implemented Home page state persistence using localStorage - preserves current event, swipe history, and view mode when switching between navigation tabs
- July 10, 2025. Added back button to EventContent when entering from My Events, returns to EventDetail modal, hides "Keep Exploring" button
- July 10, 2025. Enhanced Group Chat button in MyEvents event details with proper navigation
- July 10, 2025. Fixed toast notification duration to 2 seconds for better user experience
- July 09, 2025. Fixed RSVP system to show events in MyEvents page when RSVPed from Browse page
- July 09, 2025. Added RSVP → EventContent navigation from all pages (Browse, MyEvents, Home)
- July 09, 2025. Implemented tab preference memory in EventContent (remembers last active tab)
- July 09, 2025. Added Capacitor for native mobile app development with Android/iOS support
- July 09, 2025. Redesigned home page with Bumble-style swipe interface, moved scrolling list to Browse page
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.