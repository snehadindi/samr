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
  const [realTimeVolume, setRealTimeVolume] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Advanced speech analysis data
  const speechDataRef = useRef<{
    volumeSamples: number[];
    silencePeriods: number[];
    speechPeriods: number[];
    peakVolumes: number[];
    averageVolume: number;
    maxVolume: number;
    minVolume: number;
    volumeVariance: number;
    speechToSilenceRatio: number;
    consistencyScore: number;
    energyLevels: number[];
    frequencyData: number[][];
    totalSamples: number;
    activeSpeechTime: number;
    pauseCount: number;
    longPauseCount: number;
    speechBursts: number;
  }>({
    volumeSamples: [],
    silencePeriods: [],
    speechPeriods: [],
    peakVolumes: [],
    averageVolume: 0,
    maxVolume: 0,
    minVolume: 100,
    volumeVariance: 0,
    speechToSilenceRatio: 0,
    consistencyScore: 0,
    energyLevels: [],
    frequencyData: [],
    totalSamples: 0,
    activeSpeechTime: 0,
    pauseCount: 0,
    longPauseCount: 0,
    speechBursts: 0
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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const setupAdvancedAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      // Configure analyser for detailed analysis
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Reset speech analysis data
      speechDataRef.current = {
        volumeSamples: [],
        silencePeriods: [],
        speechPeriods: [],
        peakVolumes: [],
        averageVolume: 0,
        maxVolume: 0,
        minVolume: 100,
        volumeVariance: 0,
        speechToSilenceRatio: 0,
        consistencyScore: 0,
        energyLevels: [],
        frequencyData: [],
        totalSamples: 0,
        activeSpeechTime: 0,
        pauseCount: 0,
        longPauseCount: 0,
        speechBursts: 0
      };
      
      // Start advanced audio monitoring
      startAdvancedAudioMonitoring();
    } catch (error) {
      console.error('Error setting up advanced audio analysis:', error);
    }
  };

  const startAdvancedAudioMonitoring = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);
    
    let consecutiveSilence = 0;
    let consecutiveSpeech = 0;
    let lastVolume = 0;
    let isCurrentlySpeaking = false;
    
    const analyzeAudio = () => {
      if (!analyserRef.current || !isRecording) return;
      
      // Get time domain data (waveform)
      analyserRef.current.getByteTimeDomainData(dataArray);
      // Get frequency domain data (spectrum)
      analyserRef.current.getByteFrequencyData(frequencyArray);
      
      // Calculate RMS volume (more accurate than simple average)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const sample = (dataArray[i] - 128) / 128;
        sum += sample * sample;
      }
      const rmsVolume = Math.sqrt(sum / bufferLength) * 100;
      
      // Calculate frequency energy distribution
      const lowFreq = frequencyArray.slice(0, bufferLength / 4).reduce((a, b) => a + b, 0);
      const midFreq = frequencyArray.slice(bufferLength / 4, bufferLength / 2).reduce((a, b) => a + b, 0);
      const highFreq = frequencyArray.slice(bufferLength / 2).reduce((a, b) => a + b, 0);
      const totalEnergy = lowFreq + midFreq + highFreq;
      
      // Update real-time volume display
      setRealTimeVolume(rmsVolume);
      
      // Store detailed analysis data
      const speechData = speechDataRef.current;
      speechData.volumeSamples.push(rmsVolume);
      speechData.energyLevels.push(totalEnergy);
      speechData.frequencyData.push([lowFreq, midFreq, highFreq]);
      speechData.totalSamples++;
      
      // Determine if currently speaking (more sophisticated threshold)
      const speechThreshold = 8; // Minimum volume for speech
      const energyThreshold = 1000; // Minimum energy for speech
      const isSpeaking = rmsVolume > speechThreshold && totalEnergy > energyThreshold;
      
      if (isSpeaking) {
        consecutiveSpeech++;
        consecutiveSilence = 0;
        speechData.activeSpeechTime++;
        speechData.speechPeriods.push(rmsVolume);
        
        // Track speech bursts
        if (!isCurrentlySpeaking) {
          speechData.speechBursts++;
          isCurrentlySpeaking = true;
        }
        
        // Track peak volumes (significant emphasis)
        if (rmsVolume > lastVolume * 1.3 && rmsVolume > 15) {
          speechData.peakVolumes.push(rmsVolume);
        }
      } else {
        consecutiveSilence++;
        consecutiveSpeech = 0;
        speechData.silencePeriods.push(rmsVolume);
        
        // Count pauses
        if (isCurrentlySpeaking) {
          speechData.pauseCount++;
          isCurrentlySpeaking = false;
        }
        
        // Count long pauses (more than 1 second of silence)
        if (consecutiveSilence > 20) { // ~1 second at 20fps
          speechData.longPauseCount++;
        }
      }
      
      // Update volume statistics
      speechData.maxVolume = Math.max(speechData.maxVolume, rmsVolume);
      speechData.minVolume = Math.min(speechData.minVolume, rmsVolume);
      
      lastVolume = rmsVolume;
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      }
    };
    
    analyzeAudio();
  };

  const calculateAdvancedMetrics = () => {
    const data = speechDataRef.current;
    
    if (data.volumeSamples.length === 0) return;
    
    // Calculate average volume
    data.averageVolume = data.volumeSamples.reduce((a, b) => a + b, 0) / data.volumeSamples.length;
    
    // Calculate volume variance (consistency indicator)
    const variance = data.volumeSamples.reduce((acc, vol) => acc + Math.pow(vol - data.averageVolume, 2), 0) / data.volumeSamples.length;
    data.volumeVariance = Math.sqrt(variance);
    
    // Calculate speech to silence ratio
    const totalSpeechSamples = data.speechPeriods.length;
    const totalSilenceSamples = data.silencePeriods.length;
    data.speechToSilenceRatio = totalSpeechSamples / (totalSpeechSamples + totalSilenceSamples);
    
    // Calculate consistency score (lower variance = higher consistency)
    data.consistencyScore = Math.max(0, 100 - (data.volumeVariance * 2));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      
      // Setup advanced audio analysis
      setupAdvancedAudioAnalysis(stream);
      
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
        
        // Calculate final metrics
        calculateAdvancedMetrics();
        
        setHasRecorded(true);
        analyzePitch(audioBlob);
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
      setRealTimeVolume(0);

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
    
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
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
    setRealTimeVolume(0);
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

  const analyzePitch = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time for realistic feel
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const data = speechDataRef.current;
      const audioDuration = recordingTime;
      const expectedDuration = templates.find(t => t.id === selectedTemplate)?.duration || 30;
      const audioSize = audioBlob.size;
      
      // Calculate sophisticated scores based on actual speech analysis
      const clarityScore = calculateAdvancedClarityScore(data, audioSize, audioDuration);
      const confidenceScore = calculateAdvancedConfidenceScore(data, audioDuration);
      const pacingScore = calculateAdvancedPacingScore(audioDuration, expectedDuration, data);
      const structureScore = calculateAdvancedStructureScore(data, audioDuration);
      
      const overallScore = Math.round((clarityScore + confidenceScore + pacingScore + structureScore) / 4);
      
      const detailedFeedback = {
        overallScore: Math.min(100, Math.max(20, overallScore)),
        clarity: Math.min(100, Math.max(20, clarityScore)),
        confidence: Math.min(100, Math.max(20, confidenceScore)),
        pacing: Math.min(100, Math.max(20, pacingScore)),
        structure: Math.min(100, Math.max(20, structureScore)),
        duration: audioDuration,
        expectedDuration: expectedDuration,
        audioSize: audioSize,
        speechData: data,
        suggestions: generateAdvancedSuggestions(audioDuration, expectedDuration, data, audioSize),
        strengths: generateAdvancedStrengths(data, audioDuration, audioSize),
        improvements: generateAdvancedImprovements(data, audioDuration, expectedDuration),
        technicalDetails: {
          averageVolume: Math.round(data.averageVolume * 10) / 10,
          volumeConsistency: Math.round(data.consistencyScore),
          speechRatio: Math.round(data.speechToSilenceRatio * 100),
          pauseCount: data.pauseCount,
          speechBursts: data.speechBursts,
          peakEmphasis: data.peakVolumes.length
        }
      };
      
      setFeedback(detailedFeedback);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try recording again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateAdvancedClarityScore = (data: any, audioSize: number, duration: number) => {
    let score = 30; // Lower base score for more realistic results
    
    // Audio quality based on file size and duration
    const sizePerSecond = audioSize / duration;
    if (sizePerSecond > 12000) score += 25; // Excellent quality
    else if (sizePerSecond > 8000) score += 20; // Good quality
    else if (sizePerSecond > 4000) score += 15; // Decent quality
    else if (sizePerSecond < 2000) score -= 15; // Poor quality
    
    // Volume level (too quiet = unclear)
    if (data.averageVolume > 25) score += 20; // Clear, strong voice
    else if (data.averageVolume > 15) score += 15; // Good volume
    else if (data.averageVolume > 8) score += 10; // Acceptable volume
    else if (data.averageVolume < 5) score -= 25; // Too quiet
    
    // Volume consistency (steady voice = clearer)
    if (data.consistencyScore > 80) score += 15; // Very consistent
    else if (data.consistencyScore > 60) score += 10; // Fairly consistent
    else if (data.consistencyScore < 40) score -= 10; // Inconsistent
    
    // Speech to silence ratio (too much silence = unclear delivery)
    if (data.speechToSilenceRatio > 0.7) score += 10; // Good speech flow
    else if (data.speechToSilenceRatio < 0.4) score -= 15; // Too much silence
    
    // Frequency distribution (balanced frequencies = clearer speech)
    if (data.frequencyData.length > 0) {
      const avgFreqData = data.frequencyData.reduce((acc, freq) => [
        acc[0] + freq[0], acc[1] + freq[1], acc[2] + freq[2]
      ], [0, 0, 0]).map(sum => sum / data.frequencyData.length);
      
      const totalEnergy = avgFreqData[0] + avgFreqData[1] + avgFreqData[2];
      if (totalEnergy > 5000) score += 10; // Good energy distribution
    }
    
    return Math.round(score);
  };

  const calculateAdvancedConfidenceScore = (data: any, duration: number) => {
    let score = 35; // Lower base score
    
    // Volume strength indicates confidence
    if (data.averageVolume > 30) score += 25; // Very confident voice
    else if (data.averageVolume > 20) score += 20; // Confident voice
    else if (data.averageVolume > 12) score += 15; // Moderate confidence
    else if (data.averageVolume < 8) score -= 20; // Lacks confidence
    
    // Peak volumes (emphasis shows engagement and confidence)
    const emphasisRatio = data.peakVolumes.length / duration;
    if (emphasisRatio > 0.3) score += 15; // Good emphasis
    else if (emphasisRatio > 0.15) score += 10; // Some emphasis
    else if (emphasisRatio < 0.05) score -= 10; // Monotone delivery
    
    // Speech bursts (confident speakers have good speech flow)
    const burstsPerMinute = (data.speechBursts / duration) * 60;
    if (burstsPerMinute > 8 && burstsPerMinute < 20) score += 15; // Good flow
    else if (burstsPerMinute > 25) score -= 10; // Too choppy
    else if (burstsPerMinute < 4) score -= 15; // Too hesitant
    
    // Long pauses indicate hesitation
    if (data.longPauseCount > duration * 0.1) score -= 15; // Too many long pauses
    
    // Duration (confident speakers are willing to speak)
    if (duration > 20) score += 10; // Willing to speak at length
    else if (duration < 8) score -= 15; // Very brief, possibly nervous
    
    // Volume variance (some variation shows natural confidence)
    if (data.volumeVariance > 5 && data.volumeVariance < 15) score += 10; // Natural variation
    else if (data.volumeVariance > 25) score -= 10; // Too erratic
    
    return Math.round(score);
  };

  const calculateAdvancedPacingScore = (duration: number, expectedDuration: number, data: any) => {
    let score = 40; // Base score
    
    // Duration matching (critical for pacing)
    const durationDiff = Math.abs(duration - expectedDuration);
    const durationRatio = expectedDuration > 0 ? durationDiff / expectedDuration : 0;
    
    if (durationRatio < 0.1) score += 30; // Perfect timing
    else if (durationRatio < 0.2) score += 25; // Excellent timing
    else if (durationRatio < 0.3) score += 15; // Good timing
    else if (durationRatio < 0.5) score += 5; // Acceptable timing
    else if (durationRatio > 0.8) score -= 25; // Poor timing
    
    // Speech to silence ratio (indicates pacing)
    if (data.speechToSilenceRatio >= 0.6 && data.speechToSilenceRatio <= 0.8) score += 20; // Excellent pacing
    else if (data.speechToSilenceRatio >= 0.5 && data.speechToSilenceRatio <= 0.85) score += 15; // Good pacing
    else if (data.speechToSilenceRatio < 0.4) score -= 20; // Too slow
    else if (data.speechToSilenceRatio > 0.9) score -= 15; // Too fast
    
    // Pause frequency (natural pauses improve pacing)
    const pausesPerMinute = (data.pauseCount / duration) * 60;
    if (pausesPerMinute > 4 && pausesPerMinute < 12) score += 15; // Good pause frequency
    else if (pausesPerMinute > 20) score -= 15; // Too many pauses
    else if (pausesPerMinute < 2) score -= 10; // Too few pauses
    
    // Long pause penalty
    if (data.longPauseCount > 0) score -= Math.min(15, data.longPauseCount * 5);
    
    return Math.round(score);
  };

  const calculateAdvancedStructureScore = (data: any, duration: number) => {
    let score = 45; // Base score (structure is harder to measure from audio alone)
    
    // Speech bursts indicate organized thoughts
    const burstsPerMinute = (data.speechBursts / duration) * 60;
    if (burstsPerMinute > 6 && burstsPerMinute < 15) score += 20; // Well organized
    else if (burstsPerMinute > 20) score -= 15; // Too fragmented
    else if (burstsPerMinute < 3) score -= 10; // Lacks structure
    
    // Volume progression (good structure often has varied emphasis)
    if (data.peakVolumes.length > 0) {
      const emphasisDistribution = data.peakVolumes.length / duration;
      if (emphasisDistribution > 0.1 && emphasisDistribution < 0.4) score += 15; // Good emphasis distribution
    }
    
    // Consistency in delivery suggests preparation
    if (data.consistencyScore > 70) score += 15; // Well prepared
    else if (data.consistencyScore < 40) score -= 10; // Unprepared
    
    // Duration factor (longer speeches need better structure)
    if (duration > 60) {
      if (data.speechBursts > 8) score += 10; // Good for long speech
      else score -= 10; // Poor structure for long speech
    }
    
    // Speech flow (fewer interruptions = better structure)
    const flowScore = data.speechToSilenceRatio * 100;
    if (flowScore > 65 && flowScore < 85) score += 10; // Good flow
    
    return Math.round(score);
  };

  const generateAdvancedSuggestions = (duration: number, expected: number, data: any, size: number) => {
    const suggestions = [];
    
    // Duration-specific feedback
    if (expected > 0) {
      const durationRatio = Math.abs(duration - expected) / expected;
      if (duration < expected * 0.7) {
        suggestions.push(`Your pitch was ${Math.round((expected - duration))} seconds shorter than the ${expected}s target. Consider expanding on your key value propositions and market opportunity.`);
      } else if (duration > expected * 1.3) {
        suggestions.push(`Your pitch exceeded the ${expected}s target by ${Math.round(duration - expected)} seconds. Focus on your most compelling points and practice concise delivery.`);
      } else {
        suggestions.push(`Excellent timing! Your ${duration}s pitch fits well within the ${expected}s format.`);
      }
    }
    
    // Volume and clarity feedback
    if (data.averageVolume < 12) {
      suggestions.push(`Your average speaking volume was ${Math.round(data.averageVolume)}%. Speak louder and project your voice more confidently - investors need to hear every word clearly.`);
    } else if (data.averageVolume > 35) {
      suggestions.push(`Great voice projection! Your ${Math.round(data.averageVolume)}% average volume shows confidence and ensures clear communication.`);
    }
    
    // Consistency feedback
    if (data.consistencyScore < 50) {
      suggestions.push(`Your volume varied significantly (consistency: ${Math.round(data.consistencyScore)}%). Practice maintaining steady energy throughout your pitch.`);
    } else if (data.consistencyScore > 80) {
      suggestions.push(`Excellent consistency! Your steady delivery (${Math.round(data.consistencyScore)}% consistency) shows good preparation and control.`);
    }
    
    // Pacing and flow feedback
    const speechRatio = Math.round(data.speechToSilenceRatio * 100);
    if (speechRatio < 50) {
      suggestions.push(`You spoke only ${speechRatio}% of the time with ${data.pauseCount} pauses. Reduce hesitations and speak more fluidly to maintain audience engagement.`);
    } else if (speechRatio > 85) {
      suggestions.push(`You spoke ${speechRatio}% of the time. Consider adding strategic pauses to let key points resonate with your audience.`);
    } else {
      suggestions.push(`Perfect speech flow! Your ${speechRatio}% speaking ratio with ${data.pauseCount} natural pauses creates excellent pacing.`);
    }
    
    // Emphasis and engagement feedback
    if (data.peakVolumes.length < duration * 0.1) {
      suggestions.push(`Add more vocal emphasis to highlight key points. You had ${data.peakVolumes.length} emphasis moments - aim for more variation to keep listeners engaged.`);
    } else if (data.peakVolumes.length > duration * 0.4) {
      suggestions.push(`You emphasized points ${data.peakVolumes.length} times. While enthusiasm is great, be more selective with emphasis for maximum impact.`);
    }
    
    // Technical quality feedback
    const qualityScore = Math.round(size / duration / 1000);
    if (qualityScore < 4) {
      suggestions.push(`Audio quality could be improved (${qualityScore}KB/s). Use a better microphone or move closer to your device for clearer recording.`);
    }
    
    return suggestions.slice(0, 4); // Limit to most important suggestions
  };

  const generateAdvancedStrengths = (data: any, duration: number, size: number) => {
    const strengths = [];
    
    if (data.averageVolume > 20) {
      strengths.push(`Strong voice projection (${Math.round(data.averageVolume)}% avg volume)`);
    }
    
    if (data.consistencyScore > 70) {
      strengths.push(`Consistent delivery (${Math.round(data.consistencyScore)}% consistency)`);
    }
    
    if (duration > 20) {
      strengths.push(`Comprehensive content coverage (${duration}s)`);
    }
    
    const speechRatio = data.speechToSilenceRatio * 100;
    if (speechRatio > 60 && speechRatio < 85) {
      strengths.push(`Well-paced delivery (${Math.round(speechRatio)}% speech ratio)`);
    }
    
    if (data.peakVolumes.length > duration * 0.15) {
      strengths.push(`Good vocal emphasis (${data.peakVolumes.length} emphasis points)`);
    }
    
    if (data.speechBursts > 4 && data.speechBursts < duration * 0.3) {
      strengths.push(`Organized speech flow (${data.speechBursts} speech segments)`);
    }
    
    if (size / duration > 8000) {
      strengths.push(`Clear audio quality (${Math.round(size/duration/1000)}KB/s)`);
    }
    
    if (strengths.length === 0) {
      strengths.push("Completed the full recording session");
    }
    
    return strengths.slice(0, 4);
  };

  const generateAdvancedImprovements = (data: any, duration: number, expected: number) => {
    const improvements = [];
    
    if (Math.abs(duration - expected) > expected * 0.2) {
      improvements.push("Timing precision");
    }
    
    if (data.averageVolume < 18) {
      improvements.push("Voice projection");
    }
    
    if (data.consistencyScore < 60) {
      improvements.push("Delivery consistency");
    }
    
    if (data.speechToSilenceRatio < 0.6) {
      improvements.push("Reduce hesitations");
    }
    
    if (data.peakVolumes.length < duration * 0.1) {
      improvements.push("Add vocal emphasis");
    }
    
    if (data.longPauseCount > 2) {
      improvements.push("Minimize long pauses");
    }
    
    if (data.speechBursts < 4) {
      improvements.push("Improve speech flow");
    }
    
    return improvements.slice(0, 4);
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
    setRealTimeVolume(0);
    
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
      volumeSamples: [],
      silencePeriods: [],
      speechPeriods: [],
      peakVolumes: [],
      averageVolume: 0,
      maxVolume: 0,
      minVolume: 100,
      volumeVariance: 0,
      speechToSilenceRatio: 0,
      consistencyScore: 0,
      energyLevels: [],
      frequencyData: [],
      totalSamples: 0,
      activeSpeechTime: 0,
      pauseCount: 0,
      longPauseCount: 0,
      speechBursts: 0
    };
    
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
            Record your pitch and get detailed AI-powered analysis based on your actual speech patterns
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
                {isRecording ? 'Recording in progress... Speak clearly and confidently!' : 
                 isAnalyzing ? 'Analyzing your speech patterns and delivery...' :
                 hasRecorded ? 'Recording complete! Check your detailed analysis below.' : 'Ready to record your pitch'}
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}

              {/* Real-time volume indicator */}
              {isRecording && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Voice Level: {Math.round(realTimeVolume)}%</div>
                  <div className="w-48 h-3 bg-gray-700 rounded-full mx-auto">
                    <div 
                      className={`h-3 rounded-full transition-all duration-100 ${
                        realTimeVolume > 20 ? 'bg-gradient-to-r from-electric-green to-electric-blue' :
                        realTimeVolume > 10 ? 'bg-gradient-to-r from-yellow-500 to-electric-blue' :
                        'bg-gradient-to-r from-red-500 to-yellow-500'
                      }`}
                      style={{ width: `${Math.min(100, realTimeVolume * 3)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {realTimeVolume < 5 ? 'Speak louder' : realTimeVolume > 30 ? 'Good volume!' : 'Keep speaking'}
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
                  feedback.overallScore >= 40 ? 'from-electric-purple to-electric-pink' :
                  'from-electric-pink to-red-500'
                } bg-clip-text text-transparent`}>
                  {feedback.overallScore}%
                </span>
              </h2>
              <p className="text-gray-300">
                Recording: {formatTime(feedback.duration)} 
                {feedback.expectedDuration > 0 && ` (Target: ${formatTime(feedback.expectedDuration)})`}
              </p>
              {feedback.technicalDetails && (
                <div className="text-sm text-gray-400 mt-2 space-x-4">
                  <span>Avg Volume: {feedback.technicalDetails.averageVolume}%</span>
                  <span>Speech Ratio: {feedback.technicalDetails.speechRatio}%</span>
                  <span>Pauses: {feedback.technicalDetails.pauseCount}</span>
                  <span>Emphasis: {feedback.technicalDetails.peakEmphasis}</span>
                </div>
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
                      <span className="text-sm">{strength}</span>
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
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Detailed Suggestions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Detailed AI Analysis & Recommendations</h3>
              <div className="space-y-4">
                {feedback.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-electric-purple/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-electric-purple">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
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