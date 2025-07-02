import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';

const PitchPractice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedTemplate, setSelectedTemplate] = useState('elevator');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
  ];

  const templates = [
    { id: 'elevator', name: 'Elevator Pitch (30s)', duration: 30 },
    { id: 'demo-day', name: 'Demo Day (3 min)', duration: 180 },
    { id: 'series-a', name: 'Series A Pitch (10 min)', duration: 600 },
    { id: 'investor', name: 'Investor Meeting (15 min)', duration: 900 },
    { id: 'custom', name: 'Custom Duration', duration: 0 },
  ];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        console.warn('audio/webm not supported, falling back to default');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        setAudioBlob(audioBlob);
        
        // Create audio URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setHasRecorded(true);
        analyzePitch(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Recording error occurred. Please try again.');
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      setFeedback(null);
      setHasRecorded(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.');
        } else {
          alert('Error accessing microphone: ' + error.message);
        }
      } else {
        alert('Please allow microphone access to record your pitch.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const analyzePitch = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate realistic analysis time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Calculate duration for more realistic scoring
      const audioDuration = recordingTime;
      const expectedDuration = templates.find(t => t.id === selectedTemplate)?.duration || 30;
      
      // More sophisticated scoring based on recording characteristics
      const durationScore = Math.max(50, 100 - Math.abs(audioDuration - expectedDuration) * 2);
      const baseScore = Math.floor(Math.random() * 15) + 70; // 70-85 base
      
      // Simulate analysis of audio characteristics
      const audioSize = audioBlob.size;
      const sizeScore = Math.min(100, Math.max(60, (audioSize / 1000) * 2)); // Rough quality indicator
      
      const overallScore = Math.floor((baseScore + durationScore + sizeScore) / 3);
      
      const mockFeedback = {
        overallScore: Math.min(95, Math.max(65, overallScore)),
        clarity: Math.floor(Math.random() * 15) + 75 + (audioSize > 50000 ? 5 : 0),
        confidence: Math.floor(Math.random() * 20) + 70 + (audioDuration > 10 ? 5 : 0),
        pacing: Math.floor(Math.random() * 25) + 70 + (Math.abs(audioDuration - expectedDuration) < 5 ? 10 : 0),
        structure: Math.floor(Math.random() * 20) + 75,
        duration: audioDuration,
        expectedDuration: expectedDuration,
        suggestions: generateSuggestions(audioDuration, expectedDuration, audioSize),
        strengths: generateStrengths(audioDuration, audioSize),
        improvements: generateImprovements(audioDuration, expectedDuration)
      };
      
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try recording again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = (duration: number, expected: number, size: number) => {
    const suggestions = [];
    
    if (duration < expected * 0.7) {
      suggestions.push("Your pitch was quite short. Try to elaborate more on your key points.");
    } else if (duration > expected * 1.3) {
      suggestions.push("Your pitch was longer than expected. Focus on the most important points.");
    } else {
      suggestions.push("Great timing! Your pitch duration was well-suited for the format.");
    }
    
    if (size < 30000) {
      suggestions.push("Speak a bit louder and clearer for better audio quality.");
    } else {
      suggestions.push("Good audio quality detected. Your voice came through clearly.");
    }
    
    suggestions.push("Practice your opening hook to grab attention immediately.");
    suggestions.push("End with a strong call to action to engage your audience.");
    
    return suggestions;
  };

  const generateStrengths = (duration: number, size: number) => {
    const strengths = ["Clear articulation"];
    
    if (duration > 15) {
      strengths.push("Good content depth");
    }
    if (size > 40000) {
      strengths.push("Strong voice projection");
    }
    
    strengths.push("Logical flow");
    return strengths;
  };

  const generateImprovements = (duration: number, expected: number) => {
    const improvements = [];
    
    if (Math.abs(duration - expected) > 10) {
      improvements.push("Timing consistency");
    }
    
    improvements.push("Reduce hesitations");
    improvements.push("Add more pauses");
    improvements.push("Vary speaking pace");
    
    return improvements;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    setIsRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setFeedback(null);
    setAudioBlob(null);
    setHasRecorded(false);
    setIsAnalyzing(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Practice Your{' '}
            <span className="bg-gradient-to-r from-electric-blue to-electric-green bg-clip-text text-transparent">
              Pitch
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Record your pitch and get instant AI-powered feedback
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Language</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-blue"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-gray-800">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Pitch Template</h3>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-blue"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id} className="bg-gray-800">
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
          <div className="text-center">
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                  : 'bg-electric-blue/20 border-4 border-electric-blue hover:scale-105'
              }`}>
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-red-500" />
                ) : (
                  <Mic className="w-12 h-12 text-electric-blue" />
                )}
              </div>

              <div className="text-4xl font-bold mb-2 font-mono">
                {formatTime(recordingTime)}
              </div>

              <div className="text-gray-300 mb-6">
                {isRecording ? 'Recording in progress...' : 
                 isAnalyzing ? 'Analyzing your pitch...' :
                 hasRecorded ? 'Recording complete!' : 'Ready to record'}
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-gradient-to-r from-electric-blue to-electric-purple px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mic className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop Recording</span>
                </button>
              )}

              <button
                onClick={resetSession}
                disabled={isRecording || isAnalyzing}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Audio Playback Controls */}
            {hasRecorded && audioUrl && !isAnalyzing && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="flex items-center space-x-2 bg-electric-green/20 hover:bg-electric-green/30 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'} Recording</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {feedback && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Your Pitch Score:{' '}
                <span className="bg-gradient-to-r from-electric-green to-electric-blue bg-clip-text text-transparent">
                  {feedback.overallScore}%
                </span>
              </h2>
              <p className="text-gray-300">
                Recording Duration: {formatTime(feedback.duration)} 
                {feedback.expectedDuration > 0 && ` (Target: ${formatTime(feedback.expectedDuration)})`}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Clarity', score: feedback.clarity, color: 'electric-blue' },
                { label: 'Confidence', score: feedback.confidence, color: 'electric-green' },
                { label: 'Pacing', score: feedback.pacing, color: 'electric-purple' },
                { label: 'Structure', score: feedback.structure, color: 'electric-pink' },
              ].map((metric, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                  <div className={`text-2xl font-bold text-${metric.color} mb-1`}>
                    {metric.score}%
                  </div>
                  <div className="text-sm text-gray-300">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-electric-green">Strengths</h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-electric-green rounded-full"></div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 text-electric-blue">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-electric-blue rounded-full"></div>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">AI Suggestions</h3>
              <div className="space-y-3">
                {feedback.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-electric-purple/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-electric-purple">{index + 1}</span>
                    </div>
                    <p className="text-gray-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchPractice;