import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, LogIn, UserPlus, Zap } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import { RECORDING_TIPS } from '../../utils/constants';
import { analyzeAudio } from '../../api';

const GuestPerformanceStudio = ({ onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pitch, setPitch] = useState(0); // Fundamental frequency in Hz
  const [frequencyData, setFrequencyData] = useState(new Array(32).fill(0)); // For pitch visualization
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const pitchAnimationRef = useRef(null);
  const startTimeRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const pitchHistoryRef = useRef([]); // For smoothing pitch values

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pitchAnimationRef.current) {
        cancelAnimationFrame(pitchAnimationRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset everything first
      setDuration(0);
      startTimeRef.current = null;
      setVolume(0);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Start volume and pitch monitoring
      startVolumeAndPitchMonitoring(stream);
      
      console.log('Recording started:', { startTime: startTimeRef.current });
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      startTimeRef.current = null;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pitchAnimationRef.current) {
        cancelAnimationFrame(pitchAnimationRef.current);
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const startVolumeAndPitchMonitoring = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    analyser.fftSize = 4096; // Higher FFT size for better frequency resolution
    analyser.smoothingTimeConstant = 0.85; // Increased smoothing
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyArray = new Float32Array(bufferLength);
    
    let frameCount = 0; // For throttling updates
    
    // Helper function to smooth pitch values
    const smoothPitch = (newPitch) => {
      if (newPitch === 0) return 0;
      
      pitchHistoryRef.current.push(newPitch);
      if (pitchHistoryRef.current.length > 12) {
        pitchHistoryRef.current.shift();
      }
      
      // Calculate weighted average (more weight to recent values)
      let sum = 0;
      let weightSum = 0;
      for (let i = 0; i < pitchHistoryRef.current.length; i++) {
        const weight = i + 1; // Linear weighting
        sum += pitchHistoryRef.current[i] * weight;
        weightSum += weight;
      }
      
      return Math.round(sum / weightSum);
    };
    
    // For pitch detection
    const detectPitch = (frequencies) => {
      // Find the fundamental frequency (pitch)
      let maxValue = -Infinity;
      let maxIndex = 0;
      
      // Look for peaks in the frequency data (human voice range: 85-500 Hz)
      const minFreqIndex = Math.floor(85 * bufferLength / (audioContext.sampleRate / 2));
      const maxFreqIndex = Math.floor(500 * bufferLength / (audioContext.sampleRate / 2));
      
      for (let i = minFreqIndex; i < maxFreqIndex; i++) {
        if (frequencies[i] > maxValue) {
          maxValue = frequencies[i];
          maxIndex = i;
        }
      }
      
      // Convert index to frequency
      const nyquist = audioContext.sampleRate / 2;
      const frequency = (maxIndex * nyquist) / bufferLength;
      
      // Float32 array returns dB values (typically -100 to 0)
      // Only return frequency if signal is strong enough (above -70 dB for clearer detection)
      return maxValue > -70 ? frequency : 0;
    };
    
    const updateVolumeAndPitch = () => {
      frameCount++;
      
      // Update volume every frame
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setVolume(average);
      
      // Update frequency visualization every 2 frames (reduce lag)
      if (frameCount % 2 === 0) {
        const barCount = 32;
        const step = Math.floor(bufferLength / barCount);
        const visualData = [];
        for (let i = 0; i < barCount; i++) {
          const start = i * step;
          const end = start + step;
          const slice = dataArray.slice(start, end);
          const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
          visualData.push(avg);
        }
        setFrequencyData(visualData);
      }
      
      // Update pitch every 8 frames (reduce sensitivity even more)
      if (frameCount % 8 === 0) {
        analyser.getFloatFrequencyData(frequencyArray);
        const detectedPitch = detectPitch(frequencyArray);
        const smoothedPitch = smoothPitch(detectedPitch);
        setPitch(smoothedPitch);
      }
      
      pitchAnimationRef.current = requestAnimationFrame(updateVolumeAndPitch);
    };
    
    updateVolumeAndPitch();
  };

  // Duration timer effect
  useEffect(() => {
    let intervalId;
    
    if (isRecording && startTimeRef.current) {
      intervalId = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return;
    
    // Check minimum duration (at least 3 seconds)
    if (duration < 3) {
      alert('Recording is too short. Please record at least 3 seconds of speech.');
      return;
    }
    
    // Check audio blob size
    if (audioBlob.size < 5000) {
      alert('Audio file is too small. Please speak clearly for at least 3 seconds.');
      return;
    }
    
    console.log('📊 Starting analysis:', {
      duration: duration + 's',
      blobSize: audioBlob.size + ' bytes',
      type: audioBlob.type
    });
    
    setIsAnalyzing(true);
    
    try {
      // Guest mode now uses real AI analysis (same as authenticated users)
      // The /api/speech/analyze endpoint doesn't require authentication
      const analysis = await analyzeAudio(audioBlob, null); // No token needed for guests
      
      // Pass the real analysis data to the callback
      onAnalysisComplete(analysis);
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Analysis failed';
      alert(`Analysis failed: ${errorMsg}. Please try recording again with clear speech.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setVolume(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speakwise-guest-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeColor = () => {
    if (volume < 20) return 'bg-gray-300 dark:bg-gray-600';
    if (volume < 40) return 'bg-yellow-400';
    if (volume < 60) return 'bg-orange-400';
    if (volume < 80) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getVolumeIntensity = () => {
    return Math.min(volume / 50, 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Record your speech and get AI-powered analysis
          </p>
          
          {/* Guest Mode Notice */}
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-purple-100 dark:from-yellow-900/20 dark:to-purple-900/20 border border-yellow-300 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100 rounded-lg text-sm font-medium shadow-sm">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="font-semibold">Demo Mode:</span>
            <span className="ml-1">Full AI analysis • Results not saved • No signup required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recording Area */}
          <div className="lg:col-span-2">
            <Card 
              className={`flex flex-col items-center justify-center text-center relative transition-all duration-300 ${
                isRecording ? 'ring-4 ring-primary-400 shadow-2xl' : ''
              }`}
              style={{
                boxShadow: isRecording 
                  ? `0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.3), inset 0 0 40px rgba(59, 130, 246, 0.1)` 
                  : undefined
              }}
            >
              {/* Animated border glow effect */}
              {isRecording && (
                <div 
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.8))',
                    backgroundSize: '200% 200%',
                    animation: 'gradient-flow 3s linear infinite',
                    filter: 'blur(8px)',
                    opacity: 0.5,
                    zIndex: -1
                  }}
                />
              )}
              
              {/* Vocal Orb Visualizer */}
              <div className="mb-8">
                <div className="relative w-64 h-64">
                  {/* Rotating gradient ring */}
                  {isRecording && (
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 opacity-60"
                      style={{
                        animation: 'rotate-gradient 3s linear infinite',
                        filter: 'blur(8px)'
                      }}
                    />
                  )}
                  
                  <div 
                    className={`absolute inset-0 rounded-full transition-all duration-150 ${
                      isRecording 
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 shadow-2xl' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    style={{
                      transform: `scale(${1 + (volume / 100) * 0.3})`,
                      boxShadow: isRecording 
                        ? `0 0 ${20 + volume * 2}px rgba(59, 130, 246, ${0.3 + volume / 200})` 
                        : 'none'
                    }}
                  >
                    <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                      <Mic className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pitch and Frequency Visualizer */}
              {isRecording && (
                <div className="w-full max-w-2xl mb-6 space-y-3">
                  {/* Pitch Display */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Voice Pitch
                      </span>
                      <span className="text-xl font-semibold text-gray-900 dark:text-white tabular-nums">
                        {pitch > 0 ? `${Math.round(pitch)} Hz` : '-- Hz'}
                      </span>
                    </div>
                    
                    {/* Pitch range indicator */}
                    <div className="relative h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-primary-500 dark:bg-primary-400 transition-all duration-500 ease-out rounded-full"
                        style={{ 
                          width: `${Math.min((pitch / 500) * 100, 100)}%`
                        }}
                      />
                    </div>
                    
                    {/* Pitch labels */}
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      <span>Low</span>
                      <span>Mid</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Frequency Spectrum Bars */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Audio Levels
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Frequency spectrum
                      </span>
                    </div>
                    
                    {/* Spectrum bars */}
                    <div className="flex items-end justify-between h-20 gap-0.5">
                      {frequencyData.map((value, index) => {
                        const height = Math.max((value / 255) * 100, 2);
                        const opacity = 0.4 + (value / 255) * 0.6;
                        
                        return (
                          <div
                            key={index}
                            className="flex-1 rounded-t transition-all duration-150 ease-out"
                            style={{
                              height: `${height}%`,
                              backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                              minWidth: '3px'
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Frequency labels */}
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
                      <span>Low</span>
                      <span>Mid</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recording Status */}
              <div className="mb-6">
                {isRecording && (
                  <div className="space-y-2">
                    <div className="text-2xl font-mono text-primary-600 dark:text-primary-400">
                      {formatTime(duration)}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Recording in progress...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Recording Controls */}
              <div className="space-y-4">
                {!audioBlob ? (
                  <div className="space-y-3">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? 'danger' : 'primary'}
                      size="lg"
                      icon={isRecording ? Square : Mic}
                      className="px-8 py-4 text-lg"
                    >
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-3">
                      <Button
                        onClick={handlePlayPause}
                        variant="secondary"
                        icon={isPlaying ? Pause : Play}
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      
                      <Button
                        onClick={resetRecording}
                        variant="outline"
                      >
                        Record Again
                      </Button>
                      
                      <Button
                        onClick={downloadRecording}
                        variant="outline"
                      >
                        Download
                      </Button>
                    </div>
                    
                    <Button
                      onClick={analyzeRecording}
                      disabled={isAnalyzing}
                      variant="primary"
                      size="lg"
                      className="px-8 py-4 text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        'Stop & Analyze'
                      )}
                    </Button>
                    
                    {/* Analysis waiting message */}
                    {isAnalyzing && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please wait patiently... Server may be busy with multiple users.
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Analysis typically takes 5-15 seconds
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Audio Element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  onPlay={handleAudioPlay}
                  onPause={handleAudioPause}
                />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recording Tips */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recording Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {RECORDING_TIPS.slice(0, 5).map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Guest Benefits */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unlock Full Features
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create an account to save your analysis results and track your progress over time.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.href = '/register'}
                  variant="primary"
                  size="sm"
                  icon={UserPlus}
                  className="w-full"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  size="sm"
                  icon={LogIn}
                  className="w-full"
                >
                  Sign In
                </Button>
              </div>
            </Card>

            {/* Recording Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Session Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatTime(duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume Level:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {volume}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    isRecording ? 'text-green-600 dark:text-green-400' : 
                    audioBlob ? 'text-blue-600 dark:text-blue-400' : 
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {isRecording ? 'Recording' : audioBlob ? 'Ready' : 'Idle'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPerformanceStudio;
