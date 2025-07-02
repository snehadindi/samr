import React, { useState, useRef, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { 
  Mic, LogOut, User as UserIcon, Home, BarChart3, FileText, BookOpen, MessageCircle,
  Search, Bell, Settings, Menu, X, ChevronDown,
  Zap, Star, Gift
} from 'lucide-react';
import { auth } from '../App';

interface HeaderProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: any) => void;
  onShowAuth: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onShowAuth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: BookOpen },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
    ...(user ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'practice', label: 'Practice', icon: Mic },
      { id: 'templates', label: 'Templates', icon: FileText },
      { id: 'glossary', label: 'Glossary', icon: BookOpen },
      { id: 'coach', label: 'AI Coach', icon: MessageCircle },
    ] : []),
  ];

  const notifications = [
    {
      id: 1,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You\'ve completed 10 practice sessions',
      time: '2 hours ago',
      unread: true,
      icon: Star
    },
    {
      id: 2,
      type: 'tip',
      title: 'Daily Tip',
      message: 'Try practicing your elevator pitch in different languages',
      time: '1 day ago',
      unread: true,
      icon: Zap
    },
    {
      id: 3,
      type: 'update',
      title: 'New Template Available',
      message: 'Check out our new Product Demo template',
      time: '2 days ago',
      unread: false,
      icon: Gift
    }
  ];

  const quickSearchItems = [
    { title: 'Elevator Pitch Template', type: 'template', action: () => onNavigate('templates') },
    { title: 'Practice Session', type: 'feature', action: () => onNavigate('practice') },
    { title: 'AI Coach', type: 'feature', action: () => onNavigate('coach') },
    { title: 'Series A Pitch', type: 'template', action: () => onNavigate('templates') },
    { title: 'Startup Glossary', type: 'resource', action: () => onNavigate('glossary') },
    { title: 'Performance Analytics', type: 'feature', action: () => onNavigate('dashboard') }
  ];

  const filteredSearchItems = quickSearchItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowQuickSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowQuickSearch(query.length > 0);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => onNavigate('home')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-electric-green rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
                PitchSense
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
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

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates, features..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowQuickSearch(searchQuery.length > 0)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue focus:bg-white/15 transition-all duration-200"
                />
              </div>

              {/* Quick Search Dropdown */}
              {showQuickSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setShowQuickSearch(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="text-sm text-gray-400 capitalize">{item.type}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-center">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-electric-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-white/10">
                        <h3 className="font-semibold text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                                notification.unread ? 'bg-electric-blue/5' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  notification.type === 'achievement' ? 'bg-electric-green/20' :
                                  notification.type === 'tip' ? 'bg-electric-blue/20' :
                                  'bg-electric-purple/20'
                                }`}>
                                  <Icon className={`w-4 h-4 ${
                                    notification.type === 'achievement' ? 'text-electric-green' :
                                    notification.type === 'tip' ? 'text-electric-blue' :
                                    'text-electric-purple'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-white text-sm">
                                    {notification.title}
                                  </div>
                                  <div className="text-gray-300 text-sm">
                                    {notification.message}
                                  </div>
                                  <div className="text-gray-400 text-xs mt-1">
                                    {notification.time}
                                  </div>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button className="w-full text-center text-electric-blue hover:text-electric-green transition-colors text-sm">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
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
                    <span className="text-sm text-gray-300 hidden sm:block max-w-32 truncate">
                      {user.displayName || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || 'User'}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-electric-purple rounded-full flex items-center justify-center">
                              <UserIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">
                              {user.displayName || 'User'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Dashboard</span>
                        </button>
                        
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-white/10 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                        
                        <hr className="my-2 border-white/10" />
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onShowAuth}
                className="bg-gradient-to-r from-electric-blue to-electric-purple px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-electric-blue/20 text-electric-blue'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;