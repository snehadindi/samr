import React from 'react';
import { Play, Mic, TrendingUp, Users } from 'lucide-react';

interface HeroProps {
  onTryDemo: () => void;
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onTryDemo, onGetStarted }) => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-green/10 animate-pulse-slow"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-purple/20 rounded-full blur-3xl animate-bounce-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-electric-pink/20 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Perfect Your{' '}
            <span className="bg-gradient-to-r from-electric-blue via-electric-purple to-electric-green bg-clip-text text-transparent">
              Startup Pitch
            </span>{' '}
            with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Transform your presentations with AI-powered real-time feedback. 
            Perfect your pitch, boost your confidence, and deliver compelling presentations that win investors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onTryDemo}
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-electric-blue to-electric-purple px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-electric-blue/30 transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Try Demo</span>
            </button>
            
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center space-x-2 border-2 border-electric-green px-8 py-4 rounded-xl font-semibold text-lg hover:bg-electric-green/10 hover:shadow-lg hover:shadow-electric-green/25 transition-all duration-300"
            >
              <Mic className="w-5 h-5" />
              <span>Get Started Free</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-blue/20 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-electric-blue" />
              </div>
              <div className="text-3xl font-bold text-electric-blue mb-2">85%</div>
              <div className="text-gray-300">Improvement Rate</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-green/20 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-electric-green" />
              </div>
              <div className="text-3xl font-bold text-electric-green mb-2">10K+</div>
              <div className="text-gray-300">Founders Trained</div>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-purple/20 rounded-lg mx-auto mb-4">
                <Mic className="w-6 h-6 text-electric-purple" />
              </div>
              <div className="text-3xl font-bold text-electric-purple mb-2">50+</div>
              <div className="text-gray-300">Languages Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;