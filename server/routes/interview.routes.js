const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const interviewController = require('../controllers/interview.controller');

// All routes require authentication
router.use(auth);

/**
 * @route   POST /api/interview/create
 * @desc    Create new interview session with job description
 * @access  Private
 */
router.post('/create', interviewController.createInterviewSession);

/**
 * @route   GET /api/interview/session/:sessionId
 * @desc    Get interview session details
 * @access  Private
 */
router.get('/session/:sessionId', interviewController.getInterviewSession);

/**
 * @route   POST /api/interview/session/:sessionId/start
 * @desc    Start the interview (get first question)
 * @access  Private
 */
router.post('/session/:sessionId/start', interviewController.startInterview);

/**
 * @route   POST /api/interview/session/:sessionId/answer
 * @desc    Submit answer for current question
 * @access  Private
 */
router.post('/session/:sessionId/answer', interviewController.submitAnswer);

/**
 * @route   POST /api/interview/session/:sessionId/next
 * @desc    Move to next question
 * @access  Private
 */
router.post('/session/:sessionId/next', interviewController.nextQuestion);

/**
 * @route   GET /api/interview/session/:sessionId/report
 * @desc    Get final interview report
 * @access  Private
 */
router.get('/session/:sessionId/report', interviewController.getInterviewReport);

/**
 * @route   POST /api/interview/session/:sessionId/pause
 * @desc    Pause the interview
 * @access  Private
 */
router.post('/session/:sessionId/pause', interviewController.pauseInterview);

/**
 * @route   GET /api/interview/history
 * @desc    Get user's interview history
 * @access  Private
 */
router.get('/history', interviewController.getInterviewHistory);

/**
 * @route   DELETE /api/interview/session/:sessionId
 * @desc    Delete interview session
 * @access  Private
 */
router.delete('/session/:sessionId', interviewController.deleteInterviewSession);

/**
 * @route   POST /api/interview/audio/intro
 * @desc    Generate audio for interview introduction
 * @access  Private
 */
router.post('/audio/intro', interviewController.generateIntroAudio);

/**
 * @route   POST /api/interview/audio/question
 * @desc    Generate audio for a specific question
 * @access  Private
 */
router.post('/audio/question', interviewController.generateQuestionAudio);

/**
 * @route   POST /api/interview/audio/completion
 * @desc    Generate audio for interview completion
 * @access  Private
 */
router.post('/audio/completion', interviewController.generateCompletionAudio);

module.exports = router;
