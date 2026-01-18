# Heal Here - Mental Health Companion App

## Overview

Heal Here is a React Native/Expo mental health and wellness companion application. It provides therapy access, mood tracking, wellness tools, and AI-powered support for users seeking mental health guidance. The app follows a clean, minimal, serene wellness aesthetic with line art illustrations and soft organic shapes, designed to feel like a peaceful, spa-like sanctuary.

The project uses a monorepo structure with:
- **Client**: Expo/React Native mobile app (iOS, Android, Web)
- **Server**: Express.js backend API
- **Shared**: Common schemas and types used by both client and server

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

- Complete design overhaul to match Dribbble reference design
- Added Playfair Display serif font for elegant headings
- Generated custom line art illustrations with colored organic blobs
- Updated color palette to warm gold, soft blue, and peach tones
- Redesigned all screens with minimal, clean aesthetic
- Updated onboarding with decorative elements and circular arrow button

## System Architecture

### Frontend Architecture

**Framework**: Expo SDK 54 with React Native 0.81.5 and React 19

**Navigation Structure**:
- Root Stack Navigator (Onboarding → Main)
- Main Tab Navigator with 5 tabs: Home, Explore, Journal, Therapist, Profile
- Each tab has its own Stack Navigator for nested screens
- Floating buttons (AI Chat, Emergency SOS) persist across all screens

**State Management**: TanStack React Query for server state caching and synchronization

**UI Components**:
- Custom themed components (ThemedText, ThemedView, Card, Button)
- Playfair Display (serif) for headings
- Plus Jakarta Sans (sans-serif) for body text
- Reanimated for animations with spring physics
- Platform-specific adaptations (iOS blur effects, Android material design)

**Path Aliases**:
- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

### Backend Architecture

**Framework**: Express.js 5 with TypeScript

**API Design**: RESTful endpoints prefixed with `/api`

**Storage Pattern**: Interface-based storage abstraction (`IStorage`) with in-memory implementation (`MemStorage`). Designed for easy swap to database-backed storage.

**CORS**: Dynamic origin handling for Replit domains and localhost development

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect

**Schema Location**: `shared/schema.ts` - defines database tables and Zod validation schemas

**Current Schema**: Users table with id, username, password fields

**Migrations**: Generated in `./migrations` directory via `drizzle-kit`

### Build & Development

**Development**:
- `npm run expo:dev` - Start Expo development server
- `npm run server:dev` - Start Express server with tsx

**Production**:
- `npm run expo:static:build` - Build static web bundle
- `npm run server:build` - Bundle server with esbuild
- `npm run server:prod` - Run production server

### Design System

**Color Palette** (based on Dribbble reference):
- Primary Gold: `#C9A77C` - Buttons, accents
- Soft Blue: `#AFCCE1` - Secondary accents
- Peach/Cream: `#F5E6DC` - Decorative backgrounds
- Background Root: `#FFFFFF` (light) / `#1A1A1A` (dark)
- Card Blue: `#E8F4FA`
- Card Peach: `#FDF3ED`
- Card Green: `#EDF7F4`
- Text: `#2D2D2D` (primary), `#8B8B8B` (secondary)
- Emergency: `#E85D5D`

**Typography**:
- Headings: Playfair Display (serif) - elegant, spa-like feel
- Body: Plus Jakarta Sans (sans-serif) - clean, modern

**Illustrations**:
- Line art style with single continuous black lines
- Soft colored organic blobs (peach, blue, amber)
- Located in `client/assets/images/`

Supports automatic light/dark theme switching.

## Key Features

- **Onboarding**: Beautiful loading page with line art illustration and decorative elements
- **Home**: Mood tracker, daily goals, schedule, breathing exercises
- **Explore**: Session cards, mentor listings, category filters
- **Journal**: PIN-protected (PIN: 1234), private entries
- **Therapist**: Find and book therapy sessions, filter by specialty
- **Profile**: Stats, weekly mood chart, achievements, progress tracking
- **Floating Buttons**: AI chat companion and emergency SOS on all screens

## External Dependencies

### Third-Party Services

**None currently configured** - The app is set up for local development with in-memory storage

### Key NPM Dependencies

**UI/UX**:
- `expo-blur` - iOS blur effects
- `expo-haptics` - Haptic feedback
- `expo-image` - Optimized image component
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Touch handling

**Navigation**:
- `@react-navigation/native` - Core navigation
- `@react-navigation/bottom-tabs` - Tab navigator
- `@react-navigation/native-stack` - Stack navigator

**Fonts**:
- `@expo-google-fonts/plus-jakarta-sans` - Body text
- `@expo-google-fonts/playfair-display` - Headings

**Data**:
- `@tanstack/react-query` - Server state management
- `drizzle-orm` - Database ORM
- `drizzle-zod` - Schema validation
- `pg` - PostgreSQL driver

**Storage**:
- `@react-native-async-storage/async-storage` - Local key-value storage

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required for database operations)
- `EXPO_PUBLIC_DOMAIN` - API server domain for client requests
- `REPLIT_DEV_DOMAIN` - Development domain (auto-set by Replit)
