import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import PitchPractice from './components/PitchPractice';
import Templates from './components/Templates';
import Glossary from './components/Glossary';
import AICoach from './components/AICoach';
import About from './components/About';
import Contact from './components/Contact';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { firebaseConfig } from './config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

type View = 'home' | 'about' | 'contact' | 'dashboard' | 'practice' | 'templates' | 'glossary' | 'coach';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigation = (view: View) => {
    // Only require authentication for dashboard, templates, glossary, and coach
    if (!user && ['dashboard', 'templates', 'glossary', 'coach'].includes(view)) {
      setShowAuthModal(true);
      return;
    }
    
    setCurrentView(view);
  };

  const handleStartPitching = () => {
    // Allow direct access to practice without authentication
    setCurrentView('practice');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'dashboard':
        return <Dashboard />;
      case 'practice':
        return <PitchPractice />;
      case 'templates':
        return <Templates />;
      case 'glossary':
        return <Glossary />;
      case 'coach':
        return <AICoach />;
      default:
        return (
          <>
            <Hero onStartPitching={handleStartPitching} />
            <Features />
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-white">Loading PitchSense...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-green-900 text-white">
        <Header 
          user={user} 
          currentView={currentView}
          onNavigate={handleNavigation}
          onShowAuth={() => setShowAuthModal(true)}
        />
        
        <main>
          {renderCurrentView()}
        </main>

        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              setCurrentView('dashboard');
            }}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;