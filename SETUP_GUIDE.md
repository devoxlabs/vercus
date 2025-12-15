# VERCUS Setup Guide

## 1. Environment Variables
Create a file named `.env.local` in the `vercus-app` directory and paste the following:

```bash
# Google Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-flash

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

## 2. Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click "Get API key".
3. Create a key and paste it above.

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project "Vercus".
3. Add a Web App (`</>`).
4. Copy the `firebaseConfig` values into the `.env.local` file.
5. **Enable Authentication**: Go to Build -> Authentication -> Get Started -> Enable Google/Email.
6. **Enable Firestore**: Go to Build -> Firestore Database -> Create Database -> Start in Test Mode.
