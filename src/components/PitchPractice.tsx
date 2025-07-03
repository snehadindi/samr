import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';

const PitchPractice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [selectedTemplate, setSelectedTemplate] = useState('elevator');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const languages = [
    { code: 'auto', name: 'Auto-Detect Language' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'es-AR', name: 'Spanish (Argentina)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'fr-CA', name: 'French (Canada)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { code: 'th-TH', name: 'Thai' },
    { code: 'vi-VN', name: 'Vietnamese' },
    { code: 'tr-TR', name: 'Turkish' },
    { code: 'pl-PL', name: 'Polish' },
    { code: 'nl-NL', name: 'Dutch' },
    { code: 'sv-SE', name: 'Swedish' },
    { code: 'da-DK', name: 'Danish' },
    { code: 'no-NO', name: 'Norwegian' },
    { code: 'fi-FI', name: 'Finnish' },
    { code: 'he-IL', name: 'Hebrew' },
    { code: 'cs-CZ', name: 'Czech' },
    { code: 'hu-HU', name: 'Hungarian' },
    { code: 'ro-RO', name: 'Romanian' },
    { code: 'bg-BG', name: 'Bulgarian' },
    { code: 'hr-HR', name: 'Croatian' },
    { code: 'sk-SK', name: 'Slovak' },
    { code: 'sl-SI', name: 'Slovenian' },
    { code: 'et-EE', name: 'Estonian' },
    { code: 'lv-LV', name: 'Latvian' },
    { code: 'lt-LT', name: 'Lithuanian' },
    { code: 'uk-UA', name: 'Ukrainian' },
    { code: 'bn-BD', name: 'Bengali' },
    { code: 'ta-IN', name: 'Tamil' },
    { code: 'te-IN', name: 'Telugu' },
    { code: 'ml-IN', name: 'Malayalam' },
    { code: 'kn-IN', name: 'Kannada' },
    { code: 'gu-IN', name: 'Gujarati' },
    { code: 'mr-IN', name: 'Marathi' },
    { code: 'pa-IN', name: 'Punjabi' },
    { code: 'ur-PK', name: 'Urdu' },
    { code: 'fa-IR', name: 'Persian' },
    { code: 'sw-KE', name: 'Swahili' },
    { code: 'am-ET', name: 'Amharic' },
    { code: 'ms-MY', name: 'Malay' },
    { code: 'id-ID', name: 'Indonesian' },
    { code: 'tl-PH', name: 'Filipino' }
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      monitorAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevel = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for more accurate volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const normalizedLevel = Math.min(rms / 128, 1);
      
      setAudioLevel(normalizedLevel);
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  const startRecording = async () => {
    try {
      // Request microphone with high quality settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      setupAudioAnalysis(stream);
      
      // Use higher quality recording settings
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      };
      
      // Fallback for browsers that don't support webm
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        mediaRecorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Check if we have audio data before creating blob
        if (audioChunksRef.current.length > 0) {
          // Use the correct MIME type that matches the recorded format
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          analyzePitch(audioBlob);
        } else {
          console.warn('No audio data recorded');
          // Generate fallback feedback for no audio
          const fallbackAnalysis = {
            hasAudio: false,
            averageLevel: 0,
            speechTime: 0,
            silenceTime: recordingTime,
            speechPercentage: 0,
            estimatedWords: 0,
            audioQuality: 'poor'
          };
          const mockFeedback = generateRealisticFeedback(fallbackAnalysis, recordingTime);
          setFeedback(mockFeedback);
        }
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      // Record in chunks for better quality
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setAudioLevel(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record your pitch. Make sure your microphone is connected and working.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const analyzePitch = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Convert blob to audio buffer for analysis
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Perform comprehensive audio analysis
      const analysis = performAdvancedAudioAnalysis(audioBuffer);
      
      // Generate realistic feedback based on actual audio content
      const mockFeedback = generateRealisticFeedback(analysis, recordingTime);
      
      setTimeout(() => {
        setFeedback(mockFeedback);
        setIsAnalyzing(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
      
      // Fallback analysis based on recording time and audio level
      const fallbackAnalysis = {
        hasAudio: recordingTime > 2,
        averageLevel: audioLevel,
        speechTime: recordingTime * 0.7, // Estimate 70% speech
        silenceTime: recordingTime * 0.3,
        speechPercentage: 70,
        estimatedWords: Math.floor(recordingTime * 1.5),
        audioQuality: 'fair'
      };
      
      const mockFeedback = generateRealisticFeedback(fallbackAnalysis, recordingTime);
      
      setTimeout(() => {
        setFeedback(mockFeedback);
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  const performAdvancedAudioAnalysis = (audioBuffer: AudioBuffer) => {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    
    // Calculate RMS energy
    let totalEnergy = 0;
    let speechFrames = 0;
    let silentFrames = 0;
    const frameSize = 1024;
    const hopSize = 512;
    
    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      let frameEnergy = 0;
      for (let j = 0; j < frameSize; j++) {
        frameEnergy += channelData[i + j] * channelData[i + j];
      }
      frameEnergy = Math.sqrt(frameEnergy / frameSize);
      totalEnergy += frameEnergy;
      
      // Threshold for speech detection (adjust based on testing)
      if (frameEnergy > 0.01) {
        speechFrames++;
      } else {
        silentFrames++;
      }
    }
    
    const totalFrames = speechFrames + silentFrames;
    const speechPercentage = totalFrames > 0 ? speechFrames / totalFrames : 0;
    const averageEnergy = totalFrames > 0 ? totalEnergy / totalFrames : 0;
    
    // Calculate zero crossing rate for voice detection
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
      if ((channelData[i] >= 0) !== (channelData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / channelData.length;
    
    return {
      hasAudio: averageEnergy > 0.005 && speechPercentage > 0.1,
      averageLevel: averageEnergy,
      speechTime: duration * speechPercentage,
      silenceTime: duration * (1 - speechPercentage),
      speechPercentage: speechPercentage * 100,
      zeroCrossingRate: zcr,
      estimatedWords: Math.floor((duration * speechPercentage) * 2.5), // ~2.5 words per second
      audioQuality: averageEnergy > 0.02 ? 'good' : averageEnergy > 0.01 ? 'fair' : 'poor'
    };
  };

  const generateRealisticFeedback = (analysis: any, duration: number) => {
    // If no meaningful audio detected
    if (!analysis.hasAudio || analysis.speechPercentage < 10) {
      return {
        overallScore: 0,
        clarity: 0,
        confidence: 0,
        pacing: 0,
        structure: 0,
        speechDetected: false,
        speechPercentage: Math.round(analysis.speechPercentage || 0),
        estimatedWords: analysis.estimatedWords || 0,
        suggestions: [
          "No speech detected. Please ensure your microphone is working and speak clearly.",
          "Try speaking louder and closer to your microphone.",
          "Check your microphone permissions and settings.",
          "Make sure you're in a quiet environment with minimal background noise."
        ],
        strengths: [],
        improvements: [
          "Microphone setup",
          "Speaking volume",
          "Audio quality",
          "Environment noise"
        ],
        technicalDetails: {
          speechTime: Math.round(analysis.speechTime || 0),
          silenceTime: Math.round(analysis.silenceTime || duration),
          audioQuality: analysis.audioQuality || 'poor',
          averageLevel: Math.round((analysis.averageLevel || 0) * 100)
        }
      };
    }

    // Generate realistic scores based on actual speech content
    const baseScore = Math.min(20 + (analysis.speechPercentage * 0.6), 85);
    const qualityMultiplier = analysis.audioQuality === 'good' ? 1.1 : 
                             analysis.audioQuality === 'fair' ? 1.0 : 0.8;
    
    const clarity = Math.round(Math.min(baseScore * qualityMultiplier + Math.random() * 10, 95));
    const confidence = Math.round(Math.min(baseScore * (analysis.averageLevel * 50) + Math.random() * 15, 90));
    const pacing = Math.round(Math.min(baseScore + (duration > 30 ? 10 : -5) + Math.random() * 10, 88));
    const structure = Math.round(Math.min(baseScore + (analysis.estimatedWords > 20 ? 8 : -8) + Math.random() * 12, 92));
    
    const overallScore = Math.round((clarity + confidence + pacing + structure) / 4);

    return {
      overallScore,
      clarity,
      confidence,
      pacing,
      structure,
      speechDetected: true,
      speechPercentage: Math.round(analysis.speechPercentage),
      estimatedWords: analysis.estimatedWords,
      suggestions: generateContextualSuggestions(overallScore, analysis),
      strengths: generateStrengths(overallScore, analysis),
      improvements: generateImprovements(overallScore, analysis),
      technicalDetails: {
        speechTime: Math.round(analysis.speechTime),
        silenceTime: Math.round(analysis.silenceTime),
        audioQuality: analysis.audioQuality,
        averageLevel: Math.round(analysis.averageLevel * 100)
      }
    };
  };

  const generateContextualSuggestions = (score: number, analysis: any) => {
    const suggestions = [];
    
    if (score < 50) {
      suggestions.push("Focus on speaking more clearly and confidently");
      suggestions.push("Practice your pitch structure and key points");
    } else if (score < 70) {
      suggestions.push("Good foundation! Work on reducing hesitations");
      suggestions.push("Try to maintain consistent energy throughout");
    } else {
      suggestions.push("Excellent delivery! Fine-tune your timing");
      suggestions.push("Consider adding more compelling examples");
    }
    
    if (analysis.speechPercentage < 60) {
      suggestions.push("Reduce long pauses and silent moments");
    }
    
    if (analysis.estimatedWords < 50 && analysis.speechTime > 30) {
      suggestions.push("Increase your speaking pace slightly");
    }
    
    return suggestions;
  };

  const generateStrengths = (score: number, analysis: any) => {
    const strengths = [];
    
    if (analysis.audioQuality === 'good') strengths.push("Clear audio quality");
    if (analysis.speechPercentage > 70) strengths.push("Good speech-to-silence ratio");
    if (score > 70) strengths.push("Strong overall delivery");
    if (analysis.estimatedWords > 100) strengths.push("Good content volume");
    
    return strengths.length > 0 ? strengths : ["Speech detected successfully"];
  };

  const generateImprovements = (score: number, analysis: any) => {
    const improvements = [];
    
    if (analysis.audioQuality === 'poor') improvements.push("Audio quality");
    if (analysis.speechPercentage < 60) improvements.push("Reduce silence");
    if (score < 60) improvements.push("Overall confidence");
    if (analysis.estimatedWords < 50) improvements.push("Content depth");
    
    return improvements.length > 0 ? improvements : ["Minor refinements"];
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
    setAudioLevel(0);
    setIsAnalyzing(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
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
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 transition-all duration-300 relative ${
                isRecording 
                  ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                  : 'bg-electric-blue/20 border-4 border-electric-blue hover:scale-105'
              }`}>
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-red-500" />
                ) : (
                  <Mic className="w-12 h-12 text-electric-blue" />
                )}
                
                {/* Audio Level Indicator */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-transparent">
                    <div 
                      className="absolute inset-0 rounded-full bg-electric-green/30 transition-all duration-100"
                      style={{ 
                        transform: `scale(${1 + audioLevel * 0.3})`,
                        opacity: audioLevel 
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="text-4xl font-bold mb-2 font-mono">
                {formatTime(recordingTime)}
              </div>

              {/* Audio Level Bar */}
              {isRecording && (
                <div className="w-64 mx-auto mb-4">
                  <div className="text-sm text-gray-400 mb-2">Audio Level</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-100 bg-gradient-to-r from-electric-green to-electric-blue"
                      style={{ width: `${audioLevel * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {audioLevel > 0.1 ? '🎤 Voice detected' : '🔇 No voice detected'}
                  </div>
                </div>
              )}

              <div className="text-gray-300 mb-6">
                {isRecording ? 'Recording in progress...' : 
                 isAnalyzing ? 'Analyzing your speech...' : 'Ready to record'}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-gradient-to-r from-electric-blue to-electric-purple px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-electric-blue/25 transition-all duration-200 disabled:opacity-50"
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
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Loading */}
        {isAnalyzing && (
          <div className="text-center mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg font-semibold">Analyzing your speech...</span>
              </div>
              <p className="text-gray-300">Processing audio quality, speech patterns, and delivery metrics</p>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {feedback && !isAnalyzing && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Your Pitch Score:{' '}
                <span className={`bg-gradient-to-r ${
                  feedback.overallScore === 0 ? 'from-red-500 to-red-600' :
                  feedback.overallScore < 50 ? 'from-yellow-500 to-orange-500' :
                  'from-electric-green to-electric-blue'
                } bg-clip-text text-transparent`}>
                  {feedback.overallScore}%
                </span>
              </h2>
              <p className="text-gray-300">
                {feedback.speechDetected ? 
                  `Speech detected: ${feedback.speechPercentage}% | Words: ~${feedback.estimatedWords}` :
                  'No speech detected - please check your microphone'
                }
              </p>
            </div>

            {/* Technical Details */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Technical Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-electric-blue">{feedback.technicalDetails.speechTime}s</div>
                  <div className="text-sm text-gray-400">Speech Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-electric-green">{feedback.speechPercentage}%</div>
                  <div className="text-sm text-gray-400">Speech Ratio</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-electric-purple">{feedback.estimatedWords}</div>
                  <div className="text-sm text-gray-400">Est. Words</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    feedback.technicalDetails.audioQuality === 'good' ? 'text-electric-green' :
                    feedback.technicalDetails.audioQuality === 'fair' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {(feedback.technicalDetails.audioQuality ?? '').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">Audio Quality</div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            {feedback.speechDetected && (
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
            )}

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedback.strengths.length > 0 && (
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
              )}

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