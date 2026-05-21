import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAPkxa3F-0DDdYnq_13cvQE1smf4S470-8",
  authDomain: "fatture-facili-2ce2b.firebaseapp.com",
  projectId: "fatture-facili-2ce2b",
  storageBucket: "fatture-facili-2ce2b.firebasestorage.app",
  messagingSenderId: "661444715808",
  appId: "1:661444715808:web:24d36e670bf57a70e4e345",
  measurementId: "G-WXVK4MF6NP"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
