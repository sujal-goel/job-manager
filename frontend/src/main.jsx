import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Fetch key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("❌ CRITICAL: VITE_CLERK_PUBLISHABLE_KEY is missing in your frontend .env file!");
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ color: 'red', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Auth Configuration Error</h1>
      <p>Please add <b>VITE_CLERK_PUBLISHABLE_KEY</b> to your <b>frontend/.env</b> file.</p>
    </div>
  );
} else {
  console.log("✅ Clerk initialized with key:", PUBLISHABLE_KEY.slice(0, 15) + "...");
  
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        signInUrl={import.meta.env.VITE_CLERK_SIGN_IN_URL}
        signUpUrl={import.meta.env.VITE_CLERK_SIGN_UP_URL}
        afterSignInUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL}
        afterSignUpUrl={import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );

}

