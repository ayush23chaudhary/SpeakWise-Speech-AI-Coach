import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause } from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { analyzeAudio } from '../../api';
import useAuthStore from '../../store/authStore';

const PerformanceStudio = ({ onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  // Initialize audio context for volume detection
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
 // ------------------jskbd----
  const startRecording = async () => {
    try {
      // Reset everything first
      setRecordingDuration(0);
      startTimeRef.current = null;
      setVolume(0);
      
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
      
      // Start volume monitoring
      startVolumeMonitoring(stream);
      startDurationTimer();
      
      console.log('Recording started:', { startTime: startTimeRef.current });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      startTimeRef.current = null; // Reset the start time
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const startVolumeMonitoring = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateVolume = () => {
      if (isRecording) {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setVolume(average);
        animationRef.current = requestAnimationFrame(updateVolume);
      }
    };
    
    updateVolume();
  };

  const startDurationTimer = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  };

  // Use useEffect for the timer
  useEffect(() => {
    let intervalId;
    
    if (isRecording && startTimeRef.current) {
      intervalId = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording]);

  const playRecording = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return;
    
    setIsAnalyzing(true);
    
    try {
      // Prefer analyzeAudio helper which handles auth and the full URL
      const analysis = await analyzeAudio(audioBlob, token);

      // If the component was given an onAnalysisComplete callback, call it
      if (typeof onAnalysisComplete === 'function') {
        onAnalysisComplete(analysis);
      } else {
        // otherwise navigate to analysis route (if available)
        navigate('/dashboard/analysis', { state: { analysisData: analysis } });
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setVolume(0);
    setRecordingDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Performance Studio
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Record your speech and get AI-powered analysis
          </p>
        </div>

        {/* Main Recording Area */}
        <div 
          className={`card flex flex-col items-center justify-center text-center relative transition-all duration-300 ${
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
                  <Mic className={`w-16 h-16 ${isRecording ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="space-y-6">
            {!audioBlob ? (
              <div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`btn-primary text-lg px-8 py-4 rounded-full flex items-center mx-auto ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : ''
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-6 h-6 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6 mr-2" />
                      Start Recording
                    </>
                  )}
                </button>
                
                {isRecording && (
                  <div className="mt-4 text-center space-y-2">
                    <p className="text-lg font-mono text-gray-600 dark:text-gray-400">
                      {formatTime(recordingDuration)}
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                        Recording in progress...
                      </p>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={playRecording}
                    className="btn-secondary flex items-center"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Play
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetRecording}
                    className="btn-secondary"
                  >
                    Record Again
                  </button>
                </div>
                
                <button
                  onClick={analyzeRecording}
                  disabled={isAnalyzing}
                  className="btn-primary text-lg px-8 py-4 rounded-full flex items-center justify-center mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Stop & Analyze'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recording Tips
          </h3>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Find a quiet environment with minimal background noise</li>
            <li>• Speak clearly and at a comfortable pace</li>
            <li>• Maintain a consistent distance from your microphone</li>
            <li>• Practice speaking for 30-60 seconds for best results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStudio;
