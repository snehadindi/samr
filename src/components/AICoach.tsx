import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, TrendingUp, Target, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI pitch coach. I'm here to help you perfect your presentation skills. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      icon: Lightbulb,
      text: "Help me structure my pitch",
      color: "electric-blue"
    },
    {
      icon: TrendingUp,
      text: "Review my market analysis",
      color: "electric-green"
    },
    {
      icon: Target,
      text: "Improve my value proposition",
      color: "electric-purple"
    },
    {
      icon: MessageCircle,
      text: "Practice Q&A scenarios",
      color: "electric-pink"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('structure') || lowerMessage.includes('organize')) {
      return `Great question! Here's a proven pitch structure:

1. **Hook** - Start with a compelling story or statistic
2. **Problem** - Clearly define the pain point you're solving
3. **Solution** - Present your unique approach
4. **Market** - Show the size and opportunity
5. **Business Model** - Explain how you make money
6. **Traction** - Share your progress and metrics
7. **Team** - Highlight your expertise
8. **Ask** - Be specific about what you need

Would you like me to dive deeper into any of these sections?`;
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('tam') || lowerMessage.includes('analysis')) {
      return `For a compelling market analysis, focus on:

**TAM (Total Addressable Market)** - The entire market opportunity
**SAM (Serviceable Addressable Market)** - The portion you can realistically target
**SOM (Serviceable Obtainable Market)** - What you can capture initially

Tips:
• Use credible sources (Gartner, McKinsey, industry reports)
• Show market growth trends
• Identify key market drivers
• Address timing - why now?

What specific market are you targeting? I can help you refine your analysis.`;
    }
    
    if (lowerMessage.includes('value proposition') || lowerMessage.includes('unique')) {
      return `A strong value proposition should answer:

**What do you do?** - Clear, jargon-free explanation
**Who is it for?** - Specific target customer
**What problem do you solve?** - Pain point you address
**How are you different?** - Your unique advantage
**What's the benefit?** - Value you deliver

Try this formula: "We help [target customer] achieve [desired outcome] by [unique approach], unlike [alternatives] that [limitation]."

What's your current value proposition? I can help you sharpen it!`;
    }
    
    if (lowerMessage.includes('q&a') || lowerMessage.includes('questions') || lowerMessage.includes('practice')) {
      return `Let's practice! Here are common investor questions:

**Tough Questions:**
• "What if Google/Amazon builds this?"
• "How do you plan to acquire customers?"
• "What's your customer acquisition cost?"
• "Why will this succeed when others have failed?"
• "What are your biggest risks?"

**Preparation Tips:**
• Anticipate objections and prepare responses
• Have data to back up your claims
• Practice staying calm under pressure
• Turn challenges into opportunities

Which question would you like to practice answering?`;
    }
    
    if (lowerMessage.includes('nervous') || lowerMessage.includes('confidence') || lowerMessage.includes('anxiety')) {
      return `Pitch nerves are completely normal! Here's how to build confidence:

**Before the pitch:**
• Practice until you can deliver without slides
• Record yourself and review
• Practice with friends/mentors
• Prepare for likely questions

**During the pitch:**
• Start with deep breathing
• Make eye contact with friendly faces
• Speak slowly and clearly
• Use pauses effectively

**Mindset shifts:**
• You're sharing an opportunity, not begging
• Investors want you to succeed
• Rejection isn't personal - it's about fit

Remember: You know your business better than anyone in that room!`;
    }
    
    // Default responses for general queries
    const defaultResponses = [
      `That's an interesting point! Could you tell me more about your specific situation? I'd love to provide more targeted advice.`,
      `I'd be happy to help with that! What aspect would you like to focus on first?`,
      `Great question! Let me share some insights that might help...`,
      `That's a common challenge many founders face. Here's what I typically recommend...`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            AI{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              Pitch Coach
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Get personalized coaching and feedback from your AI mentor
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 h-[600px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-electric-blue/20' 
                      : 'bg-electric-green/20'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-electric-blue" />
                    ) : (
                      <Bot className="w-4 h-4 text-electric-green" />
                    )}
                  </div>
                  
                  <div className={`rounded-xl p-4 ${
                    message.type === 'user'
                      ? 'bg-electric-blue/20 text-white'
                      : 'bg-white/10 text-gray-100'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-electric-green/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-electric-green" />
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-3">Quick prompts to get started:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt.text)}
                      className={`flex items-center space-x-2 p-3 bg-white/5 hover:bg-${prompt.color}/10 rounded-lg transition-all duration-200 text-left`}
                    >
                      <Icon className={`w-4 h-4 text-${prompt.color}`} />
                      <span className="text-sm">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about pitching..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue resize-none"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-electric-blue to-electric-purple px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;