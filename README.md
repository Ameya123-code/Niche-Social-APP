# Niche

Niche is a modern social + event discovery app built with Next.js, Prisma, and a motion-heavy premium landing experience. It combines swipe-style discovery, profiles, events, conversation systems, and verification flows in a single app-router codebase.

## Highlights

- Cinematic landing page with GSAP-powered scroll animation, active nav state, hover depth, and polished vertical reveals
- Multi-step authentication flow with profile photo upload and date-of-birth validation
- Age-gated onboarding: users must be at least 18 years old
- App shell with protected routes, cards, chat, map, search, profile, and settings
- Event, rating, report, conversation, upload, and matching APIs
- Prisma-backed relational data model for users, events, preferences, messaging, moderation, and reputation

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- GSAP + ScrollTrigger
- Framer Motion
- Prisma ORM + PostgreSQL
- JWT auth + bcrypt password hashing
- Zod validation
- Pusher / Pusher JS
- OpenCV.js support for age-estimation flows

## Project Structure

- `app/` — app-router pages, layouts, route handlers, and page-level UI
- `app/components/` — landing page, auth UI, cards, map, theme toggle, and shared interface modules
- `app/api/` — auth, uploads, cards, events, conversations, ratings, reports, search, admin, and user endpoints
- `app/auth/verify/` — verification experience for age/email-related status handling
- `lib/` — shared utilities such as auth, Prisma, email, uploads, and verification helpers
- `prisma/` — schema and migration assets
- `types/` — TypeScript interfaces used across the app
- `hooks/` — reusable client hooks

## Current Feature Set

### Landing Page

- GSAP-based hero entrance timeline
- Scroll-driven “How it works” storytelling section with progress line
- Vertical reveal and subtle parallax motion across sections
- Active section highlighting in navigation
- Premium footer redesign with staggered reveal animation
- Unified light/dark background styling across sections
- Theme toggle synced with the root theme class

### Authentication and Verification

- Multi-step registration UI with animated transitions
- Login with JWT-based session handling
- Profile image upload during signup
- Date-of-birth validation in the client
- Server-side 18+ enforcement during registration
- Session gate currently requires age verification only
- Verification UI still exists for age-related status and onboarding flow continuity

### Core App Areas

- Swipe/discovery cards
- Events and event attendance
- Search and map flows
- Profile and settings pages
- Conversation and messaging routes
- Ratings, reports, and moderation-related endpoints

## Verification Rules

The app currently enforces only one onboarding eligibility rule:

- User must be at least 18 years old

Implementation notes:

- Client signup flow blocks progress if entered `birthDate` results in age `< 18`
- `POST /api/auth/register` validates DOB server-side and rejects underage users
- Successful registration marks `isAgeVerified: true`
- Protected app session checks require age verification only

## Key Auth API

### `POST /api/auth/register`

Creates a new account.

Required body:

- `email`
- `phone`
- `name`
- `birthDate` (ISO string; user must be 18+)
- `password`

Optional body:

- `selfDescription`
- `profileImageUrl`

Response:

- `201` with `token` and created user payload
- `400` invalid input or under-18 DOB
- `409` duplicate email/phone

### `POST /api/auth/login`

Logs in with email + password.

Required body:

- `email`
- `password`

Response:

- `200` with `token` and user payload
- `401` invalid credentials

### `GET /api/auth/me`

Returns the authenticated user.

Header:

- `Authorization: Bearer <token>`

### `GET /api/auth/session`

Validates the lightweight DB-backed session used by the protected app shell.

Behavior:

- returns `200` when session is valid
- returns `403` if required verification is incomplete
- returns `401` if token/session is invalid

## Database Overview

Core Prisma models include:

- `User`
- `UserPreferences`
- `UserOpinion`
- `Event`
- `EventAttendee`
- `UserLike`
- `EventRating`
- `OrganizerRating`
- `UserBehaviorRating`
- `VerificationToken`
- `UploadedImage`
- `UserProfile`
- `UserCardDesign`
- `Conversation`
- `Message`

## Environment Variables

Use `.env.local` for Next runtime values and `.env` / Prisma config values for DB tooling.

Typical required values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `BCRYPT_ROUNDS`

Depending on enabled features, you may also need credentials for:

- email delivery
- Pusher
- Firebase
- upload/media services

## Scripts

- `npm run dev` — local development with webpack dev server
- `npm run dev:turbo` — local development with Turbopack
- `npm run build` — Prisma generate + production Next.js build
- `npm run start` — run production server
- `npm run lint` — run ESLint

## Getting Started

1. Install dependencies

   `npm install --legacy-peer-deps`

2. Generate Prisma client / run migrations

   `npx prisma migrate dev`

3. Start development server

   `npm run dev`

4. Open the app

   `http://localhost:3000`

## Deployment Notes

- The repo relies on `postinstall` to run `prisma generate`
- `gsap` and `ThemeToggle` must be tracked in git for CI builds to succeed
- On Windows, local `.next` cleanup may be required if a build hits an `EPERM unlink` lock error

## Current Status

- Landing page redesign: active and polished
- Auth flow: working
- Age verification rule: enforced
- Protected app shell: working
- Feature surface is broad; some areas are still evolving beyond initial API scaffolding

## Notes

This README reflects the current implemented product state, including the newer landing page animation system and age-only verification flow.
