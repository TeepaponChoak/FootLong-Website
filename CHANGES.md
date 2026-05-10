# FootLong Web - Recent Changes

## Overview

This document outlines the recent changes made to the FootLong Website project.

## Changes Made

### 1. Title Update
- Changed "Footlong" to "FootLong Web" in:
  - `src/components/Navbar.tsx` - Logo text
  - `src/components/Home.tsx` - Page heading

### 2. Admin Authentication System
- Added `isAdmin` field to User model in:
  - `src/types.ts` - TypeScript interface
  - `server/index.js` - MongoDB schema and JWT token generation

- Created admin seeding script:
  - `server/seedAdmin.js` - Script to create admin user
  - Default credentials: username: `FootLong`, password: `footlong.29`

### 3. Announcement System
- **Backend API** (`server/index.js`):
  - `GET /api/announcements` - Fetch all announcements
  - `POST /api/announcements` - Create announcement (admin only)
  - `PUT /api/announcements/:id` - Update announcement (admin only)
  - `DELETE /api/announcements/:id` - Delete announcement (admin only)

- **Frontend API** (`src/api.ts`):
  - Added `announcementAPI` with methods for CRUD operations

- **Announcement Component** (`src/components/AnnouncementPanel.tsx`):
  - Displays latest announcement prominently
  - Shows announcement history
  - Admin-only editing interface

### 4. Styling
- Added comprehensive CSS for announcement panel in `src/index.css`:
  - Announcement card with gradient background
  - Editor modal for creating/editing
  - History list styling
  - Admin action buttons

### 5. Home Page Update
- Integrated `AnnouncementPanel` component into `src/components/Home.tsx`

### 6. Documentation
- Updated `DEPLOYMENT.md` with:
  - Admin seeding instructions
  - Admin credentials documentation
  - Announcement feature description

## File Structure

```
src/
├── components/
│   ├── AnnouncementPanel.tsx    [NEW]
│   ├── Home.tsx                 [MODIFIED]
│   └── Navbar.tsx               [MODIFIED]
├── api.ts                       [MODIFIED]
├── types.ts                     [MODIFIED]
└── index.css                    [MODIFIED]

server/
├── index.js                     [MODIFIED]
├── seedAdmin.js                 [NEW]
└── package.json                 [MODIFIED]

DEPLOYMENT.md                    [MODIFIED]
```

## How to Use

### Setting Up Admin Access

1. Start the server:
   ```bash
   cd server
   npm install
   npm start
   ```

2. Run the admin seed script (in a new terminal):
   ```bash
   cd server
   npm run seed:admin
   ```

3. Log in with admin credentials:
   - Username: `FootLong`
   - Password: `footlong.29`

### Creating Announcements

1. Log in as admin
2. On the homepage, click "New Announcement" button
3. Fill in title and content
4. Click "Save"

### Editing Announcements

1. Log in as admin
2. Find the announcement in the list
3. Click the edit icon (pencil)
4. Modify content and save

## Technical Details

- **Authentication**: JWT-based with admin role check
- **Authorization**: Middleware `requireAdmin` protects announcement endpoints
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: React with TypeScript