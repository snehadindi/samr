import React from 'react';
import { Mic, TrendingUp, Users } from 'lucide-react';

interface HeroProps {
  onStartPitching: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartPitching }) => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-electric-green/10 animate-pulse-slow"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-electric-purple/20 rounded-full blur-3xl animate-bounce-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-electric-pink/20 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading - FUELING CONFIDENCE */}
          <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-electric-blue via-electric-purple to-electric-green bg-clip-text text-transparent">
              FUELING CONFIDENCE
            </span>
          </h1>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            One Pitch at a Time
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Transform your presentations with AI-powered real-time feedback. 
            Perfect your pitch, boost your confidence, and deliver compelling presentations that win investors.
          </p>

          <div className="flex justify-center mb-8">
            <button
              onClick={onStartPitching}
              className="group flex items-center justify-center space-x-2 bg-gradient-to-r from-electric-green to-electric-blue px-10 py-5 rounded-xl font-bold text-xl hover:shadow-2xl hover:shadow-electric-green/30 transition-all duration-300 transform hover:scale-105"
            >
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>START PITCHING</span>
            </button>
          </div>

          <p className="text-lg text-electric-blue font-semibold mb-12">
            Analyze. Improve. Impress.
          </p>

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
              <div className="text-3xl font-bold text-electric-purple mb-2">55+</div>
              <div className="text-gray-300">Languages Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;