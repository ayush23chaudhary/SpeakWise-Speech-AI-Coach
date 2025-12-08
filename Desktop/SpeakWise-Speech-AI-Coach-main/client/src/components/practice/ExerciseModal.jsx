import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../utils/api';

const ExerciseModal = ({ exercise, onClose, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check supported MIME types and use the best one
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      console.log('🎤 Starting recording with MIME type:', mimeType || 'default');
      
      const options = mimeType ? { mimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // Use the actual MIME type from the MediaRecorder
        const actualMimeType = mediaRecorderRef.current.mimeType;
        console.log('🎵 Recording stopped, actual MIME type:', actualMimeType);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        console.log('📦 Blob created, size:', audioBlob.size, 'type:', audioBlob.type);
        
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const analyzeRecording = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('📤 Sending audio for analysis...');
      console.log('   - Blob size:', audioBlob.size);
      console.log('   - Blob type:', audioBlob.type);
      
      const formData = new FormData();
      
      // Determine file extension based on MIME type
      let fileName = 'exercise-recording.webm';
      if (audioBlob.type.includes('ogg')) {
        fileName = 'exercise-recording.ogg';
      } else if (audioBlob.type.includes('mp4')) {
        fileName = 'exercise-recording.mp4';
      }
      
      console.log('   - File name:', fileName);
      
      formData.append('audio', audioBlob, fileName);
      formData.append('exerciseId', exercise._id || 'practice-exercise');
      formData.append('exerciseCategory', exercise.category || 'general');
      formData.append('isPracticeExercise', 'true'); // Flag to prevent saving to history

      // Send to the speech analysis endpoint
      const response = await api.post('/speech/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Analysis response received:', response.data);

      if (response.data.success) {
        setAnalysisResult(response.data.data);
        
        // DON'T record completion here - let user review results first
        // They will click "Complete" button to save progress and close modal
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error analyzing recording:', error);
      console.error('   - Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to analyze recording. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recordExerciseCompletion = async (analysisData) => {
    try {
      console.log('📝 Recording exercise completion...');
      console.log('   - Exercise:', exercise);
      console.log('   - Analysis data:', analysisData);

      const performance = {
        clarity: analysisData.metrics?.clarity || 0,
        fluency: analysisData.metrics?.fluency || 0,
        pace: analysisData.metrics?.pace || 0,
        fillerWords: Object.values(analysisData.fillerWords || {}).reduce((sum, count) => sum + count, 0)
      };

      console.log('   - Performance data:', performance);

      // Use exercise ID if available, otherwise use a generic identifier
      const exerciseId = exercise._id || `${exercise.category}-${exercise.difficulty}-${Date.now()}`;
      console.log('   - Exercise ID:', exerciseId);

      const response = await api.post('/practice-hub/complete-exercise', {
        exerciseId: exerciseId,
        exerciseTitle: exercise.title, // Add title for better tracking
        exerciseCategory: exercise.category, // Add category for skill level updates
        performance,
        // Don't send analysisReportId for practice exercises (they're not saved to DB)
        // analysisReportId: analysisData._id 
      });

      console.log('✅ Exercise completion response:', response.data);

      if (response.data.success) {
        console.log('🎉 Progress updated successfully!');
        console.log('   - New achievements:', response.data.data.newAchievements);
        
        // Notify parent component
        onComplete(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error recording exercise completion:', error);
      console.error('   - Error response:', error.response?.data);
      
      // Don't fail silently - still notify parent but with error info
      if (onComplete) {
        onComplete({ error: true, message: error.message });
      }
    }
  };

  const retryRecording = () => {
    setAudioBlob(null);
    setAnalysisResult(null);
    setError(null);
    setRecordingTime(0);
  };

  const handleCompleteExercise = async () => {
    if (!analysisResult) {
      onClose();
      return;
    }

    setIsSavingProgress(true);
    
    try {
      // Record the completion and update progress
      await recordExerciseCompletion(analysisResult);
      
      // Modal will close via onComplete callback in recordExerciseCompletion
    } catch (error) {
      console.error('Error completing exercise:', error);
      // Still close the modal even if there was an error
      onClose();
    } finally {
      setIsSavingProgress(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'pronunciation': 'bg-purple-500',
      'fluency': 'bg-blue-500',
      'pacing': 'bg-cyan-500',
      'confidence': 'bg-yellow-500',
      'vocabulary': 'bg-green-500',
      'filler-words': 'bg-red-500',
      'tone': 'bg-pink-500',
      'articulation': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.title}
              </h2>
              <Badge variant={exercise.difficulty === 'beginner' ? 'success' : exercise.difficulty === 'intermediate' ? 'warning' : 'danger'}>
                {exercise.difficulty}
              </Badge>
              <span className={`px-3 py-1 rounded-full text-white text-sm ${getCategoryColor(exercise.category)}`}>
                {exercise.category}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Instructions */}
        {!analysisResult && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Instructions:</h3>
            <div className="space-y-2">
              {exercise.instructions?.map((instruction) => (
                <div key={instruction.step} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                      {instruction.step}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{instruction.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Text */}
        {exercise.practiceText && !analysisResult && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Practice Text:</h3>
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed italic">
              "{exercise.practiceText}"
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Recording Section */}
        {!analysisResult && (
          <div className="mb-6">
            <div className="flex flex-col items-center space-y-4">
              {/* Recording Timer */}
              {isRecording && (
                <div className="text-4xl font-bold text-red-600 animate-pulse">
                  {formatTime(recordingTime)}
                </div>
              )}

              {/* Recording Button */}
              {!audioBlob && (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? 'danger' : 'primary'}
                  size="large"
                  className="w-full max-w-md"
                >
                  {isRecording ? (
                    <>
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              )}

              {/* Audio Preview */}
              {audioBlob && !isAnalyzing && (
                <div className="w-full max-w-md space-y-4">
                  <audio
                    controls
                    src={URL.createObjectURL(audioBlob)}
                    className="w-full"
                  />
                  <div className="flex space-x-3">
                    <Button
                      onClick={analyzeRecording}
                      variant="primary"
                      className="flex-1"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Analyze Performance
                    </Button>
                    <Button
                      onClick={retryRecording}
                      variant="secondary"
                      className="flex-1"
                    >
                      Record Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Analyzing */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <LoadingSpinner size="large" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Analyzing your performance...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Analysis Complete! 🎉
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Review your results below and click "Complete" to save your progress.
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <div className="text-center">
              <div className="inline-block">
                <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {analysisResult.overallScore}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">Overall Score</div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analysisResult.metrics || {}).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {key}
                  </div>
                </div>
              ))}
            </div>

            {/* Transcript */}
            {analysisResult.transcript && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Your Transcript:
                </h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    {analysisResult.transcript}
                  </p>
                </div>
              </div>
            )}

            {/* Feedback */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Feedback:
                </h3>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-purple-600">•</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={retryRecording}
                variant="secondary"
                className="flex-1"
                disabled={isSavingProgress}
              >
                Try Again
              </Button>
              <Button
                onClick={handleCompleteExercise}
                variant="primary"
                className="flex-1"
                disabled={isSavingProgress}
              >
                {isSavingProgress ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Target Metrics */}
        {exercise.targetMetrics && !analysisResult && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Goals:</h3>
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {exercise.targetMetrics.minClarity && (
                <p>• Achieve clarity score of {exercise.targetMetrics.minClarity}+</p>
              )}
              {exercise.targetMetrics.maxFillerWords !== undefined && (
                <p>• Use no more than {exercise.targetMetrics.maxFillerWords} filler words</p>
              )}
              {exercise.targetMetrics.targetPace && (
                <p>• Maintain pace between {exercise.targetMetrics.targetPace.min}-{exercise.targetMetrics.targetPace.max} WPM</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExerciseModal;
