# Live Polling System

## Overview

A real-time polling application that enables teachers to create and manage live polls while students participate and view results in real-time. The system uses WebSocket communication for instant updates and features a responsive UI built with React and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui (Radix UI primitives with Tailwind CSS)
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite

**Design Patterns**
- Component-based architecture with reusable UI components from shadcn/ui
- Custom hooks for shared logic (useSocket, useIsMobile, useToast)
- Path aliases for clean imports (@/, @shared/, @assets/)
- Session storage for persisting student state across page refreshes

**Key Pages**
- Desktop (Landing): Role selection interface for teachers and students
- Teacher: Poll creation, management, and real-time results viewing
- Student: Poll participation and live results display

### Backend Architecture

**Technology Stack**
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Real-time Communication**: Socket.IO for WebSocket connections
- **Build Tool**: esbuild for production bundling

**Design Patterns**
- Separation of concerns with modular route registration
- In-memory storage abstraction (MemStorage) with interface-based design for future database integration
- Middleware-based request/response logging
- Development-only Vite integration for HMR

**Real-time Architecture**
- Socket.IO handles bidirectional communication between teachers and students
- Room-based architecture (teachers join "teachers" room)
- Event-driven poll lifecycle (create, answer, end)
- In-memory poll state with 60-second timer management
- Student tracking via socket IDs with name mapping

### Data Storage Solutions

**Current Implementation**
- In-memory storage using Map data structures
- Session-based student persistence (client-side)
- Ephemeral poll data (server-side)

**Database Schema (Drizzle ORM configured but not actively used)**
- PostgreSQL dialect configured via Drizzle
- Users table with UUID primary keys, username, and password fields
- Schema defined in shared directory for code sharing between client and server
- Drizzle Zod integration for runtime validation

**Storage Abstraction**
- IStorage interface defines CRUD operations
- MemStorage provides in-memory implementation
- Designed for easy migration to PostgreSQL using Drizzle ORM

### External Dependencies

**Database & ORM**
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM for database operations
- **connect-pg-simple**: PostgreSQL session store (configured but not actively used)

**UI Component Libraries**
- **Radix UI**: Headless UI primitives for accessibility (~20 component packages)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Variant-based component styling
- **embla-carousel-react**: Carousel functionality

**Real-time & Data Fetching**
- **Socket.IO**: WebSocket library for bidirectional communication
- **TanStack React Query**: Server state management and caching

**Form Handling & Validation**
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration with React Hook Form
- **drizzle-zod**: Database schema to Zod schema conversion

**Development Tools**
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for development
- **Replit plugins**: Development experience enhancements (error overlay, cartographer, dev banner)

**Utility Libraries**
- **date-fns**: Date manipulation
- **clsx & tailwind-merge**: Conditional class name handling
- **cmdk**: Command palette functionality
- **nanoid**: Unique ID generation