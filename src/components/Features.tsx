import React from 'react';
import { Mic, Brain, BarChart3, Globe, FileText, MessageCircle, Zap, Shield } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Mic,
      title: 'Real-time Speech Analysis',
      description: 'AI-powered feedback on clarity, tone, pacing, and structure as you speak.',
      color: 'electric-blue'
    },
    {
      icon: Brain,
      title: 'Smart AI Coach',
      description: '24/7 virtual coaching assistant with personalized improvement suggestions.',
      color: 'electric-purple'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Detailed analytics and improvement metrics to track your growth over time.',
      color: 'electric-green'
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Practice in English, Hindi, French, Spanish, and 50+ other languages.',
      color: 'electric-pink'
    },
    {
      icon: FileText,
      title: 'Professional Templates',
      description: 'Expert-crafted pitch templates for different scenarios and industries.',
      color: 'electric-blue'
    },
    {
      icon: MessageCircle,
      title: 'Interactive Feedback',
      description: 'Get instant suggestions on content, delivery, and presentation structure.',
      color: 'electric-purple'
    },
    {
      icon: Zap,
      title: 'Instant Analysis',
      description: 'Real-time processing with immediate feedback and actionable insights.',
      color: 'electric-green'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. No audio is permanently stored.',
      color: 'electric-pink'
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              Master Your Pitch
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with proven coaching methodologies 
            to help you deliver presentations that captivate and convince.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`flex items-center justify-center w-12 h-12 bg-${feature.color}/20 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-electric-blue transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-electric-blue/10 to-electric-purple/10 rounded-2xl p-8 border border-white/10">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Transform Your Presentations?
            </h3>
            <p className="text-xl text-gray-300 mb-6">
              Join thousands of founders who have already improved their pitch success rate by 85%
            </p>
            <button className="bg-gradient-to-r from-electric-blue to-electric-purple px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-electric-blue/30 transition-all duration-300 transform hover:scale-105">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;