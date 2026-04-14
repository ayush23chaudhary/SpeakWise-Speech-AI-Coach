/**
 * Google Analytics Tracking Utility
 * Track key events in SpeakWise
 */

import ReactGA from 'react-ga4';

// Initialize GA (called once in App.jsx)
export const initializeGA = () => {
  ReactGA.initialize('G-B93EWKZNHY');
  console.log('✅ Google Analytics initialized');
};

// Track Page Views (automatic with React Router)
export const trackPageView = (path, title) => {
  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title
  });
  console.log(`📊 Page view tracked: ${title}`);
};

// Track Contact Form Submission
export const trackContactFormSubmit = (subject) => {
  ReactGA.event('contact_form_submit', {
    event_category: 'engagement',
    event_label: subject,
    value: 1
  });
  console.log('📧 Contact form submission tracked');
};

// Track Sign Up
export const trackSignUp = (method) => {
  ReactGA.event('sign_up', {
    method: method // 'email', 'google', 'github'
  });
  console.log('🆕 Sign up tracked:', method);
};

// Track Login
export const trackLogin = (method) => {
  ReactGA.event('login', {
    method: method // 'email', 'google', 'github'
  });
  console.log('🔐 Login tracked:', method);
};

// Track Practice Session Started
export const trackPracticeSessionStart = (type) => {
  ReactGA.event('practice_session_start', {
    session_type: type, // 'interview', 'presentation', 'conversation'
    value: 1
  });
  console.log('🎤 Practice session started:', type);
};

// Track Practice Session Completed
export const trackPracticeSessionComplete = (type, duration) => {
  ReactGA.event('practice_session_complete', {
    session_type: type,
    duration_seconds: duration,
    value: 1
  });
  console.log('✅ Practice session completed:', type, `(${duration}s)`);
};

// Track AI Feedback Generated
export const trackAIFeedbackGenerated = (type) => {
  ReactGA.event('ai_feedback_generated', {
    feedback_type: type, // 'pronunciation', 'fluency', 'content', 'overall'
    value: 1
  });
  console.log('🤖 AI feedback generated:', type);
};

// Track Feature Used
export const trackFeatureUsed = (feature) => {
  ReactGA.event('feature_used', {
    feature_name: feature,
    value: 1
  });
  console.log('⚡ Feature used:', feature);
};

// Track Error
export const trackError = (error, errorType) => {
  ReactGA.event('error', {
    error_type: errorType,
    error_message: error,
    value: 1
  });
  console.error('❌ Error tracked:', errorType, error);
};

// Track Custom Event
export const trackCustomEvent = (eventName, eventData) => {
  ReactGA.event(eventName, eventData);
  console.log(`📈 Custom event tracked: ${eventName}`, eventData);
};

// ============================================
// FUNNEL TRACKING: Practice Session Workflow
// ============================================
// Funnel: Logged In -> Clicked Practice -> Recorded Audio -> Viewed Results

/**
 * Step 1: User Logged In
 * Fires when user successfully authenticates
 */
export const trackFunnelStep1_LoggedIn = () => {
  ReactGA.event('funnel_step_1_logged_in', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    step: 1,
    value: 1
  });
  console.log('📊 Funnel Step 1: User Logged In');
};

/**
 * Step 2: Clicked Practice / Exercise Started
 * Fires when user clicks on a practice exercise
 */
export const trackFunnelStep2_ClickedPractice = (exerciseType, exerciseId) => {
  ReactGA.event('funnel_step_2_clicked_practice', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    step: 2,
    exercise_type: exerciseType || 'general',
    exercise_id: exerciseId || 'unknown',
    value: 1
  });
  console.log('🎤 Funnel Step 2: User Clicked Practice', { exerciseType, exerciseId });
};

/**
 * Step 3: Started Recording / Recorded Audio
 * Fires when user actually starts recording their speech
 */
export const trackFunnelStep3_RecordedAudio = (exerciseType, exerciseId, recordingLength = 0) => {
  ReactGA.event('funnel_step_3_recorded_audio', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    step: 3,
    exercise_type: exerciseType || 'general',
    exercise_id: exerciseId || 'unknown',
    recording_length_seconds: recordingLength,
    value: 1
  });
  console.log('🎙️ Funnel Step 3: User Recorded Audio', { exerciseType, recordingLength });
};

/**
 * Step 4: Viewed Results / AI Feedback Received
 * Fires when user views the analysis/feedback results
 */
export const trackFunnelStep4_ViewedResults = (exerciseType, exerciseId, analysisScore = null) => {
  ReactGA.event('funnel_step_4_viewed_results', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    step: 4,
    exercise_type: exerciseType || 'general',
    exercise_id: exerciseId || 'unknown',
    analysis_score: analysisScore || 0,
    value: 1
  });
  console.log('✅ Funnel Step 4: User Viewed Results', { exerciseType, analysisScore });
};

/**
 * Funnel Drop-off: User Abandoned During Practice
 * Fires when user closes modal or navigates away during practice
 */
export const trackFunnelDropOff = (fromStep, exerciseType, reason = 'abandoned') => {
  ReactGA.event('funnel_drop_off', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    dropped_from_step: fromStep,
    exercise_type: exerciseType || 'general',
    drop_reason: reason, // 'microphone_error', 'analysis_failed', 'user_closed', 'network_error', 'abandoned'
    value: 1
  });
  console.error('❌ Funnel Drop-off: User abandoned at step', fromStep, 'Reason:', reason);
};

/**
 * Funnel Completion: Full Workflow Completed
 * Fires when user successfully completes entire workflow
 */
export const trackFunnelCompletion = (exerciseType, exerciseId, totalTime, analysisScore) => {
  ReactGA.event('funnel_complete', {
    event_category: 'funnel',
    event_label: 'practice_workflow',
    exercise_type: exerciseType || 'general',
    exercise_id: exerciseId || 'unknown',
    total_time_seconds: totalTime,
    analysis_score: analysisScore || 0,
    value: 1
  });
  console.log('🎉 Funnel Completed! User fully engaged in practice workflow', {
    exerciseType,
    totalTime,
    analysisScore
  });
};

export default {
  initializeGA,
  trackPageView,
  trackContactFormSubmit,
  trackSignUp,
  trackLogin,
  trackPracticeSessionStart,
  trackPracticeSessionComplete,
  trackAIFeedbackGenerated,
  trackFeatureUsed,
  trackError,
  trackCustomEvent,
  trackFunnelStep1_LoggedIn,
  trackFunnelStep2_ClickedPractice,
  trackFunnelStep3_RecordedAudio,
  trackFunnelStep4_ViewedResults,
  trackFunnelDropOff,
  trackFunnelCompletion
};
