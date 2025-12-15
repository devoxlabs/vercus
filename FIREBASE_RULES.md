# Firebase Firestore Rules

Copy and paste these rules into your Firebase Console -> Firestore Database -> Rules tab.

## Option 1: Test Mode (Easiest for Development)
Allows anyone to read and write. Use this only for testing.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Option 2: Authenticated Users Only (Recommended)
Allows only logged-in users to read and write.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
