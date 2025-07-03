import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';

const PitchPractice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [selectedTemplate, setSelectedTemplate] = useState('elevator');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [realTimeVolume, setRealTimeVolume] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Ultra-precise speech analysis data
  const speechDataRef = useRef<{
    volumeSamples: number[];
    rawAudioSamples: Float32Array[];
    silenceDetected: boolean;
    totalSilenceTime: number;
    actualSpeechTime: number;
    speechSegments: Array<{start: number, end: number, avgVolume: number}>;
    volumeThreshold: number;
    energyThreshold: number;
    speechConfidence: number;
    wordEstimate: number;
    pauseAnalysis: Array<{duration: number, type: 'short' | 'medium' | 'long'}>;
    voiceActivity: boolean[];
    spectralCentroid: number[];
    zeroCrossingRate: number[];
    mfccFeatures: number[][];
    speechQuality: number;
    backgroundNoise: number;
    signalToNoiseRatio: number;
  }>({
    volumeSamples: [],
    rawAudioSamples: [],
    silenceDetected: true,
    totalSilenceTime: 0,
    actualSpeechTime: 0,
    speechSegments: [],
    volumeThreshold: 0.01,
    energyThreshold: 0.001,
    speechConfidence: 0,
    wordEstimate: 0,
    pauseAnalysis: [],
    voiceActivity: [],
    spectralCentroid: [],
    zeroCrossingRate: [],
    mfccFeatures: [],
    speechQuality: 0,
    backgroundNoise: 0,
    signalToNoiseRatio: 0
  });

  const languages = [
    { code: 'auto', name: 'Auto-Detect Language' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
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

  const setupUltraPreciseAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      });
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      // Ultra-precise configuration for speech detection
      analyser.fftSize = 4096; // Higher resolution
      analyser.smoothingTimeConstant = 0.1; // More responsive
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Reset ultra-precise speech analysis data
      speechDataRef.current = {
        volumeSamples: [],
        rawAudioSamples: [],
        silenceDetected: true,
        totalSilenceTime: 0,
        actualSpeechTime: 0,
        speechSegments: [],
        volumeThreshold: 0.01,
        energyThreshold: 0.001,
        speechConfidence: 0,
        wordEstimate: 0,
        pauseAnalysis: [],
        voiceActivity: [],
        spectralCentroid: [],
        zeroCrossingRate: [],
        mfccFeatures: [],
        speechQuality: 0,
        backgroundNoise: 0,
        signalToNoiseRatio: 0
      };
      
      // Start ultra-precise monitoring
      startUltraPreciseMonitoring();
    } catch (error) {
      console.error('Error setting up ultra-precise audio analysis:', error);
    }
  };

  const startUltraPreciseMonitoring = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const timeDataArray = new Float32Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);
    
    let frameCount = 0;
    let speechFrames = 0;
    let silenceFrames = 0;
    let currentSpeechSegment: any = null;
    let backgroundNoiseLevel = 0;
    let noiseCalibrationFrames = 0;
    
    const analyzeUltraPrecise = () => {
      if (!analyserRef.current || !isRecording) return;
      
      frameCount++;
      
      // Get high-precision audio data
      analyserRef.current.getFloatTimeDomainData(timeDataArray);
      analyserRef.current.getByteFrequencyData(frequencyArray);
      
      // Calculate multiple audio features for ultra-precise detection
      const rmsEnergy = calculateRMSEnergy(timeDataArray);
      const zeroCrossings = calculateZeroCrossingRate(timeDataArray);
      const spectralCentroid = calculateSpectralCentroid(frequencyArray);
      const spectralRolloff = calculateSpectralRolloff(frequencyArray);
      const spectralFlux = calculateSpectralFlux(frequencyArray);
      
      // Calibrate background noise for first 30 frames (about 0.6 seconds)
      if (noiseCalibrationFrames < 30) {
        backgroundNoiseLevel += rmsEnergy;
        noiseCalibrationFrames++;
        if (noiseCalibrationFrames === 30) {
          backgroundNoiseLevel = backgroundNoiseLevel / 30;
          speechDataRef.current.backgroundNoise = backgroundNoiseLevel;
          // Set dynamic thresholds based on background noise
          speechDataRef.current.volumeThreshold = Math.max(0.01, backgroundNoiseLevel * 3);
          speechDataRef.current.energyThreshold = Math.max(0.001, backgroundNoiseLevel * 2);
        }
      }
      
      // Store raw audio samples for detailed analysis
      speechDataRef.current.rawAudioSamples.push(new Float32Array(timeDataArray));
      speechDataRef.current.volumeSamples.push(rmsEnergy);
      speechDataRef.current.spectralCentroid.push(spectralCentroid);
      speechDataRef.current.zeroCrossingRate.push(zeroCrossings);
      
      // Ultra-precise speech detection using multiple criteria
      const isSpeech = detectSpeechUltraPrecise(
        rmsEnergy, 
        zeroCrossings, 
        spectralCentroid, 
        spectralRolloff, 
        spectralFlux,
        backgroundNoiseLevel
      );
      
      speechDataRef.current.voiceActivity.push(isSpeech);
      
      // Update real-time volume (scaled for display)
      const displayVolume = Math.min(100, (rmsEnergy / speechDataRef.current.volumeThreshold) * 20);
      setRealTimeVolume(displayVolume);
      
      if (isSpeech) {
        speechFrames++;
        speechDataRef.current.actualSpeechTime++;
        speechDataRef.current.silenceDetected = false;
        
        // Start or continue speech segment
        if (!currentSpeechSegment) {
          currentSpeechSegment = {
            start: frameCount,
            end: frameCount,
            avgVolume: rmsEnergy,
            samples: 1
          };
        } else {
          currentSpeechSegment.end = frameCount;
          currentSpeechSegment.avgVolume = 
            (currentSpeechSegment.avgVolume * currentSpeechSegment.samples + rmsEnergy) / 
            (currentSpeechSegment.samples + 1);
          currentSpeechSegment.samples++;
        }
      } else {
        silenceFrames++;
        speechDataRef.current.totalSilenceTime++;
        
        // End current speech segment if it exists
        if (currentSpeechSegment) {
          speechDataRef.current.speechSegments.push(currentSpeechSegment);
          currentSpeechSegment = null;
        }
      }
      
      // Calculate speech confidence and quality metrics
      if (frameCount > 0) {
        speechDataRef.current.speechConfidence = speechFrames / frameCount;
        speechDataRef.current.signalToNoiseRatio = 
          backgroundNoiseLevel > 0 ? (rmsEnergy / backgroundNoiseLevel) : 0;
        
        // Estimate word count based on speech patterns
        const avgSpeechSegmentLength = speechDataRef.current.speechSegments.length > 0 ?
          speechDataRef.current.speechSegments.reduce((sum, seg) => sum + (seg.end - seg.start), 0) / 
          speechDataRef.current.speechSegments.length : 0;
        
        // Rough word estimation: average 2-3 words per second of speech
        speechDataRef.current.wordEstimate = Math.round(
          (speechDataRef.current.actualSpeechTime / 50) * 2.5 // 50 frames ≈ 1 second
        );
      }
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(analyzeUltraPrecise);
      }
    };
    
    analyzeUltraPrecise();
  };

  const detectSpeechUltraPrecise = (
    rmsEnergy: number,
    zeroCrossings: number,
    spectralCentroid: number,
    spectralRolloff: number,
    spectralFlux: number,
    backgroundNoise: number
  ): boolean => {
    const data = speechDataRef.current;
    
    // Multiple criteria for ultra-precise speech detection
    const energyThreshold = Math.max(data.energyThreshold, backgroundNoise * 2.5);
    const volumeThreshold = Math.max(data.volumeThreshold, backgroundNoise * 3);
    
    // Primary criteria: Energy and volume above thresholds
    const hasEnergy = rmsEnergy > energyThreshold;
    const hasVolume = rmsEnergy > volumeThreshold;
    
    // Secondary criteria: Speech-like characteristics
    const hasVoiceCharacteristics = 
      zeroCrossings > 0.01 && zeroCrossings < 0.3 && // Voice-like zero crossing rate
      spectralCentroid > 500 && spectralCentroid < 4000 && // Voice frequency range
      spectralRolloff > 1000; // Sufficient high-frequency content
    
    // Tertiary criteria: Signal quality
    const signalToNoise = backgroundNoise > 0 ? rmsEnergy / backgroundNoise : rmsEnergy * 1000;
    const hasGoodSignal = signalToNoise > 2; // At least 2x background noise
    
    // All criteria must be met for speech detection
    return hasEnergy && hasVolume && hasVoiceCharacteristics && hasGoodSignal;
  };

  const calculateRMSEnergy = (samples: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  };

  const calculateZeroCrossingRate = (samples: Float32Array): number => {
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / samples.length;
  };

  const calculateSpectralCentroid = (frequencyData: Uint8Array): number => {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      const frequency = (i * 22050) / frequencyData.length; // Nyquist frequency
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  };

  const calculateSpectralRolloff = (frequencyData: Uint8Array): number => {
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    const threshold = totalEnergy * 0.85; // 85% of total energy
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      cumulativeEnergy += frequencyData[i];
      if (cumulativeEnergy >= threshold) {
        return (i * 22050) / frequencyData.length;
      }
    }
    return 22050; // Nyquist frequency
  };

  const calculateSpectralFlux = (frequencyData: Uint8Array): number => {
    // Simplified spectral flux calculation
    let flux = 0;
    for (let i = 1; i < frequencyData.length; i++) {
      const diff = frequencyData[i] - frequencyData[i - 1];
      flux += diff > 0 ? diff : 0;
    }
    return flux / frequencyData.length;
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
      
      // Setup ultra-precise audio analysis
      setupUltraPreciseAudioAnalysis(stream);
      
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
        
        setHasRecorded(true);
        analyzePitchUltraPrecise(audioBlob);
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
      setDetectedLanguage('');

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

  const detectLanguageFromSpeech = (data: any): string => {
    // Simple language detection based on speech patterns
    const avgSpectralCentroid = data.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / data.spectralCentroid.length;
    const avgZeroCrossing = data.zeroCrossingRate.reduce((a: number, b: number) => a + b, 0) / data.zeroCrossingRate.length;
    
    // Very basic language detection heuristics
    if (avgSpectralCentroid > 2000 && avgZeroCrossing > 0.1) {
      return 'English (detected)';
    } else if (avgSpectralCentroid > 1800) {
      return 'European Language (detected)';
    } else if (avgSpectralCentroid > 1500) {
      return 'Asian Language (detected)';
    } else {
      return 'Language detected';
    }
  };

  const analyzePitchUltraPrecise = async (audioBlob: Blob) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate processing time for realistic feel
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const data = speechDataRef.current;
      const audioDuration = recordingTime;
      const expectedDuration = templates.find(t => t.id === selectedTemplate)?.duration || 30;
      const audioSize = audioBlob.size;
      
      // Detect language if auto-detect is selected
      if (selectedLanguage === 'auto' && data.actualSpeechTime > 0) {
        setDetectedLanguage(detectLanguageFromSpeech(data));
      }
      
      // ULTRA-PRECISE SCORING: Harsh but accurate
      const clarityScore = calculateUltraPreciseClarityScore(data, audioSize, audioDuration);
      const confidenceScore = calculateUltraPreciseConfidenceScore(data, audioDuration);
      const pacingScore = calculateUltraPrecisePacingScore(audioDuration, expectedDuration, data);
      const structureScore = calculateUltraPreciseStructureScore(data, audioDuration);
      
      // If complete silence detected, all scores are 0
      if (data.silenceDetected || data.actualSpeechTime === 0 || data.speechConfidence < 0.05) {
        const silenceFeedback = {
          overallScore: 0,
          clarity: 0,
          confidence: 0,
          pacing: 0,
          structure: 0,
          duration: audioDuration,
          expectedDuration: expectedDuration,
          audioSize: audioSize,
          speechData: data,
          detectedLanguage: detectedLanguage || 'No speech detected',
          suggestions: [
            'No speech was detected in your recording. Please ensure your microphone is working and speak clearly.',
            'Check your microphone permissions and try recording again.',
            'Make sure you are speaking loud enough to be detected by the system.',
            'If you were speaking, try moving closer to your microphone or speaking more clearly.'
          ],
          strengths: ['Recording session completed'],
          improvements: ['Speak audibly', 'Check microphone', 'Ensure clear speech', 'Verify audio input'],
          technicalDetails: {
            speechDetected: false,
            actualSpeechTime: 0,
            speechConfidence: 0,
            backgroundNoise: Math.round(data.backgroundNoise * 1000) / 1000,
            signalToNoiseRatio: 0,
            wordEstimate: 0
          }
        };
        
        setFeedback(silenceFeedback);
        setIsAnalyzing(false);
        return;
      }
      
      const overallScore = Math.round((clarityScore + confidenceScore + pacingScore + structureScore) / 4);
      
      const detailedFeedback = {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        clarity: Math.min(100, Math.max(0, clarityScore)),
        confidence: Math.min(100, Math.max(0, confidenceScore)),
        pacing: Math.min(100, Math.max(0, pacingScore)),
        structure: Math.min(100, Math.max(0, structureScore)),
        duration: audioDuration,
        expectedDuration: expectedDuration,
        audioSize: audioSize,
        speechData: data,
        detectedLanguage: detectedLanguage || 'Language detected',
        suggestions: generateUltraPreciseSuggestions(audioDuration, expectedDuration, data, audioSize),
        strengths: generateUltraPreciseStrengths(data, audioDuration, audioSize),
        improvements: generateUltraPreciseImprovements(data, audioDuration, expectedDuration),
        technicalDetails: {
          speechDetected: true,
          actualSpeechTime: Math.round((data.actualSpeechTime / 50) * 10) / 10, // Convert to seconds
          speechConfidence: Math.round(data.speechConfidence * 100),
          backgroundNoise: Math.round(data.backgroundNoise * 1000) / 1000,
          signalToNoiseRatio: Math.round(data.signalToNoiseRatio * 10) / 10,
          wordEstimate: data.wordEstimate,
          speechSegments: data.speechSegments.length
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

  const calculateUltraPreciseClarityScore = (data: any, audioSize: number, duration: number) => {
    // Start with 0 and build up based on actual speech quality
    let score = 0;
    
    // Must have actual speech to get any clarity score
    if (data.actualSpeechTime === 0 || data.speechConfidence < 0.1) {
      return 0;
    }
    
    // Base score for having detectable speech
    score = 15;
    
    // Speech confidence (how much of the recording was actual speech)
    const speechRatio = data.speechConfidence;
    if (speechRatio > 0.7) score += 25; // Excellent speech ratio
    else if (speechRatio > 0.5) score += 20; // Good speech ratio
    else if (speechRatio > 0.3) score += 15; // Fair speech ratio
    else if (speechRatio > 0.1) score += 10; // Poor speech ratio
    else score += 5; // Very poor speech ratio
    
    // Signal to noise ratio (clarity of speech vs background)
    if (data.signalToNoiseRatio > 10) score += 20; // Very clear
    else if (data.signalToNoiseRatio > 5) score += 15; // Clear
    else if (data.signalToNoiseRatio > 3) score += 10; // Acceptable
    else if (data.signalToNoiseRatio > 1.5) score += 5; // Poor
    else score -= 5; // Very poor
    
    // Audio quality based on file size and speech time
    const actualSpeechDuration = data.actualSpeechTime / 50; // Convert to seconds
    if (actualSpeechDuration > 0) {
      const qualityRatio = audioSize / actualSpeechDuration;
      if (qualityRatio > 15000) score += 15; // Excellent quality
      else if (qualityRatio > 10000) score += 12; // Good quality
      else if (qualityRatio > 6000) score += 8; // Fair quality
      else if (qualityRatio > 3000) score += 5; // Poor quality
      else score += 2; // Very poor quality
    }
    
    // Speech segments (continuous speech indicates clarity)
    const avgSegmentLength = data.speechSegments.length > 0 ?
      data.speechSegments.reduce((sum: number, seg: any) => sum + (seg.end - seg.start), 0) / data.speechSegments.length : 0;
    
    if (avgSegmentLength > 100) score += 15; // Long continuous speech
    else if (avgSegmentLength > 50) score += 10; // Moderate continuous speech
    else if (avgSegmentLength > 25) score += 5; // Short speech segments
    else score += 2; // Very fragmented speech
    
    // Spectral characteristics (voice-like frequencies)
    const avgSpectralCentroid = data.spectralCentroid.length > 0 ?
      data.spectralCentroid.reduce((a: number, b: number) => a + b, 0) / data.spectralCentroid.length : 0;
    
    if (avgSpectralCentroid > 1000 && avgSpectralCentroid < 3000) score += 10; // Voice-like frequencies
    else if (avgSpectralCentroid > 500 && avgSpectralCentroid < 4000) score += 5; // Acceptable frequencies
    
    return Math.round(score);
  };

  const calculateUltraPreciseConfidenceScore = (data: any, duration: number) => {
    // Start with 0 and build up based on confident speech patterns
    let score = 0;
    
    // Must have actual speech to get any confidence score
    if (data.actualSpeechTime === 0 || data.speechConfidence < 0.1) {
      return 0;
    }
    
    // Base score for having detectable speech
    score = 10;
    
    // Speech confidence and consistency
    if (data.speechConfidence > 0.8) score += 30; // Very confident delivery
    else if (data.speechConfidence > 0.6) score += 25; // Confident delivery
    else if (data.speechConfidence > 0.4) score += 20; // Moderately confident
    else if (data.speechConfidence > 0.2) score += 15; // Somewhat confident
    else score += 10; // Lacks confidence
    
    // Signal strength (confident speakers project their voice)
    if (data.signalToNoiseRatio > 8) score += 20; // Strong, confident voice
    else if (data.signalToNoiseRatio > 5) score += 15; // Good voice strength
    else if (data.signalToNoiseRatio > 3) score += 10; // Moderate voice strength
    else if (data.signalToNoiseRatio > 1.5) score += 5; // Weak voice
    else score += 2; // Very weak voice
    
    // Speech continuity (confident speakers speak in longer segments)
    const avgSegmentLength = data.speechSegments.length > 0 ?
      data.speechSegments.reduce((sum: number, seg: any) => sum + (seg.end - seg.start), 0) / data.speechSegments.length : 0;
    
    if (avgSegmentLength > 150) score += 20; // Very confident, long segments
    else if (avgSegmentLength > 100) score += 15; // Confident segments
    else if (avgSegmentLength > 50) score += 10; // Moderate segments
    else if (avgSegmentLength > 25) score += 5; // Short segments
    else score += 2; // Very fragmented, hesitant
    
    // Word estimation (confident speakers say more)
    const wordsPerSecond = data.wordEstimate / duration;
    if (wordsPerSecond > 2) score += 15; // Good speaking rate
    else if (wordsPerSecond > 1.5) score += 12; // Decent speaking rate
    else if (wordsPerSecond > 1) score += 8; // Slow but acceptable
    else if (wordsPerSecond > 0.5) score += 5; // Very slow
    else score += 2; // Extremely slow or hesitant
    
    // Duration factor (confident speakers are willing to speak)
    if (duration > 20) score += 5; // Willing to speak at length
    else if (duration < 5) score -= 5; // Very brief, possibly nervous
    
    return Math.round(score);
  };

  const calculateUltraPrecisePacingScore = (duration: number, expectedDuration: number, data: any) => {
    // Start with 0 and build up based on good pacing
    let score = 0;
    
    // Must have actual speech to get any pacing score
    if (data.actualSpeechTime === 0 || data.speechConfidence < 0.1) {
      return 0;
    }
    
    // Base score for having detectable speech
    score = 10;
    
    // Duration matching (critical for pacing)
    if (expectedDuration > 0) {
      const durationDiff = Math.abs(duration - expectedDuration);
      const durationRatio = durationDiff / expectedDuration;
      
      if (durationRatio < 0.1) score += 35; // Perfect timing
      else if (durationRatio < 0.2) score += 30; // Excellent timing
      else if (durationRatio < 0.3) score += 25; // Good timing
      else if (durationRatio < 0.5) score += 15; // Acceptable timing
      else if (durationRatio < 0.7) score += 10; // Poor timing
      else score += 5; // Very poor timing
    } else {
      score += 20; // No specific duration requirement
    }
    
    // Speech to total time ratio (indicates pacing efficiency)
    const actualSpeechDuration = data.actualSpeechTime / 50; // Convert to seconds
    const speechTimeRatio = actualSpeechDuration / duration;
    
    if (speechTimeRatio > 0.7 && speechTimeRatio < 0.9) score += 25; // Excellent pacing
    else if (speechTimeRatio > 0.6 && speechTimeRatio < 0.95) score += 20; // Good pacing
    else if (speechTimeRatio > 0.5) score += 15; // Acceptable pacing
    else if (speechTimeRatio > 0.3) score += 10; // Slow pacing
    else if (speechTimeRatio > 0.1) score += 5; // Very slow pacing
    else score += 2; // Extremely slow
    
    // Speech segment analysis (natural pacing has varied segments)
    if (data.speechSegments.length > 0) {
      const segmentsPerMinute = (data.speechSegments.length / duration) * 60;
      if (segmentsPerMinute > 3 && segmentsPerMinute < 12) score += 15; // Natural pacing
      else if (segmentsPerMinute > 1 && segmentsPerMinute < 20) score += 10; // Acceptable pacing
      else if (segmentsPerMinute > 0.5) score += 5; // Poor pacing
      else score += 2; // Very poor pacing
    }
    
    // Word rate (natural speaking pace)
    const wordsPerMinute = (data.wordEstimate / duration) * 60;
    if (wordsPerMinute > 120 && wordsPerMinute < 180) score += 15; // Perfect pace
    else if (wordsPerMinute > 100 && wordsPerMinute < 200) score += 12; // Good pace
    else if (wordsPerMinute > 80 && wordsPerMinute < 220) score += 8; // Acceptable pace
    else if (wordsPerMinute > 60) score += 5; // Slow pace
    else score += 2; // Very slow pace
    
    return Math.round(score);
  };

  const calculateUltraPreciseStructureScore = (data: any, duration: number) => {
    // Start with 0 and build up based on structured delivery
    let score = 0;
    
    // Must have actual speech to get any structure score
    if (data.actualSpeechTime === 0 || data.speechConfidence < 0.1) {
      return 0;
    }
    
    // Base score for having detectable speech
    score = 15;
    
    // Speech segments indicate organized thoughts
    if (data.speechSegments.length > 0) {
      const segmentsPerMinute = (data.speechSegments.length / duration) * 60;
      if (segmentsPerMinute > 4 && segmentsPerMinute < 10) score += 25; // Well organized
      else if (segmentsPerMinute > 2 && segmentsPerMinute < 15) score += 20; // Good organization
      else if (segmentsPerMinute > 1) score += 15; // Some organization
      else score += 10; // Poor organization
    }
    
    // Consistency in speech delivery suggests preparation
    const speechVariability = data.speechSegments.length > 0 ?
      data.speechSegments.reduce((variance: number, seg: any, index: number, array: any[]) => {
        if (index === 0) return 0;
        const prevLength = array[index - 1].end - array[index - 1].start;
        const currLength = seg.end - seg.start;
        return variance + Math.abs(currLength - prevLength);
      }, 0) / data.speechSegments.length : 0;
    
    if (speechVariability < 20) score += 20; // Very consistent structure
    else if (speechVariability < 40) score += 15; // Good consistency
    else if (speechVariability < 60) score += 10; // Some consistency
    else score += 5; // Poor consistency
    
    // Duration factor (longer speeches need better structure)
    if (duration > 60) {
      if (data.speechSegments.length > 6) score += 15; // Good structure for long speech
      else if (data.speechSegments.length > 3) score += 10; // Acceptable structure
      else score += 5; // Poor structure for long speech
    } else if (duration > 30) {
      if (data.speechSegments.length > 3) score += 10; // Good structure for medium speech
      else if (data.speechSegments.length > 1) score += 8; // Acceptable structure
      else score += 5; // Poor structure
    } else {
      if (data.speechSegments.length > 1) score += 10; // Good for short speech
      else score += 8; // Single segment is okay for short speech
    }
    
    // Word distribution (structured speeches have varied emphasis)
    if (data.wordEstimate > 0) {
      const wordsPerSegment = data.speechSegments.length > 0 ? data.wordEstimate / data.speechSegments.length : 0;
      if (wordsPerSegment > 5 && wordsPerSegment < 20) score += 10; // Good word distribution
      else if (wordsPerSegment > 2) score += 5; // Acceptable distribution
      else score += 2; // Poor distribution
    }
    
    return Math.round(score);
  };

  const generateUltraPreciseSuggestions = (duration: number, expected: number, data: any, size: number) => {
    const suggestions = [];
    
    // Speech detection feedback
    if (data.speechConfidence < 0.3) {
      suggestions.push(`Only ${Math.round(data.speechConfidence * 100)}% of your recording contained detectable speech. Speak more clearly and consistently throughout your pitch.`);
    }
    
    // Signal quality feedback
    if (data.signalToNoiseRatio < 3) {
      suggestions.push(`Your voice signal was weak (${Math.round(data.signalToNoiseRatio * 10) / 10}x background noise). Speak louder and closer to your microphone for better clarity.`);
    }
    
    // Duration feedback
    if (expected > 0) {
      const actualSpeechTime = data.actualSpeechTime / 50;
      if (actualSpeechTime < expected * 0.5) {
        suggestions.push(`You only spoke for ${Math.round(actualSpeechTime)}s out of ${duration}s recorded (target: ${expected}s). Fill the time with more content about your value proposition.`);
      } else if (duration > expected * 1.5) {
        suggestions.push(`Your ${duration}s recording exceeded the ${expected}s target. Practice condensing your key points for better impact.`);
      }
    }
    
    // Word rate feedback
    const wordsPerMinute = (data.wordEstimate / duration) * 60;
    if (wordsPerMinute < 100) {
      suggestions.push(`Your estimated speaking rate was ${Math.round(wordsPerMinute)} words/minute. Aim for 120-150 words/minute for optimal engagement.`);
    } else if (wordsPerMinute > 200) {
      suggestions.push(`You spoke very quickly (${Math.round(wordsPerMinute)} words/minute). Slow down to ensure your audience can follow your key points.`);
    }
    
    // Structure feedback
    if (data.speechSegments.length < 3 && duration > 30) {
      suggestions.push(`Your speech had only ${data.speechSegments.length} main segments. Structure longer pitches with clear sections: problem, solution, market, traction, ask.`);
    }
    
    return suggestions.slice(0, 4);
  };

  const generateUltraPreciseStrengths = (data: any, duration: number, size: number) => {
    const strengths = [];
    
    if (data.speechConfidence > 0.7) {
      strengths.push(`Strong speech presence (${Math.round(data.speechConfidence * 100)}% speech ratio)`);
    }
    
    if (data.signalToNoiseRatio > 5) {
      strengths.push(`Clear voice projection (${Math.round(data.signalToNoiseRatio * 10) / 10}x signal strength)`);
    }
    
    const wordsPerMinute = (data.wordEstimate / duration) * 60;
    if (wordsPerMinute > 120 && wordsPerMinute < 180) {
      strengths.push(`Optimal speaking pace (${Math.round(wordsPerMinute)} words/minute)`);
    }
    
    if (data.speechSegments.length > 3) {
      strengths.push(`Well-structured delivery (${data.speechSegments.length} speech segments)`);
    }
    
    if (data.wordEstimate > 50) {
      strengths.push(`Comprehensive content (estimated ${data.wordEstimate} words)`);
    }
    
    if (strengths.length === 0) {
      strengths.push("Recording session completed successfully");
    }
    
    return strengths.slice(0, 4);
  };

  const generateUltraPreciseImprovements = (data: any, duration: number, expected: number) => {
    const improvements = [];
    
    if (data.speechConfidence < 0.6) {
      improvements.push("Increase speech consistency");
    }
    
    if (data.signalToNoiseRatio < 4) {
      improvements.push("Improve voice projection");
    }
    
    const wordsPerMinute = (data.wordEstimate / duration) * 60;
    if (wordsPerMinute < 120) {
      improvements.push("Increase speaking pace");
    } else if (wordsPerMinute > 180) {
      improvements.push("Slow down delivery");
    }
    
    if (expected > 0 && Math.abs(duration - expected) > expected * 0.2) {
      improvements.push("Better timing control");
    }
    
    if (data.speechSegments.length < 3 && duration > 30) {
      improvements.push("Add more structure");
    }
    
    if (data.wordEstimate < 30) {
      improvements.push("Expand content depth");
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
    setDetectedLanguage('');
    
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
    
    // Reset ultra-precise speech data
    speechDataRef.current = {
      volumeSamples: [],
      rawAudioSamples: [],
      silenceDetected: true,
      totalSilenceTime: 0,
      actualSpeechTime: 0,
      speechSegments: [],
      volumeThreshold: 0.01,
      energyThreshold: 0.001,
      speechConfidence: 0,
      wordEstimate: 0,
      pauseAnalysis: [],
      voiceActivity: [],
      spectralCentroid: [],
      zeroCrossingRate: [],
      mfccFeatures: [],
      speechQuality: 0,
      backgroundNoise: 0,
      signalToNoiseRatio: 0
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
            Ultra-precise AI analysis that detects actual speech patterns and provides accurate scoring
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Supports 10+ languages with automatic detection • Advanced speech recognition technology
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Language Detection</h3>
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
            {detectedLanguage && (
              <p className="text-sm text-electric-green mt-2">
                🎯 {detectedLanguage}
              </p>
            )}
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
                {isRecording ? 'Recording... Speak clearly and confidently!' : 
                 isAnalyzing ? 'Analyzing speech patterns with ultra-precise algorithms...' :
                 hasRecorded ? 'Recording complete! Check your detailed analysis below.' : 'Ready to record your pitch'}
              </div>

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-electric-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-electric-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}

              {/* Ultra-precise real-time volume indicator */}
              {isRecording && (
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Voice Detection: {realTimeVolume > 5 ? '🎤 Speaking' : '🔇 Silent'} 
                    {realTimeVolume > 0 && ` (${Math.round(realTimeVolume)}%)`}
                  </div>
                  <div className="w-64 h-4 bg-gray-700 rounded-full mx-auto border border-white/20">
                    <div 
                      className={`h-4 rounded-full transition-all duration-100 ${
                        realTimeVolume > 15 ? 'bg-gradient-to-r from-electric-green to-electric-blue' :
                        realTimeVolume > 5 ? 'bg-gradient-to-r from-yellow-500 to-electric-blue' :
                        realTimeVolume > 1 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                        'bg-gradient-to-r from-red-500 to-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, realTimeVolume * 2)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {realTimeVolume < 2 ? '⚠️ No speech detected - speak louder' : 
                     realTimeVolume < 8 ? '📢 Speak louder for better detection' : 
                     realTimeVolume > 30 ? '✅ Perfect volume!' : '✅ Good speech detected'}
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

        {/* Ultra-Precise Feedback Section */}
        {feedback && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">
                Your Pitch Score:{' '}
                <span className={`bg-gradient-to-r ${
                  feedback.overallScore >= 80 ? 'from-electric-green to-electric-blue' :
                  feedback.overallScore >= 60 ? 'from-electric-blue to-electric-purple' :
                  feedback.overallScore >= 40 ? 'from-electric-purple to-electric-pink' :
                  feedback.overallScore >= 20 ? 'from-electric-pink to-red-500' :
                  'from-red-500 to-gray-500'
                } bg-clip-text text-transparent`}>
                  {feedback.overallScore}%
                </span>
              </h2>
              <p className="text-gray-300">
                Recording: {formatTime(feedback.duration)} 
                {feedback.expectedDuration > 0 && ` (Target: ${formatTime(feedback.expectedDuration)})`}
              </p>
              {feedback.detectedLanguage && (
                <p className="text-electric-blue text-sm mt-1">
                  🌐 {feedback.detectedLanguage}
                </p>
              )}
              {feedback.technicalDetails && (
                <div className="text-sm text-gray-400 mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <span>Speech: {feedback.technicalDetails.speechDetected ? '✅' : '❌'}</span>
                  <span>Confidence: {feedback.technicalDetails.speechConfidence}%</span>
                  <span>Words: ~{feedback.technicalDetails.wordEstimate}</span>
                  <span>Segments: {feedback.technicalDetails.speechSegments}</span>
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

            {/* Ultra-Precise Analysis & Recommendations */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Ultra-Precise AI Analysis & Recommendations</h3>
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
              
              {feedback.technicalDetails && feedback.technicalDetails.speechDetected && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Technical Analysis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-500">
                    <span>Speech Time: {feedback.technicalDetails.actualSpeechTime}s</span>
                    <span>Background Noise: {feedback.technicalDetails.backgroundNoise}</span>
                    <span>Signal Ratio: {feedback.technicalDetails.signalToNoiseRatio}x</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchPractice;