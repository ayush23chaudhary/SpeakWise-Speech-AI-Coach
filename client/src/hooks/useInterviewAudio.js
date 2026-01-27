import { useState, useRef, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for handling interview audio playback with Google TTS
 * Includes text streaming for synchronized visual display
 */
const useInterviewAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayText, setDisplayText] = useState('');
  const [fullText, setFullText] = useState('');
  const audioRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingQueueRef = useRef(false);
  const textStreamIntervalRef = useRef(null);

  // Clean up audio on unmount
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (textStreamIntervalRef.current) {
      clearInterval(textStreamIntervalRef.current);
      textStreamIntervalRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;
    setIsPlaying(false);
    setDisplayText('');
    setFullText('');
  }, []);

  // Stream text word by word synchronized with audio
  const streamText = useCallback((text, durationMs) => {
    setFullText(text);
    setDisplayText('');
    setIsPlaying(true); // Set playing state for visual feedback
    
    // Clear any existing interval
    if (textStreamIntervalRef.current) {
      clearInterval(textStreamIntervalRef.current);
    }

    const words = text.split(' ');
    const wordsPerSecond = words.length / (durationMs / 1000);
    const msPerWord = 1000 / wordsPerSecond;
    
    let currentIndex = 0;
    
    textStreamIntervalRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayText(prev => prev ? `${prev} ${words[currentIndex]}` : words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(textStreamIntervalRef.current);
        textStreamIntervalRef.current = null;
        setIsPlaying(false); // Clear playing state when done
      }
    }, msPerWord);
  }, []);

  // Stop text streaming
  const stopTextStream = useCallback(() => {
    if (textStreamIntervalRef.current) {
      clearInterval(textStreamIntervalRef.current);
      textStreamIntervalRef.current = null;
    }
    setIsPlaying(false);
    // Show full text immediately
    if (fullText) {
      setDisplayText(fullText);
    }
  }, [fullText]);

  // Play audio from buffer with text streaming
  const playAudioBuffer = useCallback((audioBuffer, text, estimatedDuration = 5000) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a blob from the audio buffer
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);

        // Create or reuse audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        audio.src = audioUrl;

        // Start text streaming when audio starts
        const handlePlay = () => {
          if (text) {
            // Use actual audio duration if available, otherwise estimate
            const duration = audio.duration ? audio.duration * 1000 : estimatedDuration;
            streamText(text, duration);
          }
        };

        // Set up event listeners
        audio.onloadedmetadata = handlePlay;
        
        audio.onended = () => {
          setIsPlaying(false);
          stopTextStream(); // Show full text immediately when audio ends
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (e) => {
          setIsPlaying(false);
          stopTextStream();
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback error'));
        };

        // Play the audio
        audio.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            setIsPlaying(false);
            stopTextStream();
            URL.revokeObjectURL(audioUrl);
            reject(err);
          });

      } catch (err) {
        reject(err);
      }
    });
  }, [streamText, stopTextStream]);

  // Play intro audio
  const playIntro = useCallback(async (name, role) => {
    setIsLoading(true);
    setError(null);

    const introText = `Hello ${name}. Welcome to your ${role} interview. I'll be asking you a series of questions. Take your time to think through each answer, and speak clearly. Let's begin.`;
    
    try {
      const response = await api.post('/interview/audio/intro', 
        { name, role },
        { responseType: 'arraybuffer' }
      );

      await playAudioBuffer(response.data, introText, 8000);
      return true;
    } catch (err) {
      console.error('Error playing intro:', err);
      setError('Failed to play introduction');
      
      // Fallback: Stream text without audio
      console.log('🎯 Fallback mode: Streaming text without audio');
      toast.info('Voice unavailable, showing text');
      streamText(introText, 8000);
      
      // Wait for text streaming to complete
      await new Promise(resolve => setTimeout(resolve, 8000));
      stopTextStream();
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [playAudioBuffer, streamText, stopTextStream]);

  // Play question audio
  const playQuestion = useCallback(async (question, questionNumber = null, totalQuestions = null) => {
    setIsLoading(true);
    setError(null);

    let fullText = '';
    if (questionNumber && totalQuestions) {
      fullText = `Question ${questionNumber} of ${totalQuestions}. ${question}`;
    } else {
      fullText = question;
    }

    try {
      const response = await api.post('/interview/audio/question', 
        { question, questionNumber, totalQuestions },
        { responseType: 'arraybuffer' }
      );

      // Estimate duration based on text length (rough: 150 words per minute = 2.5 words per second)
      const wordCount = fullText.split(' ').length;
      const estimatedDuration = (wordCount / 2.5) * 1000;

      await playAudioBuffer(response.data, fullText, estimatedDuration);
      return true;
    } catch (err) {
      console.error('Error playing question:', err);
      setError('Failed to play question');
      
      // Fallback: Stream text without audio
      console.log('🎯 Fallback mode: Streaming text without audio');
      const wordCount = fullText.split(' ').length;
      const estimatedDuration = (wordCount / 2.5) * 1000;
      
      streamText(fullText, estimatedDuration);
      
      // Wait for text streaming to complete
      await new Promise(resolve => setTimeout(resolve, estimatedDuration));
      stopTextStream();
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [playAudioBuffer, streamText, stopTextStream]);

  // Play completion audio
  const playCompletion = useCallback(async (name) => {
    setIsLoading(true);
    setError(null);

    const completionText = `Thank you ${name}. You've completed all the questions. I'm now analyzing your responses and will have your detailed feedback ready shortly. Great job!`;
    
    try {
      const response = await api.post('/interview/audio/completion', 
        { name },
        { responseType: 'arraybuffer' }
      );

      await playAudioBuffer(response.data, completionText, 7000);
      return true;
    } catch (err) {
      console.error('Error playing completion:', err);
      setError('Failed to play completion message');
      
      // Fallback: Stream text without audio
      console.log('🎯 Fallback mode: Streaming text without audio');
      streamText(completionText, 7000);
      
      // Wait for text streaming to complete
      await new Promise(resolve => setTimeout(resolve, 7000));
      stopTextStream();
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [playAudioBuffer, streamText, stopTextStream]);

  // Stop current playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    stopTextStream();
  }, [stopTextStream]);

  // Toggle playback (play/pause)
  const toggle = useCallback(() => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    displayText,
    fullText,
    playIntro,
    playQuestion,
    playCompletion,
    stop,
    toggle,
    cleanup
  };
};

export default useInterviewAudio;
