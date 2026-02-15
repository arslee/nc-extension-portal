// ============================================================
// Firebase Configuration
// ============================================================
//
// SETUP CHECKLIST:
//
// 1. Enable Google sign-in:
//    - Firebase Console → Authentication → Sign-in method → Google → Enable
//
// 2. Add your domain to authorized domains:
//    - Firebase Console → Authentication → Settings → Authorized domains
//    - Add your GitHub Pages domain (e.g., "username.github.io")
//    - "localhost" is already authorized by default
//
// 3. Enable Firestore (for usage logging):
//    - Firebase Console → Build → Firestore Database → Create database → Test mode
//    - Later, add security rules:
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /usage_logs/{document} {
//            allow create: if request.auth != null;
//            allow read: if false;
//          }
//        }
//      }

var firebaseConfig = {
  apiKey: "AIzaSyCe0_ZgbmqNC45uKn_WhmaULYL_Z8ZiLT0",
  authDomain: "nc-extension-portal.firebaseapp.com",
  projectId: "nc-extension-portal",
  storageBucket: "nc-extension-portal.firebasestorage.app",
  messagingSenderId: "1026251859445",
  appId: "1:1026251859445:web:4e89534fdddf7bb123acbc",
  measurementId: "G-5D0Y4ZBMDN"
};
