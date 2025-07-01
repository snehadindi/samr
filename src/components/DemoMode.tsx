import React, { useState } from 'react';
import { ArrowLeft, Play, Mic, BarChart3, FileText, MessageCircle } from 'lucide-react';

interface DemoModeProps {
  onBackToHome: () => void;
}

const DemoMode: React.FC<DemoModeProps> = ({ onBackToHome }) => {
  const [currentDemo, setCurrentDemo] = useState<string | null>(null);

  const demoFeatures = [
    {
      id: 'practice',
      title: 'Pitch Practice',
      description: 'Experience our AI-powered speech analysis',
      icon: Mic,
      color: 'electric-blue',
      demo: 'Try recording a 30-second elevator pitch and see instant feedback on clarity, pacing, and confidence.'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'View detailed progress tracking',
      icon: BarChart3,
      color: 'electric-green',
      demo: 'Explore comprehensive dashboards showing your improvement over time with detailed metrics.'
    },
    {
      id: 'templates',
      title: 'Pitch Templates',
      description: 'Browse professional pitch structures',
      icon: FileText,
      color: 'electric-purple',
      demo: 'Access expert-crafted templates for different pitch scenarios and funding stages.'
    },
    {
      id: 'coach',
      title: 'AI Coach',
      description: 'Chat with your virtual pitch mentor',
      icon: MessageCircle,
      color: 'electric-pink',
      demo: 'Get personalized advice and practice Q&A scenarios with our intelligent coaching system.'
    }
  ];

  const mockData = {
    practice: {
      score: 82,
      feedback: [
        "Great opening hook - you grabbed attention immediately",
        "Consider slowing down slightly in the middle section",
        "Strong conclusion with clear call to action",
        "Excellent energy and enthusiasm throughout"
      ],
      metrics: {
        clarity: 85,
        confidence: 78,
        pacing: 80,
        structure: 84
      }
    },
    analytics: {
      sessions: 24,
      averageScore: 78,
      improvement: 15,
      streak: 7,
      chartData: [
        { date: 'Week 1', score: 65 },
        { date: 'Week 2', score: 72 },
        { date: 'Week 3', score: 78 },
        { date: 'Week 4', score: 82 },
      ]
    }
  };

  const renderDemo = () => {
    if (!currentDemo) return null;

    switch (currentDemo) {
      case 'practice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-electric-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-12 h-12 text-electric-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Demo: Pitch Analysis</h3>
              <p className="text-gray-300">Here's what your feedback would look like:</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-electric-green mb-2">
                  {mockData.practice.score}%
                </div>
                <p className="text-gray-300">Overall Score</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(mockData.practice.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-electric-blue mb-1">{value}%</div>
                    <div className="text-sm text-gray-400 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">AI Feedback:</h4>
                <div className="space-y-2">
                  {mockData.practice.feedback.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-electric-green rounded-full mt-2"></div>
                      <p className="text-gray-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-electric-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-12 h-12 text-electric-green" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Demo: Analytics Dashboard</h3>
              <p className="text-gray-300">Track your progress over time:</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-electric-blue mb-1">
                  {mockData.analytics.sessions}
                </div>
                <div className="text-sm text-gray-400">Total Sessions</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-electric-green mb-1">
                  {mockData.analytics.averageScore}%
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-electric-purple mb-1">
                  +{mockData.analytics.improvement}%
                </div>
                <div className="text-sm text-gray-400">Improvement</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-electric-pink mb-1">
                  {mockData.analytics.streak}
                </div>
                <div className="text-sm text-gray-400">Day Streak</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-4">Progress Chart</h4>
              <div className="space-y-3">
                {mockData.analytics.chartData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-400">{item.date}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 bg-gradient-to-r from-electric-blue to-electric-green rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm font-semibold">{item.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-electric-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-electric-purple" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Demo: Pitch Templates</h3>
              <p className="text-gray-300">Professional structures for every scenario:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Elevator Pitch', duration: '30 seconds', sections: 5 },
                { title: 'Series A Pitch', duration: '10 minutes', sections: 10 },
                { title: 'Demo Day', duration: '3 minutes', sections: 7 },
                { title: 'Product Launch', duration: '5 minutes', sections: 8 }
              ].map((template, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold mb-2">{template.title}</h4>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{template.duration}</span>
                    <span>{template.sections} sections</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'coach':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-electric-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-electric-pink" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Demo: AI Coach</h3>
              <p className="text-gray-300">Sample conversation with your AI mentor:</p>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-start">
                <div className="bg-electric-green/20 rounded-xl p-3 max-w-xs">
                  <p className="text-sm">Hi! I'm your AI pitch coach. What would you like to work on today?</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-electric-blue/20 rounded-xl p-3 max-w-xs">
                  <p className="text-sm">Help me improve my value proposition</p>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-electric-green/20 rounded-xl p-3 max-w-md">
                  <p className="text-sm">Great! A strong value proposition should clearly answer: What do you do? Who is it for? What problem do you solve? Try this formula: "We help [target customer] achieve [desired outcome] by [unique approach]..."</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Experience{' '}
              <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
                PitchSense
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Explore our features with interactive demos
            </p>
          </div>
        </div>

        {!currentDemo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer hover:transform hover:scale-105"
                  onClick={() => setCurrentDemo(feature.id)}
                >
                  <div className={`flex items-center justify-center w-16 h-16 bg-${feature.color}/20 rounded-xl mb-4`}>
                    <Icon className={`w-8 h-8 text-${feature.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <p className="text-sm text-gray-400">{feature.demo}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-${feature.color} font-medium`}>Try Demo</span>
                    <Play className={`w-4 h-4 text-${feature.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentDemo(null)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Demos</span>
            </button>
            
            {renderDemo()}
            
            <div className="text-center mt-8">
              <p className="text-gray-300 mb-4">
                Ready to unlock the full potential of PitchSense?
              </p>
              <button
                onClick={onBackToHome}
                className="bg-gradient-to-r from-electric-blue to-electric-purple px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoMode;