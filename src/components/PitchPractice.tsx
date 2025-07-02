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
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeDataRef = useRef<number[]>([]);
  const speechDataRef = useRef<{
    totalVolume: number;
    silencePeriods: number;
    peakVolumes: number[];
    averageVolume: number;
    speechDuration: number;
  }>({
    totalVolume: 0,
    silencePeriods: 0,
    peakVolumes: [],
    averageVolume: 0,
    speechDuration: 0
  });

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
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Reset speech data
      speechDataRef.current = {
        totalVolume: 0,
        silencePeriods: 0,
        peakVolumes: [],
        averageVolume: 0,
        speechDuration: 0
      };
      volumeDataRef.current = [];
      
      // Start monitoring audio levels
      monitorAudioLevels();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const monitorAudioLevels = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudioLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate volume level
      const sum = dataArray.reduce((acc, value) => acc + value, 0);
      const average = sum / bufferLength;
      const volume = (average / 255) * 100;
      
      volumeDataRef.current.push(volume);
      speechDataRef.current.totalVolume += volume;
      
      // Detect silence (volume below threshold)
      if (volume < 5) {
        speechDataRef.current.silencePeriods++;
      } else {
        speechDataRef.current.speechDuration++;
        if (volume > 30) {
          speechDataRef.current.peakVolumes.push(volume);
        }
      }
      
      if (isRecording) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    checkAudioLevel();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      
      // Setup audio analysis
      setupAudioAnalysis(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 
                 MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
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
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Calculate final speech analysis
        const totalSamples = volumeDataRef.current.length;
        if (totalSamples > 0) {
          speechDataRef.current.averageVolume = speechDataRef.current.totalVolume / totalSamples;
        }
        
        setSpeechAnalysis({ ...speechDataRef.current });
        setHasRecorded(true);
        analyzePitch(audioBlob, speechDataRef.current);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Recording error occurred. Please try again.');
        stopRecording();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setFeedback(null);
      setHasRecorded(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      handleMicrophoneError(error);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    // Stop timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    console.log('Recording stopped, timer stopped');
  };

  const handleMicrophoneError = (error: any) => {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          alert('Microphone access denied. Please allow microphone access in your browser settings and try again.');
          break;
        case 'NotFoundError':
          alert('No microphone found. Please connect a microphone and try again.');
          break;
        case 'NotReadableError':
          alert('Microphone is being used by another application. Please close other apps using the microphone and try again.');
          break;
        default:
          alert('Error accessing microphone: ' + error.message);
      }
    } else {
      alert('Please allow microphone access to record your pitch.');
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
        };
      }
      
      audioRef.current.play().catch(error => {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const analyzePitch = async (audioBlob: Blob, speechData: any) => {
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const audioDuration = recordingTime;
      const expectedDuration = templates.find(t => t.id === selectedTemplate)?.duration || 30;
      const audioSize = audioBlob.size;
      
      // Calculate scores based on actual speech analysis
      const clarityScore = calculateClarityScore(speechData, audioSize, audioDuration);
      const confidenceScore = calculateConfidenceScore(speechData, audioDuration);
      const pacingScore = calculatePacingScore(audioDuration, expectedDuration, speechData);
      const structureScore = calculateStructureScore(speechData, audioDuration);
      
      const overallScore = Math.round((clarityScore + confidenceScore + pacingScore + structureScore) / 4);
      
      const mockFeedback = {
        overallScore: Math.min(100, Math.max(30, overallScore)),
        clarity: Math.min(100, Math.max(30, clarityScore)),
        confidence: Math.min(100, Math.max(30, confidenceScore)),
        pacing: Math.min(100, Math.max(30, pacingScore)),
        structure: Math.min(100, Math.max(30, structureScore)),
        duration: audioDuration,
        expectedDuration: expectedDuration,
        audioSize: audioSize,
        speechData: speechData,
        suggestions: generateDetailedSuggestions(audioDuration, expectedDuration, speechData, audioSize),
        strengths: generateDetailedStrengths(speechData, audioDuration, audioSize),
        improvements: generateDetailedImprovements(speechData, audioDuration, expectedDuration)
      };
      
      setFeedback(mockFeedback);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try recording again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateClarityScore = (speechData: any, audioSize: number, duration: number) => {
    let score = 50; // Base score
    
    // Audio quality (file size indicates quality)
    const sizePerSecond = audioSize / duration;
    if (sizePerSecond > 8000) score += 20; // Good quality
    else if (sizePerSecond > 4000) score += 10; // Decent quality
    
    // Average volume (indicates clear speech)
    if (speechData.averageVolume > 20) score += 15;
    else if (speechData.averageVolume > 10) score += 10;
    else if (speechData.averageVolume < 5) score -= 20; // Too quiet
    
    // Speech consistency (fewer silence periods = better clarity)
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio < 0.3) score += 15; // Good speech flow
    else if (silenceRatio > 0.6) score -= 15; // Too many pauses
    
    return Math.round(score);
  };

  const calculateConfidenceScore = (speechData: any, duration: number) => {
    let score = 50; // Base score
    
    // Volume consistency indicates confidence
    if (speechData.averageVolume > 25) score += 20; // Strong voice
    else if (speechData.averageVolume > 15) score += 10; // Moderate voice
    else if (speechData.averageVolume < 8) score -= 15; // Weak voice
    
    // Peak volumes indicate emphasis and engagement
    if (speechData.peakVolumes.length > duration * 0.1) score += 15; // Good emphasis
    
    // Duration indicates confidence to speak
    if (duration > 10) score += 10; // Willing to speak at length
    else if (duration < 5) score -= 10; // Very brief
    
    // Silence periods (too many indicate hesitation)
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio > 0.5) score -= 20; // Too hesitant
    
    return Math.round(score);
  };

  const calculatePacingScore = (duration: number, expectedDuration: number, speechData: any) => {
    let score = 50; // Base score
    
    // Duration matching
    const durationDiff = Math.abs(duration - expectedDuration);
    const durationRatio = durationDiff / expectedDuration;
    
    if (durationRatio < 0.1) score += 25; // Perfect timing
    else if (durationRatio < 0.2) score += 15; // Good timing
    else if (durationRatio < 0.3) score += 5; // Acceptable timing
    else if (durationRatio > 0.5) score -= 20; // Poor timing
    
    // Speech flow (balance of speech and pauses)
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio >= 0.2 && silenceRatio <= 0.4) score += 15; // Good pacing
    else if (silenceRatio < 0.1) score -= 10; // Too fast
    else if (silenceRatio > 0.6) score -= 15; // Too slow
    
    return Math.round(score);
  };

  const calculateStructureScore = (speechData: any, duration: number) => {
    let score = 60; // Base score (harder to measure without content analysis)
    
    // Longer speeches tend to have better structure
    if (duration > 30) score += 10;
    else if (duration < 10) score -= 10;
    
    // Consistent volume suggests organized delivery
    if (speechData.peakVolumes.length > 0) {
      const volumeVariation = Math.max(...speechData.peakVolumes) - Math.min(...speechData.peakVolumes);
      if (volumeVariation > 20 && volumeVariation < 50) score += 10; // Good variation
    }
    
    // Speech-to-silence ratio indicates structure
    const speechRatio = speechData.speechDuration / (speechData.speechDuration + speechData.silencePeriods);
    if (speechRatio >= 0.6 && speechRatio <= 0.8) score += 15; // Well structured
    
    return Math.round(score);
  };

  const generateDetailedSuggestions = (duration: number, expected: number, speechData: any, size: number) => {
    const suggestions = [];
    
    // Duration feedback
    if (duration < expected * 0.7) {
      suggestions.push(`Your pitch was ${Math.round((expected - duration) / expected * 100)}% shorter than recommended. Try to elaborate more on your key points.`);
    } else if (duration > expected * 1.3) {
      suggestions.push(`Your pitch was ${Math.round((duration - expected) / expected * 100)}% longer than recommended. Focus on the most important points.`);
    } else {
      suggestions.push("Excellent timing! Your pitch duration was well-suited for the format.");
    }
    
    // Volume feedback
    if (speechData.averageVolume < 10) {
      suggestions.push("Speak louder and project your voice more confidently. Your audience needs to hear you clearly.");
    } else if (speechData.averageVolume > 40) {
      suggestions.push("Good voice projection! You're speaking at an excellent volume level.");
    }
    
    // Pacing feedback
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio > 0.5) {
      suggestions.push("Try to reduce long pauses and hesitations. Practice your content to speak more fluidly.");
    } else if (silenceRatio < 0.2) {
      suggestions.push("Consider adding strategic pauses to let important points sink in with your audience.");
    } else {
      suggestions.push("Great pacing! You have a good balance of speech and strategic pauses.");
    }
    
    // Audio quality feedback
    const sizePerSecond = size / duration;
    if (sizePerSecond < 4000) {
      suggestions.push("Consider using a better microphone or speaking closer to your device for clearer audio quality.");
    }
    
    return suggestions;
  };

  const generateDetailedStrengths = (speechData: any, duration: number, size: number) => {
    const strengths = [];
    
    if (speechData.averageVolume > 20) {
      strengths.push("Strong voice projection");
    }
    
    if (duration > 15) {
      strengths.push("Good content depth");
    }
    
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio >= 0.2 && silenceRatio <= 0.4) {
      strengths.push("Well-paced delivery");
    }
    
    if (speechData.peakVolumes.length > duration * 0.1) {
      strengths.push("Good vocal emphasis");
    }
    
    if (size / duration > 6000) {
      strengths.push("Clear audio quality");
    }
    
    if (strengths.length === 0) {
      strengths.push("Completed the recording");
    }
    
    return strengths;
  };

  const generateDetailedImprovements = (speechData: any, duration: number, expected: number) => {
    const improvements = [];
    
    if (Math.abs(duration - expected) > expected * 0.2) {
      improvements.push("Timing consistency");
    }
    
    if (speechData.averageVolume < 15) {
      improvements.push("Voice projection");
    }
    
    const silenceRatio = speechData.silencePeriods / (speechData.speechDuration + speechData.silencePeriods);
    if (silenceRatio > 0.4) {
      improvements.push("Reduce hesitations");
    }
    
    if (speechData.peakVolumes.length < duration * 0.05) {
      improvements.push("Add vocal variety");
    }
    
    improvements.push("Practice for fluency");
    
    return improvements.slice(0, 4); // Limit to 4 improvements
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetSession = () => {
    console.log('Resetting session...');
    
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    
    // Reset all states
    setIsRecording(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setFeedback(null);
    setAudioBlob(null);
    setHasRecorded(false);
    setIsAnalyzing(false);
    setSpeechAnalysis(null);
    
    // Clean up resources
    cleanupResources();
    
    // Clean up audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    // Reset audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Reset speech data
    speechDataRef.current = {
      totalVolume: 0,
      silencePeriods: 0,
      peakVolumes: [],
      averageVolume: 0,
      speechDuration: 0
    };
    volumeDataRef.current = [];
    
    console.log('Session reset complete');
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
            Record your pitch and get instant AI-powered feedback based on your actual speech
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Language</h3>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isRecording}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-blue disabled:opacity-50"
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
              disabled={isRecording}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-blue disabled:opacity-50"
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
                {isRecording ? 'Recording in progress... Speak clearly!' : 
                 isAnalyzing ? 'Analyzing your speech patterns...' :
                 hasRecorded ? 'Recording complete! Check your results below.' : 'Ready to record your pitch'}
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}

              {/* Real-time volume indicator */}
              {isRecording && speechAnalysis && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Voice Level</div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto">
                    <div 
                      className="h-2 bg-gradient-to-r from-electric-green to-electric-blue rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(100, (speechDataRef.current.averageVolume || 0) * 2)}%` }}
                    ></div>
                  </div>
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
                disabled={isAnalyzing}
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
                <span className={`bg-gradient-to-r ${
                  feedback.overallScore >= 80 ? 'from-electric-green to-electric-blue' :
                  feedback.overallScore >= 60 ? 'from-electric-blue to-electric-purple' :
                  'from-electric-pink to-electric-purple'
                } bg-clip-text text-transparent`}>
                  {feedback.overallScore}%
                </span>
              </h2>
              <p className="text-gray-300">
                Recording Duration: {formatTime(feedback.duration)} 
                {feedback.expectedDuration > 0 && ` (Target: ${formatTime(feedback.expectedDuration)})`}
              </p>
              {feedback.speechData && (
                <p className="text-sm text-gray-400 mt-2">
                  Average Volume: {Math.round(feedback.speechData.averageVolume)}% | 
                  Audio Quality: {Math.round(feedback.audioSize / feedback.duration / 1000)}KB/s
                </p>
              )}
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
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                    <div
                      className={`h-1 rounded-full bg-${metric.color} transition-all duration-500`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
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
              <h3 className="text-xl font-semibold mb-4">Detailed AI Analysis</h3>
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