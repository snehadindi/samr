import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, Users, DollarSign, Lightbulb, Target } from 'lucide-react';

const Glossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Terms', icon: BookOpen },
    { id: 'funding', name: 'Funding', icon: DollarSign },
    { id: 'metrics', name: 'Metrics', icon: TrendingUp },
    { id: 'strategy', name: 'Strategy', icon: Target },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'product', name: 'Product', icon: Lightbulb },
  ];

  const glossaryTerms = [
    {
      term: 'Angel Investor',
      category: 'funding',
      definition: 'An individual who provides capital for a business start-up, usually in exchange for convertible debt or ownership equity.',
      example: 'Sarah secured $50K from an angel investor who believed in her fintech startup.'
    },
    {
      term: 'Burn Rate',
      category: 'metrics',
      definition: 'The rate at which a company spends its cash reserves before generating positive cash flow.',
      example: 'With a monthly burn rate of $10K, the startup has 8 months of runway remaining.'
    },
    {
      term: 'Churn Rate',
      category: 'metrics',
      definition: 'The percentage of customers who stop using your product or service during a given time period.',
      example: 'The SaaS company reduced its monthly churn rate from 5% to 2% through better onboarding.'
    },
    {
      term: 'Due Diligence',
      category: 'funding',
      definition: 'The investigation or exercise of care that a reasonable business or person is expected to take before entering into an agreement or contract.',
      example: 'The VC firm spent 3 months conducting due diligence before making the investment.'
    },
    {
      term: 'Equity',
      category: 'funding',
      definition: 'Ownership interest in a company, typically represented by shares of stock.',
      example: 'The founder gave up 20% equity in exchange for $1M in Series A funding.'
    },
    {
      term: 'Freemium',
      category: 'strategy',
      definition: 'A business model where basic features are provided free of charge while advanced features require payment.',
      example: 'Spotify uses a freemium model with ads for free users and premium subscriptions for ad-free listening.'
    },
    {
      term: 'Go-to-Market Strategy',
      category: 'strategy',
      definition: 'A plan that details how a company will reach target customers and achieve competitive advantage.',
      example: 'Their go-to-market strategy focused on direct sales to enterprise customers.'
    },
    {
      term: 'Hockey Stick Growth',
      category: 'metrics',
      definition: 'A growth pattern that shows slow initial growth followed by rapid exponential growth.',
      example: 'The app experienced hockey stick growth after being featured in the App Store.'
    },
    {
      term: 'Intellectual Property (IP)',
      category: 'product',
      definition: 'Creations of the mind, such as inventions, literary works, designs, and symbols used in commerce.',
      example: 'The biotech startup has 5 patents protecting their core intellectual property.'
    },
    {
      term: 'Key Performance Indicator (KPI)',
      category: 'metrics',
      definition: 'A measurable value that demonstrates how effectively a company is achieving key business objectives.',
      example: 'Customer acquisition cost (CAC) is a crucial KPI for subscription businesses.'
    },
    {
      term: 'Lean Startup',
      category: 'strategy',
      definition: 'A methodology for developing businesses and products that aims to shorten product development cycles.',
      example: 'Using lean startup principles, they built an MVP in just 2 months.'
    },
    {
      term: 'Minimum Viable Product (MVP)',
      category: 'product',
      definition: 'A version of a product with just enough features to be usable by early customers.',
      example: 'Their MVP was a simple landing page that validated demand for the service.'
    },
    {
      term: 'Network Effect',
      category: 'strategy',
      definition: 'A phenomenon where increased numbers of people improve the value of a good or service.',
      example: 'Facebook benefits from network effects - the more users join, the more valuable it becomes.'
    },
    {
      term: 'Pivot',
      category: 'strategy',
      definition: 'A structured course correction designed to test a new fundamental hypothesis about the product.',
      example: 'Twitter started as a podcasting platform before pivoting to microblogging.'
    },
    {
      term: 'Product-Market Fit',
      category: 'product',
      definition: 'The degree to which a product satisfies a strong market demand.',
      example: 'They knew they had product-market fit when customers started referring others organically.'
    },
    {
      term: 'Runway',
      category: 'funding',
      definition: 'The amount of time a company can continue operating before it runs out of money.',
      example: 'With $500K in the bank and a $50K monthly burn rate, they have 10 months of runway.'
    },
    {
      term: 'Scalability',
      category: 'strategy',
      definition: 'The ability of a system to handle a growing amount of work by adding resources.',
      example: 'The cloud-based architecture ensures the platform can scale to millions of users.'
    },
    {
      term: 'Series A/B/C',
      category: 'funding',
      definition: 'Different rounds of funding that startups go through as they grow and mature.',
      example: 'After a successful Series A, they raised a $10M Series B to expand internationally.'
    },
    {
      term: 'Total Addressable Market (TAM)',
      category: 'metrics',
      definition: 'The total market demand for a product or service, representing the revenue opportunity.',
      example: 'The TAM for their cybersecurity solution is estimated at $50 billion globally.'
    },
    {
      term: 'Unicorn',
      category: 'funding',
      definition: 'A privately held startup company valued at over $1 billion.',
      example: 'Stripe became a unicorn in 2014 and is now valued at over $95 billion.'
    },
    {
      term: 'Value Proposition',
      category: 'strategy',
      definition: 'A statement that clearly identifies the benefits a company\'s products and services will deliver to customers.',
      example: 'Their value proposition is "50% faster delivery at half the cost of traditional shipping."'
    },
    {
      term: 'Venture Capital (VC)',
      category: 'funding',
      definition: 'A form of private equity financing provided by firms to startups with long-term growth potential.',
      example: 'Sequoia Capital is one of the most prestigious VC firms in Silicon Valley.'
    }
  ];

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Startup{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              Glossary
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master the language of startups and venture capital. Essential terms every founder should know.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue focus:bg-white/15 transition-all duration-200"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-electric-blue text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-400">
            Showing {filteredTerms.length} of {glossaryTerms.length} terms
          </p>
        </div>

        {/* Glossary Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTerms.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-electric-blue">
                  {item.term}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.category === 'funding' ? 'bg-electric-green/20 text-electric-green' :
                  item.category === 'metrics' ? 'bg-electric-blue/20 text-electric-blue' :
                  item.category === 'strategy' ? 'bg-electric-purple/20 text-electric-purple' :
                  item.category === 'team' ? 'bg-electric-pink/20 text-electric-pink' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {item.category}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4 leading-relaxed">
                {item.definition}
              </p>
              
              <div className="bg-white/5 rounded-lg p-3 border-l-4 border-electric-blue">
                <p className="text-sm text-gray-400 mb-1">Example:</p>
                <p className="text-sm text-white italic">
                  "{item.example}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No terms found</h3>
            <p className="text-gray-400">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Glossary;