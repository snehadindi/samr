// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  const hasApiKey = import.meta.env.VITE_FIREBASE_API_KEY && 
                   import.meta.env.VITE_FIREBASE_API_KEY !== "demo-key";
  const hasAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                       import.meta.env.VITE_FIREBASE_AUTH_DOMAIN !== "demo-project.firebaseapp.com";
  const hasProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                      import.meta.env.VITE_FIREBASE_PROJECT_ID !== "demo-project";
  
  return hasApiKey && hasAuthDomain && hasProjectId;
};