import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { X, Mail } from 'lucide-react';
import { auth } from '../App';
import { isFirebaseConfigured } from '../config/firebase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          onSuccess();
        }
      } catch (error: any) {
        console.error('Redirect result error:', error);
        setError(error.message || 'Authentication failed');
      }
    };

    checkRedirectResult();
  }, [onSuccess]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Please set up your environment variables.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Set custom parameters for better user experience
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      try {
        // Try popup first
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
          console.log('User signed in successfully:', result.user);
          onSuccess();
        }
      } catch (popupError: any) {
        console.log('Popup error:', popupError.code);
        
        // If popup is blocked or fails, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request') {
          console.log('Falling back to redirect method');
          await signInWithRedirect(auth, provider);
          // Don't set loading to false here as the page will redirect
          return;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
      setLoading(false);
    } finally {
      // Only set loading to false if we're not redirecting
      if (!error) {
        setLoading(false);
      }
    }
  };

  const handleDemoMode = () => {
    // For demo purposes, we'll just close the modal
    // In a real app, you might want to set a demo user state
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Welcome to PitchSense</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-center">
            Sign in to access your personalized pitch coaching dashboard
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {!isFirebaseConfigured() && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                <strong>Demo Mode:</strong> Firebase is not configured. You can still explore the demo features.
              </p>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !isFirebaseConfigured()}
            className="w-full flex items-center justify-center space-x-3 bg-white text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoMode}
            className="w-full flex items-center justify-center space-x-2 border border-white/20 py-3 px-4 rounded-lg font-semibold hover:bg-white/5 transition-all duration-200"
          >
            <Mail className="w-5 h-5" />
            <span>Continue with Demo</span>
          </button>

          <p className="text-xs text-gray-400 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;