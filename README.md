# WC2026 Friends Hub

Site at: https://worldcup2026friendshub.vercel.app/

## Setup Guide

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Firebase Setup

### Step 1 — Create a Web App in Firebase Console

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Open your project
3. Click the **gear icon → Project settings**
4. Scroll to **"Your apps"** → click the **`</>`** (Web) icon
5. Register the app with a nickname (e.g. `wc2026-hub`)
6. **Copy the `firebaseConfig` object** — you'll need it next

### Step 2 — Create your `.env` file

In the project root, create a file called `.env` (copy from `.env.example`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Paste each value from the Firebase config object you copied.

---

## 3. Enable Firebase Authentication

1. In Firebase Console → **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

That's it — sign up and login will now work.

---

## 4. Set Up Firestore Database

1. In Firebase Console → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** *(you'll add security rules below)*
4. Pick a region close to you (e.g. `europe-west1` or `us-central`)
5. Click **Done**

### Firestore Security Rules

Go to **Firestore → Rules** tab and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read all profiles, only write their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }

    // Predictions: users can read/write their own only
    match /predictions/{predId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }

    // Matches: anyone signed in can read; only admins can write
    // (Admin write is handled server-side via Admin SDK in production,
    //  for dev/fun use, you can temporarily allow all authenticated writes)
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // tighten this once you add admin claims
    }
  }
}
```

Click **Publish**.

---

## 5. Make Yourself an Admin

After you create your account on the site:

1. Go to **Firestore → users collection**
2. Find your document (it will be named with your UID)
3. Click the document → **Edit field `isAdmin`** → set it to `true`
4. Save

You can now access `/admin` from your profile dropdown.

---

## 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 7. Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about framework, select **Vite**.

### Option B — Vercel Dashboard (recommended)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Framework: **Vite** (auto-detected)
5. **Add Environment Variables** — copy all 6 `VITE_FIREBASE_*` values from your `.env`
6. Click **Deploy**

The `vercel.json` file already handles SPA routing — all routes will work correctly.

---

## 8. How to Use the Admin Panel

The admin panel lives at `/admin` (invisible in the navbar for regular users).

**To resolve a match:**
1. Go to `/admin`
2. Find the match (use the search or status filter)
3. Click **🔴 Go Live** when the match starts (optional but fun)
4. After the match ends, enter the final score in the two boxes
5. Click **✓ Resolve**

This will:
- Save the final score to Firestore
- Look up every prediction made for that match
- Award **1 point** for correct result, **+5 bonus** for exact score
- Update each user's `totalPoints` on the leaderboard instantly

---

## 9. Firestore Collections Reference

| Collection | Purpose |
|---|---|
| `users` | User profiles, display names, avatars, totalPoints, isAdmin flag |
| `predictions` | One doc per user per match: predicted score, points earned |
| `matches` | Only stores matches with overrides (live status, final score) — everything else comes from the static `matchData.js` |

---

## 10. Project Structure

```
src/
├── components/     Navbar, MatchCard, ProtectedRoute, TeamFlag
├── context/        AuthContext (Firebase Auth + Firestore profile)
├── firebase/       config.js + matchData.js (all 104 matches)
├── hooks/          useMatches (live Firestore + static data merge)
└── pages/          Home, Login, Register, Schedule, Predict,
                    Leaderboard, Tickets, Profile, Admin
```
