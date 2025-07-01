import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Target, Award, Mic, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSessions: 24,
    averageScore: 78,
    improvementRate: 15,
    streakDays: 7
  });

  const performanceData = [
    { date: '2024-01-01', score: 65, clarity: 70, pace: 60, confidence: 65 },
    { date: '2024-01-08', score: 72, clarity: 75, pace: 68, confidence: 73 },
    { date: '2024-01-15', score: 78, clarity: 80, pace: 75, confidence: 79 },
    { date: '2024-01-22', score: 82, clarity: 85, pace: 78, confidence: 83 },
    { date: '2024-01-29', score: 85, clarity: 88, pace: 82, confidence: 86 },
  ];

  const skillsData = [
    { name: 'Clarity', value: 85, color: '#00D4FF' },
    { name: 'Confidence', value: 78, color: '#8B5CF6' },
    { name: 'Pacing', value: 82, color: '#00FF88' },
    { name: 'Structure', value: 75, color: '#FF006E' },
  ];

  const recentSessions = [
    { id: 1, date: '2024-01-29', type: 'Elevator Pitch', score: 85, duration: '3:45' },
    { id: 2, date: '2024-01-28', type: 'Series A Pitch', score: 82, duration: '8:20' },
    { id: 3, date: '2024-01-26', type: 'Demo Day', score: 78, duration: '5:15' },
    { id: 4, date: '2024-01-24', type: 'Investor Meeting', score: 80, duration: '12:30' },
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Founder'}! 👋
          </h1>
          <p className="text-xl text-gray-300">
            Here's your pitch performance overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-blue/20 rounded-lg">
                <Mic className="w-6 h-6 text-electric-blue" />
              </div>
              <span className="text-2xl font-bold text-electric-blue">
                {stats.totalSessions}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Total Sessions</h3>
            <p className="text-gray-400 text-sm">+3 this week</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-green/20 rounded-lg">
                <Target className="w-6 h-6 text-electric-green" />
              </div>
              <span className="text-2xl font-bold text-electric-green">
                {stats.averageScore}%
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Average Score</h3>
            <p className="text-gray-400 text-sm">+5% improvement</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-purple/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-electric-purple" />
              </div>
              <span className="text-2xl font-bold text-electric-purple">
                +{stats.improvementRate}%
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Improvement</h3>
            <p className="text-gray-400 text-sm">Last 30 days</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-electric-pink/20 rounded-lg">
                <Award className="w-6 h-6 text-electric-pink" />
              </div>
              <span className="text-2xl font-bold text-electric-pink">
                {stats.streakDays}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-1">Day Streak</h3>
            <p className="text-gray-400 text-sm">Keep it up!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00D4FF" 
                  strokeWidth={3}
                  dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Breakdown */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">Skills Breakdown</h3>
            <div className="space-y-4">
              {skillsData.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm font-semibold" style={{ color: skill.color }}>
                      {skill.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.value}%`,
                        backgroundColor: skill.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-6">Recent Sessions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((session) => (
                  <tr key={session.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{session.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        session.score >= 80 ? 'bg-electric-green/20 text-electric-green' :
                        session.score >= 70 ? 'bg-electric-blue/20 text-electric-blue' :
                        'bg-electric-pink/20 text-electric-pink'
                      }`}>
                        {session.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{session.duration}</td>
                    <td className="py-3 px-4">
                      <button className="text-electric-blue hover:text-electric-green transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;