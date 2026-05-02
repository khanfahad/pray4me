# Pray4Me

A cross-platform dua (supplication) request app for the Muslim community, focused on geofenced holy sites like Masjid al-Haram and Masjid an-Nabawi.

## Architecture

- **Web App**: React 19 + Vite 8, located in `/web`
- **iOS App**: SwiftUI (Swift), located in `/Pray4Me` — requires Xcode to build
- **Backend**: Firebase (Auth, Firestore, Cloud Messaging)

## Web App Setup

The web app lives in the `/web` directory.

- **Dev server**: Vite on port 5000, host `0.0.0.0`
- **Package manager**: npm
- **Start command**: `cd web && npm run dev`

### Firebase / Demo Mode

The app works without Firebase configuration using a local storage demo mode. To connect to Firebase, set these environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Deployment

Configured as a **static** deployment:
- Build: `cd web && npm run build`
- Public dir: `web/dist`

## Key Features

- Dua request creation with 13 categories (Health, Forgiveness, Guidance, Marriage, etc.)
- Geofenced holy sites: Masjid al-Haram, Mina, Muzdalifah, Arafat, Masjid an-Nabawi
- Google / Apple / Facebook Sign-In (via Firebase Auth)
- Demo mode with seeded data (no Firebase config needed)
