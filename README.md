# Niche

A modern social + event discovery web app with a swipe-first UI inspired by contemporary dating and social platforms.

This single README now consolidates:
- setup
- architecture
- API reference
- current implementation status
- next steps

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Prisma ORM + SQLite
- JWT auth + bcrypt password hashing
- Zod validation

## Project Structure

- app/ — pages, API routes, and UI components
- app/components/ — main UI modules (HomePage, CardStack, Auth, EventMap, etc.)
- app/api/ — backend route handlers
- lib/ — shared server utilities (`prisma`, `auth`, middleware helpers)
- prisma/ — schema and migrations
- types/ — app-level TypeScript interfaces

## Features Implemented

### Frontend
- Hinge-style visual redesign
- Animated card stack interactions
- Multi-step auth UI
- Event discovery UI with map-style layout and categories
- Responsive layout and modern gradients/motion

### Backend (in progress)
- Prisma schema with users, events, opinions, ratings, reports, attendees, likes, preferences
- Auth utilities:
	- password hashing/comparison
	- JWT generation/verification
	- token extraction from request headers
- Auth API routes:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
	- `GET /api/auth/me`

## Authentication API

### POST /api/auth/register
Creates a new account.

Required body:
- email
- phone
- name
- age (must be >= 18)
- password

Optional body:
- selfDescription
- profileImageUrl

Response:
- `201` with `token` and created user payload
- `400` invalid input
- `409` duplicate email/phone

### POST /api/auth/login
Logs in with email + password.

Required body:
- email
- password

Response:
- `200` with `token` and user payload
- `401` invalid credentials

### GET /api/auth/me
Returns current user profile from bearer token.

Header:
- `Authorization: Bearer <token>`

Response:
- `200` with user profile
- `401` missing/invalid token

## Database Models (Prisma)

Core models:
- User
- UserPreferences
- UserOpinion
- Event
- EventAttendee
- UserLike
- EventRating
- OrganizerRating
- UserBehaviorRating
- Report

## Environment Variables

Use .env.local for Next runtime and .env for Prisma CLI/migrations.

Minimum required:

- DATABASE_URL="file:./dev.db"
- JWT_SECRET="replace-me"
- JWT_EXPIRY="7d"
- BCRYPT_ROUNDS="10"

## Getting Started

1) Install dependencies
- npm install --legacy-peer-deps

2) Run migrations
- npx prisma migrate dev --name init

3) Start dev server
- npm run dev

4) Open
- http://localhost:3000

## Current Status

- UI redesign: complete
- auth backend: active and functional (register/login/me)
- event/ratings/reports APIs: scaffolded, needs DB-wired implementation
- frontend-to-auth integration: next step

## Next Recommended Tasks

1. Connect auth form UI to register/login endpoints
2. Store JWT token securely and add session persistence
3. Protect create/update/delete API routes with auth helper
4. Implement full DB-backed logic for events/ratings/reports/search
5. Add seed script and test users/events
6. Add role/moderation tools for report workflow

## Notes

This file replaces the fragmented project docs so onboarding and maintenance happen in one place.
