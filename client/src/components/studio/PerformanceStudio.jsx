import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Target, TrendingUp } from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { analyzeAudio } from '../../api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import EvaluationModeSelector from './EvaluationModeSelector';

const PerformanceStudio = ({ onAnalysisComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pitch, setPitch] = useState(0); // Fundamental frequency in Hz
  const [frequencyData, setFrequencyData] = useState(new Array(32).fill(0)); // For pitch visualization
  const [activeGoals, setActiveGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [evaluationMode, setEvaluationMode] = useState('interview'); // Default mode
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const pitchAnimationRef = useRef(null);
  const startTimeRef = useRef(null);
  const pitchHistoryRef = useRef([]); // For smoothing pitch values
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  // Fetch active goals
  useEffect(() => {
    fetchActiveGoals();
  }, []);

  const fetchActiveGoals = async () => {
    try {
      setLoadingGoals(true);
      const response = await api.get('/goals');
      // The API returns { goals: [...] } not just [...]
      const allGoals = response.data.goals || response.data;
      const goals = allGoals.filter(goal => goal.status === 'active');
      setActiveGoals(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Initialize audio context for volume and pitch detection
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pitchAnimationRef.current) {
        cancelAnimationFrame(pitchAnimationRef.current);
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
      
      // Start volume and pitch monitoring
      startVolumeAndPitchMonitoring(stream);
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
      if (pitchAnimationRef.current) {
        cancelAnimationFrame(pitchAnimationRef.current);
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
    
    // Check minimum duration (at least 3 seconds)
    if (recordingDuration < 3) {
      alert('Recording is too short. Please record at least 3 seconds of speech.');
      return;
    }
    
    // Check audio blob size
    if (audioBlob.size < 5000) {
      alert('Audio file is too small. Please speak clearly for at least 3 seconds.');
      return;
    }
    
    console.log('📊 Starting analysis:', {
      duration: recordingDuration + 's',
      blobSize: audioBlob.size + ' bytes',
      type: audioBlob.type
    });
    
    setIsAnalyzing(true);
    
    try {
      // Prefer analyzeAudio helper which handles auth and the full URL
      const analysis = await analyzeAudio(audioBlob, token, evaluationMode);

      // Check if any new badges were unlocked
      if (analysis.newBadges && analysis.newBadges.length > 0) {
        analysis.newBadges.forEach((badge, index) => {
          setTimeout(() => {
            toast.success(
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <div className="font-bold">🎉 Achievement Unlocked!</div>
                  <div className="text-sm">{badge.name}</div>
                  <div className="text-xs opacity-75">{badge.description}</div>
                </div>
              </div>,
              {
                duration: 5000,
                position: 'top-center',
                style: {
                  background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  minWidth: '350px',
                },
                icon: '🏆',
              }
            );
          }, index * 1000); // Stagger notifications by 1 second
        });
      }

      // Check if any goals were completed
      if (analysis.completedGoals && analysis.completedGoals.length > 0) {
        const badgeDelay = (analysis.newBadges?.length || 0) * 1000;
        analysis.completedGoals.forEach((goal, index) => {
          setTimeout(() => {
            toast.success(
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <div className="font-bold">🎊 Goal Completed!</div>
                  <div className="text-sm">{goal.title}</div>
                  <div className="text-xs opacity-75">
                    Target: {goal.targetValue} | Achieved: {goal.currentValue}
                  </div>
                </div>
              </div>,
              {
                duration: 6000,
                position: 'top-center',
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  minWidth: '350px',
                },
                icon: '🎯',
              }
            );
          }, badgeDelay + (index * 1000)); // Show after badges, staggered
        });
      }

      // If the component was given an onAnalysisComplete callback, call it
      if (typeof onAnalysisComplete === 'function') {
        onAnalysisComplete(analysis);
      } else {
        // otherwise navigate to analysis route (if available)
        navigate('/dashboard/analysis', { state: { analysisData: analysis } });
      }

      // Check if this was a journey task and complete it
      const journeyTask = sessionStorage.getItem('journeyTask');
      if (journeyTask) {
        try {
          const task = JSON.parse(journeyTask);
          const overallScore = analysis.overallScore || 0;
          
          // Call the complete task API
          const response = await api.post('/journey/complete-task', {
            taskId: task.id,
            taskTitle: task.title,
            taskType: task.type,
            score: overallScore,
            reportId: analysis._id || null
          });

          if (response.data.shouldLevelUp) {
            toast.success(response.data.message, {
              duration: 5000,
              icon: '🎉',
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold'
              }
            });
          } else if (!response.data.alreadyCompleted) {
            toast.success('✅ Journey task completed!', {
              duration: 3000
            });
          }

          // Clear the journey task from session storage
          sessionStorage.removeItem('journeyTask');
        } catch (error) {
          console.error('Error completing journey task:', error);
          // Don't show error to user, just log it
        }
      }
      
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

  // Calculate goal progress percentage
  const calculateGoalProgress = (goal) => {
    if (!goal.currentValue || !goal.targetValue) return 0;
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  // Get goal type display name
  const getGoalTypeLabel = (type) => {
    const labels = {
      sessions: 'Sessions',
      score: 'Score',
      streak: 'Day Streak',
      skill_improvement: 'Skill',
      time_practiced: 'Practice Time',
      custom: 'Custom Goal'
    };
    return labels[type] || type;
  };

  // Get goal display value
  const getGoalDisplayValue = (goal) => {
    if (goal.type === 'time_practiced') {
      return `${goal.currentValue}/${goal.targetValue} min`;
    }
    return `${goal.currentValue}/${goal.targetValue}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Record Response
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Record your response and receive evaluator perception analysis
          </p>
        </div>

        {/* Evaluation Mode Selector */}
        <EvaluationModeSelector
          selectedMode={evaluationMode}
          onModeChange={setEvaluationMode}
          className="mb-6"
        />

        {/* Main Content with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Recording Area */}
          <div className="flex-1">
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
                  <Mic className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Pitch and Frequency Visualizer */}
          {isRecording && (
            <div className="w-full max-w-2xl mb-8 space-y-3">
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
                    </div>                {/* Pitch labels */}
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
            <li>• <span className="font-medium text-primary-600 dark:text-primary-400">Record 15-20 seconds for best and fastest results</span> (optimized for server efficiency)</li>
            <li>• Practice speaking for 30-60 seconds for comprehensive analysis</li>
          </ul>
        </div>
          </div>

          {/* Sidebar - Goals */}
          {!loadingGoals && activeGoals.length > 0 && (
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Goals</h3>
                  </div>
                  <button
                    onClick={() => navigate('/profile?tab=goals')}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  >
                    View
                  </button>
                </div>
                
                <div className="space-y-2">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const progress = calculateGoalProgress(goal);
                    const isNearCompletion = progress >= 80;
                    
                    return (
                      <div
                        key={goal._id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-xs font-medium line-clamp-1 text-gray-800 dark:text-gray-200 flex-1">
                            {goal.title}
                          </h4>
                          {isNearCompletion && (
                            <span className="text-xs ml-1">🔥</span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-1">
                          <div
                            className={`absolute h-full rounded-full transition-all duration-500 ${
                              isNearCompletion 
                                ? 'bg-amber-500' 
                                : 'bg-primary-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {getGoalDisplayValue(goal)}
                          </span>
                          <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {activeGoals.length > 3 && (
                  <p className="text-center text-[10px] mt-2 text-gray-500 dark:text-gray-400">
                    +{activeGoals.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceStudio;
