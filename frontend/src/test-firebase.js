// Test Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDZA6u6E1hvLVsmOzqoYOeryf8Zk_s9U4E",
  authDomain: "real-time-chat-app-54d26.firebaseapp.com",
  projectId: "real-time-chat-app-54d26",
  storageBucket: "real-time-chat-app-54d26.firebasestorage.app",
  messagingSenderId: "465427303889",
  appId: "1:465427303889:web:0dfdfc046e3016b43f24f0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log('Firebase initialized successfully');
console.log('Auth domain:', firebaseConfig.authDomain);

// Test function
export async function testFirebaseAuth() {
  try {
    console.log('Attempting Google sign-in...');
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Sign-in successful:', result.user.displayName);
    return result.user;
  } catch (error) {
    console.error('❌ Sign-in failed:', error.message);
    throw error;
  }
} 