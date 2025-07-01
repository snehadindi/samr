import React from 'react';
import { Instagram, Linkedin, Github, Heart, Users, Target, Zap } from 'lucide-react';

const About: React.FC = () => {
  const founders = [
    {
      name: 'Sneha Dindi',
      image: '/sneha.jpg',
      social: {
        instagram: 'https://instagram.com/sneha_dindi',
        linkedin: 'https://linkedin.com/in/sneha-dindi',
        github: 'https://github.com/snehadindi'
      }
    },
    {
      name: 'Dasari Manvanth',
      image: '/manvanth.jpg',
      social: {
        instagram: 'https://instagram.com/manvanth.d',
        linkedin: 'https://linkedin.com/in/d-manvanth',
        github: 'https://github.com/dasarimanvanth'
      }
    },
    {
      name: 'Pati Yuktha',
      image: '/yuktha.jpg',
      social: {
        instagram: 'https://instagram.com/yukta_pati',
        linkedin: 'https://linkedin.com/in/yuktha-pati',
        github: 'https://github.com/Yukthapati'
      }
    },
    {
      name: 'Manne Namratha Sai',
      image: '/namratha.jpg',
      social: {
        instagram: 'https://instagram.com/mannenamratha',
        linkedin: 'https://linkedin.com/in/manne-namratha-sai-029771259',
        github: 'https://github.com/mannenamratha'
      }
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Empowerment',
      description: 'We believe everyone deserves to feel confident when speaking'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Built by students, for students and dreamers everywhere'
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Continuous improvement through AI-powered feedback'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Cutting-edge technology meets practical coaching'
    }
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              PitchSense
            </span>
          </h1>
          <p className="text-2xl text-electric-blue font-semibold mb-8">
            Empowering your pitch, one word at a time.
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div className="text-lg text-gray-300 leading-relaxed space-y-6">
              <p>
                PitchSense was born from one moment — our very first pitch. Four best friends, one stage, and a whole lot of nerves. We stumbled, we forgot lines, and we wished we had something to guide us. That moment of stage fright turned into something powerful: an idea.
              </p>
              <p>
                We built PitchSense for every student, dreamer, and future leader who wants to speak better but doesn't know where to start. It's more than just a tool — it's your personal pitch coach.
              </p>
              <p>
                With real-time voice analysis, PitchSense gives you instant feedback on clarity, tone, speaking speed, filler words, and confidence. It even suggests practical tips to help you improve each time you practice. Whether you're preparing for a classroom pitch, a startup demo, or your very first public speech — PitchSense is here to help you sound your best, feel your best, and own the moment.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-electric-blue/20 rounded-full mx-auto mb-4">
                    <Icon className="w-8 h-8 text-electric-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="relative mb-6 group">
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-electric-blue/30 group-hover:border-electric-blue/50 transition-all duration-300">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                      style={{
                        objectPosition: 'center 20%' // Adjust to show face and upper body
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-electric-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-white">{founder.name}</h3>
                
                <div className="flex justify-center space-x-4">
                  <a
                    href={founder.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-electric-pink/20 rounded-lg hover:bg-electric-pink/30 hover:scale-110 transition-all duration-200"
                  >
                    <Instagram className="w-5 h-5 text-electric-pink" />
                  </a>
                  <a
                    href={founder.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-electric-blue/20 rounded-lg hover:bg-electric-blue/30 hover:scale-110 transition-all duration-200"
                  >
                    <Linkedin className="w-5 h-5 text-electric-blue" />
                  </a>
                  <a
                    href={founder.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-electric-green/20 rounded-lg hover:bg-electric-green/30 hover:scale-110 transition-all duration-200"
                  >
                    <Github className="w-5 h-5 text-electric-green" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-electric-blue/10 to-electric-purple/10 rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              To democratize confident communication by providing accessible, AI-powered coaching that helps every individual unlock their potential and share their ideas with the world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;