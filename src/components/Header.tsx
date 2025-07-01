import React from 'react';
import { User, signOut } from 'firebase/auth';
import { Mic, LogOut, User as UserIcon, Home, BarChart3, FileText, BookOpen, MessageCircle } from 'lucide-react';
import { auth } from '../App';

interface HeaderProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: any) => void;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onShowAuth }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    ...(user ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'practice', label: 'Practice', icon: Mic },
      { id: 'templates', label: 'Templates', icon: FileText },
      { id: 'glossary', label: 'Glossary', icon: BookOpen },
      { id: 'coach', label: 'AI Coach', icon: MessageCircle },
    ] : []),
  ];

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-electric-green rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
                PitchSense
              </span>
            </div>

            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-electric-blue/20 text-electric-blue'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-electric-purple rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-gray-300 hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="bg-gradient-to-r from-electric-blue to-electric-purple px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;