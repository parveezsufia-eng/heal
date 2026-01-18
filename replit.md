# Heal Here - Mental Health Companion App

## Overview

Heal Here is a React Native/Expo mental health and wellness companion application. It provides therapy access, mood tracking, wellness tools, and AI-powered support for users seeking mental health guidance. The app follows a warm, sophisticated pastel aesthetic with a minimalist approach designed to feel like a safe, peaceful sanctuary.

The project uses a monorepo structure with:
- **Client**: Expo/React Native mobile app (iOS, Android, Web)
- **Server**: Express.js backend API
- **Shared**: Common schemas and types used by both client and server

## User Preferences

Preferred communication style: Simple, everyday language.

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
- Plus Jakarta Sans font family
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

Colors follow a warm pastel palette:
- Primary Purple: `#9B65AA`
- Soft Blue: `#AFCCE1`
- Warm Amber: `#DA914A`
- Background Root: `#F2F1F0` (light) / `#1A1919` (dark)

Supports automatic light/dark theme switching.

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