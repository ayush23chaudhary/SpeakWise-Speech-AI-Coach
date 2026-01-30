import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, Square, Play, Pause, SkipForward, CheckCircle2, 
  Clock, AlertCircle, Loader2, Trophy, ArrowRight, Home, RefreshCw, Volume2, VolumeX
} from 'lucide-react';
import api from '../../utils/api';
import useAudioRecorder from '../../hooks/useAudioRecorder';
import useInterviewAudio from '../../hooks/useInterviewAudio';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-hot-toast';

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [generationTimeout, setGenerationTimeout] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const [showIntroScreen, setShowIntroScreen] = useState(false);
  const [questionRevealed, setQuestionRevealed] = useState(false);

  const {
    isRecording,
    isPaused,
    duration: recordingTime,
    audioBlob,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    pauseRecording,
    resumeRecording,
    resetRecording: resetAudioRecording
  } = useAudioRecorder();

  const {
    isPlaying: isAudioPlaying,
    isLoading: isAudioLoading,
    displayText,
    fullText,
    playIntro,
    playQuestion,
    playCompletion,
    stop: stopAudio,
    cleanup: cleanupAudio
  } = useInterviewAudio();

  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = React.useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [cleanupAudio]);

  // Auto-poll when session is in 'generating' state
  useEffect(() => {
    if (session?.status === 'generating' && pollingCount < 15) {
      const pollTimer = setTimeout(() => {
        loadSession();
        setPollingCount(prev => prev + 1);
      }, 5000); // Poll every 5 seconds
      
      return () => clearTimeout(pollTimer);
    } else if (pollingCount >= 15 && session?.status === 'generating') {
      // Timeout after 75 seconds (15 polls * 5 seconds)
      setGenerationTimeout(true);
      setLoading(false);
    }
  }, [session?.status, pollingCount]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    // Guard: Don't load if sessionId is undefined
    if (!sessionId || sessionId === 'undefined') {
      console.warn('⚠️ Cannot load session: sessionId is undefined');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get(`/interview/session/${sessionId}`);
      const sessionData = response.data.session;
      
      setSession(sessionData);
      setTotalQuestions(sessionData.questions.length);

      // Check session status
      if (sessionData.status === 'generating') {
        // Poll for ready status
        pollForReady();
      } else if (sessionData.status === 'ready') {
        // Ready to start
      } else if (sessionData.status === 'in_progress') {
        // Resume from current question
        setCurrentQuestion(sessionData.questions[sessionData.currentQuestionIndex]);
        setQuestionNumber(sessionData.currentQuestionIndex + 1);
      } else if (sessionData.status === 'completed') {
        // Redirect to report
        navigate(`/dashboard/interview/${sessionId}/report`);
      } else if (sessionData.status === 'abandoned' || sessionData.status === 'paused') {
        // Show resume or restart options
        // Continue loading to show the resume UI
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load interview session');
      setLoading(false);
    }
  };

  const pollForReady = async () => {
    const checkStatus = setInterval(async () => {
      try {
        const response = await api.get(`/interview/session/${sessionId}`);
        if (response.data.session.status === 'ready') {
          clearInterval(checkStatus);
          setSession(response.data.session);
          setTotalQuestions(response.data.session.questions.length);
          toast.success('✅ Interview questions ready!');
        }
      } catch (error) {
        clearInterval(checkStatus);
        toast.error('Failed to generate questions');
      }
    }, 2000);

    // Timeout after 60 seconds
    setTimeout(() => clearInterval(checkStatus), 60000);
  };

  const handleStartInterview = async () => {
    try {
      const response = await api.post(`/interview/session/${sessionId}/start`);
      setCurrentQuestion(response.data.currentQuestion);
      setQuestionNumber(1);
      setTotalQuestions(response.data.totalQuestions);
      setQuestionRevealed(false); // Don't show question yet
      
      // Play intro if voice enabled
      if (voiceEnabled && !hasPlayedIntro) {
        setShowIntroScreen(true); // Show intro screen while intro plays
        toast.success('🎤 Interview starting...');
        
        const userName = user?.name || 'there';
        const jobTitle = session?.jobTitle || 'this position';
        await playIntro(userName, jobTitle);
        setHasPlayedIntro(true);
        
        // Hide intro screen after intro completes
        setShowIntroScreen(false);
        toast.success('Let\'s begin!');
        
        // After intro, play first question
        if (response.data.currentQuestion?.question) {
          setQuestionRevealed(true); // Now reveal the question
          await playQuestion(
            response.data.currentQuestion.question,
            1,
            response.data.totalQuestions
          );
        }
      } else {
        setQuestionRevealed(true); // Show question immediately if voice disabled
        toast.success('🎤 Interview started. Good luck!');
      }
      
      // Reload session to update status
      loadSession();
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview');
      setShowIntroScreen(false);
      setQuestionRevealed(true); // Show question on error
    }
  };

  // Speech recognition functions
  const startRecording = async () => {
    try {
      // Start audio recording
      await startAudioRecording();

      // Initialize Web Speech API for transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.error('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        setIsTranscribing(true);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      recognition.start();
      recognitionRef.current = recognition;

      toast.success('🎤 Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }

      // Stop audio recording
      await stopAudioRecording();
      
      setIsTranscribing(false);
      toast.success('🛑 Recording stopped!');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Error stopping recording');
    }
  };

  const resetRecording = () => {
    // Stop any ongoing recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Reset audio recording
    resetAudioRecording();
    
    // Clear transcript
    setTranscript('');
    setIsTranscribing(false);
    
    toast.info('Recording reset');
  };

  const handleSubmitAnswer = async () => {
    if (!transcript || transcript.trim().length < 10) {
      toast.error('Please provide a more substantial answer (at least 10 words)');
      return;
    }

    setSubmitting(true);
    setAnalyzing(true);

    try {
      // Submit answer (quick scoring happens in background)
      const response = await api.post(`/interview/session/${sessionId}/answer`, {
        transcript: transcript.trim(),
        duration: recordingTime,
        audioUrl: null
      });

      toast.success('✅ Answer submitted!');

      // Always move to next question (or complete interview)
      // The /next endpoint handles both advancing and completion
      await moveToNextQuestion();

      setAnalyzing(false);

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
      setAnalyzing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const moveToNextQuestion = async () => {
    try {
      const response = await api.post(`/interview/session/${sessionId}/next`);
      
      if (response.data.completed) {
        // Interview completed
        toast.success('🎉 Interview completed! Generating comprehensive report...');
        
        // Play completion audio
        if (voiceEnabled) {
          const userName = user?.name || 'there';
          await playCompletion(userName);
        }
        
        setShowFeedback(false);
        setCurrentFeedback(null);
        
        // Navigate to report page
        setTimeout(() => {
          navigate(`/dashboard/interview/${sessionId}/report`);
        }, 1500);
      } else {
        // More questions remaining
        setQuestionRevealed(false); // Hide question initially
        setCurrentQuestion(response.data.currentQuestion);
        setQuestionNumber(questionNumber + 1);
        setShowFeedback(false);
        setCurrentFeedback(null);
        resetRecording();
        
        // Small delay to ensure state updates, then play next question audio automatically
        if (voiceEnabled && response.data.currentQuestion?.question) {
          toast.info('📝 Next question...');
          
          // Use setTimeout to ensure state has settled
          setTimeout(() => {
            setQuestionRevealed(true); // Reveal just before playing
            playQuestion(
              response.data.currentQuestion.question,
              questionNumber + 1,
              totalQuestions
            ).catch(err => {
              console.error('Error auto-playing next question:', err);
              // On error, just show the question
              setQuestionRevealed(true);
            });
          }, 300);
        } else {
          // If voice disabled, show question immediately
          setQuestionRevealed(true);
          toast.info('📝 Recording ready for next question!');
        }
      }
    } catch (error) {
      console.error('Error moving to next question:', error);
      toast.error('Failed to load next question');
      setQuestionRevealed(true); // Show question on error
    }
  };

  const handleNextQuestion = async () => {
    // This is now only used if user wants to skip or from feedback screen
    await moveToNextQuestion();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-[#1FB6A6] animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {session?.status === 'generating' 
                ? '🤖 AI is generating personalized questions...' 
                : 'Loading interview session...'}
            </p>
            {session?.status === 'generating' && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                This usually takes 10-30 seconds ({pollingCount * 5}s elapsed)
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Generation timeout - show error with retry option
  if (generationTimeout) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Generation Taking Longer Than Expected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              The AI is taking longer than usual to generate questions. This might be due to:
            </p>
            <ul className="text-left text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto space-y-2">
              <li>• High API load - try again in a moment</li>
              <li>• Missing GEMINI_API_KEY in server configuration</li>
              <li>• Network connectivity issues</li>
            </ul>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setGenerationTimeout(false);
                  setPollingCount(0);
                  setLoading(true);
                  loadSession();
                }}
                className="btn-primary inline-flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard/interview')}
                className="btn-secondary inline-flex items-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state - generation error
  if (session?.status === 'failed') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Question Generation Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We encountered an error while generating interview questions.
            </p>
            {session.errorMessage && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-mono bg-red-50 dark:bg-red-900/20 p-3 rounded max-w-md mx-auto">
                {session.errorMessage}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard/interview')}
                className="btn-primary inline-flex items-center"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary inline-flex items-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - session not found
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Session Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Unable to load the interview session. Please try again.
            </p>
            <button
              onClick={() => navigate('/dashboard/interview')}
              className="btn-primary inline-flex items-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Intro screen - shows while intro message is playing
  if (showIntroScreen) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
              <Volume2 className="w-10 h-10 text-[#1FB6A6] animate-pulse" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Your Interview
            </h2>
            
            {/* Streaming intro text */}
            {displayText && (
              <div className="max-w-2xl mx-auto mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-[#1FB6A6] dark:text-primary-400 font-medium">
                    AI Speaking...
                  </span>
                </div>
                
                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                  {displayText}
                  <span className="inline-block w-1 h-6 bg-[#F8FAFF]0 ml-1 animate-pulse"></span>
                </p>
              </div>
            )}
            
            {!displayText && (
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Loader2 className="w-6 h-6 text-[#1FB6A6] animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">
                  Preparing your interview...
                </span>
              </div>
            )}
            
            <div className="bg-[#F8FAFF] dark:bg-blue-900/20 border border-[#EEF2FF] dark:border-blue-800 rounded-lg p-4 max-w-xl mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🎧 <strong>Tip:</strong> Make sure your audio is on and your microphone is ready
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready to start screen
  if (session?.status === 'ready' && !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Ready!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {totalQuestions} questions have been generated for <strong>{session.jobTitle}</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-[#F8FAFF] dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-[#1E2A5A] dark:text-blue-400 font-medium mb-1">Type</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {session.interviewType.replace(/_/g, ' ')}
                </p>
              </div>
              
              <div className="bg-[#EEF2FF] dark:bg-[#2A3A7A]/20 rounded-lg p-4">
                <p className="text-sm text-[#6C63FF] dark:text-[#6C63FF] font-medium mb-1">Level</p>
                <p className="text-lg font-bold text-[#2A3A7A] dark:text-[#6C63FF]/10 capitalize">
                  {session.experienceLevel}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Questions</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {totalQuestions}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                💡 Interview Tips
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Use the STAR method for behavioral questions (Situation, Task, Action, Result)</li>
                <li>• Think out loud for technical questions - show your reasoning</li>
                <li>• Take a moment to collect your thoughts before answering</li>
                <li>• Speak clearly and at a moderate pace</li>
                <li>• You'll get instant feedback after each answer</li>
              </ul>
            </div>

            <button
              onClick={handleStartInterview}
              className="btn-primary inline-flex items-center px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Abandoned or Paused session - show restart/resume options
  if (session?.status === 'abandoned' || session?.status === 'paused') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {session.status === 'abandoned' ? 'Interview Not Completed' : 'Interview Paused'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This interview for <strong>{session.jobTitle}</strong> was {session.status}.
              {session.currentQuestionIndex > 0 && (
                <span className="block mt-2">
                  You completed {session.currentQuestionIndex} out of {totalQuestions} questions.
                </span>
              )}
            </p>

            <div className="bg-[#F8FAFF] dark:bg-blue-900/20 border border-[#EEF2FF] dark:border-blue-800 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 Interview Details
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• <strong>Type:</strong> {session.interviewType.replace(/_/g, ' ')}</p>
                <p>• <strong>Level:</strong> {session.experienceLevel}</p>
                <p>• <strong>Questions:</strong> {totalQuestions}</p>
                <p>• <strong>Created:</strong> {new Date(session.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard/interview')}
                className="btn-secondary px-6 py-3"
              >
                Start New Interview
              </button>
              {session.currentQuestionIndex > 0 && session.currentQuestionIndex < totalQuestions && (
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/interview/session/${sessionId}/start`);
                      loadSession();
                      toast.success('Resuming interview...');
                    } catch (error) {
                      toast.error('Failed to resume interview');
                    }
                  }}
                  className="btn-primary inline-flex items-center px-6 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume Interview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview in progress
  if (currentQuestion && !showFeedback) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {questionNumber} of {totalQuestions}
              </p>
              <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-[#1FB6A6] rounded-full transition-all duration-300"
                  style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-5 h-5" />
              <span className="font-mono">
                {Math.floor(currentQuestion.timeLimit / 60)}:{String(currentQuestion.timeLimit % 60).padStart(2, '0')} suggested
              </span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-block px-3 py-1 bg-[#6C63FF]/10 dark:bg-[#2A3A7A]/20 text-[#4A42D8] dark:text-[#6C63FF]/20 rounded-full text-xs font-medium">
              {currentQuestion.category.replace(/_/g, ' ')}
            </span>
            
            {/* Voice toggle */}
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) {
                  stopAudio();
                  toast.info('Voice assistance disabled');
                } else {
                  toast.success('Voice assistance enabled');
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#1FB6A6]" />
                  <span className="text-xs text-gray-700 dark:text-gray-300">Voice On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Voice Off</span>
                </>
              )}
            </button>
          </div>
          
          {/* Question Text Display */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Show loading state if question not revealed yet */}
              {voiceEnabled && !questionRevealed ? (
                <div className="flex items-center space-x-3 py-4">
                  <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                  <span className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">
                    Preparing next question...
                  </span>
                </div>
              ) : voiceEnabled && isAudioPlaying && displayText ? (
                /* Show streaming text while voice is playing */
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-[#F8FAFF]0 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-[#1FB6A6] dark:text-primary-400 font-medium">
                      AI Speaking...
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {displayText}
                    <span className="inline-block w-1 h-6 bg-[#F8FAFF]0 ml-1 animate-pulse"></span>
                  </h2>
                </div>
              ) : (
                /* Show full question when streaming complete or voice disabled */
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion.question}
                </h2>
              )}
            </div>
            
            {/* Play question button */}
            {voiceEnabled && (
              <button
                onClick={async () => {
                  await playQuestion(currentQuestion.question, questionNumber, totalQuestions);
                }}
                disabled={isAudioPlaying || isAudioLoading}
                className="ml-4 p-3 rounded-full bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Play question"
              >
                {isAudioLoading ? (
                  <Loader2 className="w-5 h-5 text-[#1FB6A6] animate-spin" />
                ) : isAudioPlaying ? (
                  <Pause className="w-5 h-5 text-[#1FB6A6]" />
                ) : (
                  <Play className="w-5 h-5 text-[#1FB6A6]" />
                )}
              </button>
            )}
          </div>

          {/* Recording Controls */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              {!isRecording && !transcript && (
                <div className="text-center space-y-4">
                  <button
                    onClick={startRecording}
                    className="btn-primary inline-flex items-center px-8 py-4 text-lg"
                  >
                    <Mic className="w-6 h-6 mr-2" />
                    Start Recording Answer
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to start recording your answer. Speak clearly and naturally.
                  </p>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center space-x-4">
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="btn-secondary inline-flex items-center px-6 py-3"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="btn-primary inline-flex items-center px-6 py-3"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </button>
                  )}

                  <button
                    onClick={stopRecording}
                    className="btn-primary inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </button>
                </div>
              )}
            </div>

            {isRecording && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-red-600 font-medium">Recording...</span>
                </div>
                <p className="text-3xl font-mono text-gray-900 dark:text-white">
                  {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                </p>
                
                {/* Live transcript preview */}
                {transcript && (
                  <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-left max-h-40 overflow-y-auto">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${isTranscribing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      {isTranscribing ? 'Transcribing...' : 'Listening...'}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {transcript}
                    </p>
                  </div>
                )}
              </div>
            )}

            {transcript && !isRecording && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Answer:</p>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {transcript}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Duration: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={resetRecording}
                    className="btn-secondary flex-1"
                  >
                    Re-record Answer
                  </button>
                  
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {analyzing && (
          <div className="card">
            <div className="flex items-center space-x-4">
              <Loader2 className="w-6 h-6 text-[#1FB6A6] animate-spin" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Analyzing your answer...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Evaluating both content quality and speech delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show feedback after answer
  if (showFeedback && currentFeedback) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Header */}
        <div className="card bg-gradient-to-r from-[#1FB6A6] to-[#17A293] text-white">
          <div className="text-center py-6">
            <p className="text-sm opacity-90 mb-2">Question {questionNumber} Score</p>
            <div className="text-6xl font-bold mb-2">
              {currentFeedback.overallScore}
              <span className="text-3xl opacity-75">/100</span>
            </div>
            <p className="text-sm opacity-90">
              {currentFeedback.overallScore >= 85 ? '🌟 Excellent!' :
               currentFeedback.overallScore >= 75 ? '✅ Great job!' :
               currentFeedback.overallScore >= 60 ? '👍 Good effort' :
               '📚 Room for improvement'}
            </p>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Speech Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎤 Speech Delivery
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                  <span className="font-semibold">{currentFeedback.speechAnalysis.confidenceScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F8FAFF]0"
                    style={{ width: `${currentFeedback.speechAnalysis.confidenceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Clarity</span>
                  <span className="font-semibold">{currentFeedback.speechAnalysis.clarityScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${currentFeedback.speechAnalysis.clarityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Pacing</span>
                  <span className="font-semibold">{currentFeedback.speechAnalysis.pacingScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#EEF2FF]0"
                    style={{ width: `${currentFeedback.speechAnalysis.pacingScore}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Filler Words: <span className="font-semibold">{currentFeedback.speechAnalysis.fillerWordsCount}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Content Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📝 Content Quality
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Relevance</span>
                  <span className="font-semibold">{currentFeedback.contentAnalysis.relevanceScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F8FAFF]0"
                    style={{ width: `${currentFeedback.contentAnalysis.relevanceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Depth</span>
                  <span className="font-semibold">{currentFeedback.contentAnalysis.depthScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${currentFeedback.contentAnalysis.depthScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Structure</span>
                  <span className="font-semibold">{currentFeedback.contentAnalysis.structureScore}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#EEF2FF]0"
                    style={{ width: `${currentFeedback.contentAnalysis.structureScore}%` }}
                  />
                </div>
              </div>

              {currentFeedback.contentAnalysis.technicalAccuracy > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Technical Accuracy</span>
                    <span className="font-semibold">{currentFeedback.contentAnalysis.technicalAccuracy}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500"
                      style={{ width: `${currentFeedback.contentAnalysis.technicalAccuracy}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💬 Detailed Feedback
          </h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{currentFeedback.feedback}</p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
              ✅ Strengths
            </h4>
            <ul className="space-y-2">
              {currentFeedback.contentAnalysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
              📈 Areas to Improve
            </h4>
            <ul className="space-y-2">
              {currentFeedback.contentAnalysis.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                  • {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvement Tips */}
        <div className="card bg-[#F8FAFF] dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 How to Improve This Answer
          </h4>
          <ul className="space-y-2">
            {currentFeedback.contentAnalysis.improvementTips.map((tip, idx) => (
              <li key={idx} className="text-sm text-blue-800 dark:text-blue-200">
                {idx + 1}. {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Next Button */}
        <div className="card">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">
              {questionNumber < totalQuestions 
                ? `${totalQuestions - questionNumber} questions remaining`
                : 'Final question completed!'}
            </p>
            
            <button
              onClick={handleNextQuestion}
              className="btn-primary"
            >
              {questionNumber < totalQuestions ? (
                <>
                  Next Question
                  <SkipForward className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  View Final Report
                  <Trophy className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unexpected states
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unexpected State
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Session Status: {session?.status || 'Unknown'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please try refreshing the page or starting a new interview.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Refresh Page
            </button>
            <button
              onClick={() => navigate('/dashboard/interview')}
              className="btn-primary inline-flex items-center"
            >
              <Home className="w-5 h-5 mr-2" />
              New Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
