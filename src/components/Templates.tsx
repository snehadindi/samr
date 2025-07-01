import React, { useState } from 'react';
import { FileText, Clock, Users, TrendingUp, Lightbulb, Target, Download, Eye } from 'lucide-react';

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'elevator', name: 'Elevator Pitch' },
    { id: 'investor', name: 'Investor Pitch' },
    { id: 'demo', name: 'Demo Day' },
    { id: 'product', name: 'Product Launch' },
  ];

  const templates = [
    {
      id: 1,
      title: 'Classic Elevator Pitch',
      category: 'elevator',
      duration: '30 seconds',
      difficulty: 'Beginner',
      description: 'Perfect for networking events and quick introductions',
      structure: [
        'Hook - Grab attention with a compelling opening',
        'Problem - Identify the pain point you solve',
        'Solution - Present your unique value proposition',
        'Market - Highlight the opportunity size',
        'Call to Action - What you want from the listener'
      ],
      tips: [
        'Keep it conversational and natural',
        'Practice until you can deliver without thinking',
        'Adapt based on your audience',
        'End with a clear next step'
      ],
      icon: Clock,
      color: 'electric-blue'
    },
    {
      id: 2,
      title: 'Series A Investor Pitch',
      category: 'investor',
      duration: '10-12 minutes',
      difficulty: 'Advanced',
      description: 'Comprehensive pitch for serious funding rounds',
      structure: [
        'Problem - Define the market problem clearly',
        'Solution - Your unique approach to solving it',
        'Market Size - TAM, SAM, SOM analysis',
        'Business Model - How you make money',
        'Traction - Proof of concept and growth',
        'Competition - Competitive landscape',
        'Team - Why you\'re the right team',
        'Financials - Revenue projections and metrics',
        'Funding - How much and what for',
        'Vision - Long-term company vision'
      ],
      tips: [
        'Lead with traction and proof points',
        'Be realistic with projections',
        'Address obvious concerns upfront',
        'Practice handling tough questions'
      ],
      icon: TrendingUp,
      color: 'electric-green'
    },
    {
      id: 3,
      title: 'Demo Day Presentation',
      category: 'demo',
      duration: '3-5 minutes',
      difficulty: 'Intermediate',
      description: 'High-impact presentation for accelerator demo days',
      structure: [
        'Hook - Start with a memorable moment',
        'Problem - Personal or relatable problem',
        'Solution Demo - Show, don\'t just tell',
        'Market Opportunity - Size and timing',
        'Traction - Key metrics and milestones',
        'Team - Founder-market fit',
        'Ask - Clear funding request'
      ],
      tips: [
        'Focus on storytelling over data',
        'Make your demo memorable',
        'Practice your timing religiously',
        'Prepare for the Q&A session'
      ],
      icon: Users,
      color: 'electric-purple'
    },
    {
      id: 4,
      title: 'Product Launch Pitch',
      category: 'product',
      duration: '5-7 minutes',
      difficulty: 'Intermediate',
      description: 'Launch your product with maximum impact',
      structure: [
        'Vision - Paint the future picture',
        'Problem - Current state of the market',
        'Solution - Your product introduction',
        'Features - Key capabilities and benefits',
        'Demo - Live product demonstration',
        'Market Strategy - Go-to-market plan',
        'Call to Action - Next steps for audience'
      ],
      tips: [
        'Focus on benefits over features',
        'Use real customer stories',
        'Make the demo flawless',
        'Create urgency and excitement'
      ],
      icon: Lightbulb,
      color: 'electric-pink'
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const TemplateModal = ({ template, onClose }: { template: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{template.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Duration</div>
              <div className="font-semibold">{template.duration}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Difficulty</div>
              <div className="font-semibold">{template.difficulty}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Category</div>
              <div className="font-semibold capitalize">{template.category}</div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Structure</h3>
            <div className="space-y-3">
              {template.structure.map((item: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-${template.color}/20 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-sm font-bold text-${template.color}`}>{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{item.split(' - ')[0]}</div>
                    <div className="text-gray-300 text-sm">{item.split(' - ')[1]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Pro Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template.tips.map((tip: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <Target className={`w-4 h-4 text-${template.color} flex-shrink-0 mt-0.5`} />
                  <span className="text-gray-300 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button className={`flex items-center space-x-2 bg-gradient-to-r from-${template.color} to-electric-purple px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200`}>
              <Download className="w-4 h-4" />
              <span>Use Template</span>
            </button>
            <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition-all duration-200">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Pitch{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              Templates
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional pitch templates crafted by experts. Choose the perfect structure for your presentation.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-electric-blue text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex items-center justify-center w-12 h-12 bg-${template.color}/20 rounded-lg`}>
                    <Icon className={`w-6 h-6 text-${template.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Duration</div>
                    <div className="font-semibold">{template.duration}</div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                <p className="text-gray-300 mb-4">{template.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 bg-${template.color}/20 text-${template.color} rounded-full text-sm font-medium`}>
                    {template.difficulty}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{template.structure.length} sections</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Template Modal */}
        {selectedTemplate && (
          <TemplateModal
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Templates;