const InterviewSession = require('../models/InterviewSession.model');
const InterviewAIService = require('../services/interviewAI.service');
const aiAnalysisService = require('../services/aiAnalysis.service');
const ttsService = require('../services/textToSpeech.service');

/**
 * Create new interview session with job description
 * POST /api/interview/create
 */
exports.createInterviewSession = async (req, res) => {
  try {
    const {
      interviewType,
      jobTitle,
      company,
      jobDescription,
      experienceLevel,
      numberOfQuestions,
      difficulty,
      includeFollowUps
    } = req.body;

    console.log('🎯 Creating interview session:', { jobTitle, interviewType, numberOfQuestions });

    // Validation
    if (!jobTitle || !jobDescription || !interviewType) {
      return res.status(400).json({
        success: false,
        message: 'Job title, description, and interview type are required'
      });
    }

    // Create session in 'generating' state
    const session = new InterviewSession({
      user: req.user._id,
      interviewType,
      jobTitle,
      company: company || 'N/A',
      jobDescription,
      experienceLevel: experienceLevel || 'mid',
      numberOfQuestions: numberOfQuestions || 5,
      difficulty: difficulty || 'medium',
      includeFollowUps: includeFollowUps !== false,
      status: 'generating',
      questions: []
    });

    await session.save();

    // Generate questions asynchronously (don't block response)
    generateQuestionsAsync(session._id, {
      jobTitle,
      company,
      jobDescription,
      interviewType,
      experienceLevel: experienceLevel || 'mid',
      numberOfQuestions: numberOfQuestions || 5,
      difficulty: difficulty || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Interview session created. Generating questions...',
      sessionId: session._id,
      status: 'generating'
    });

  } catch (error) {
    console.error('❌ Error creating interview session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interview session',
      error: error.message
    });
  }
};

/**
 * Generate questions asynchronously
 */
async function generateQuestionsAsync(sessionId, config) {
  try {
    console.log('🤖 Generating questions for session:', sessionId);
    console.log('📋 Config:', JSON.stringify(config, null, 2));

    const questions = await InterviewAIService.generateInterviewQuestions(config);

    console.log(`✅ Generated ${questions.length} questions`);

    await InterviewSession.findByIdAndUpdate(sessionId, {
      questions,
      status: 'ready'
    });

    console.log('✅ Session updated to ready:', sessionId);

  } catch (error) {
    console.error('❌ Failed to generate questions for session:', sessionId);
    console.error('❌ Error details:', error.message);
    console.error('❌ Full error:', error);
    
    await InterviewSession.findByIdAndUpdate(sessionId, {
      status: 'failed',
      errorMessage: error.message
    });
    
    console.log('❌ Session marked as failed:', sessionId);
  }
}

/**
 * Get interview session details
 * GET /api/interview/session/:sessionId
 */
exports.getInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate sessionId
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID'
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('❌ Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
};

/**
 * Start interview (move to in_progress)
 * POST /api/interview/session/:sessionId/start
 */
exports.startInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (session.status !== 'ready' && session.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: `Cannot start interview in ${session.status} state`
      });
    }

    session.status = 'in_progress';
    session.startedAt = session.startedAt || new Date();
    session.currentQuestionIndex = 0;

    await session.save();

    // Return first question
    const currentQuestion = session.questions[0];

    res.json({
      success: true,
      message: 'Interview started',
      currentQuestion: {
        questionNumber: currentQuestion.questionNumber,
        question: currentQuestion.question,
        category: currentQuestion.category,
        timeLimit: currentQuestion.timeLimit
      },
      totalQuestions: session.questions.length
    });

  } catch (error) {
    console.error('❌ Error starting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start interview',
      error: error.message
    });
  }
};

/**
 * Submit answer for current question
 * POST /api/interview/session/:sessionId/answer
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript, duration, audioUrl } = req.body;

    console.log('📝 Submitting answer for session:', sessionId);
    console.log('📝 Transcript length:', transcript?.length || 0);
    console.log('📝 Duration:', duration);

    // Validate transcript
    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Transcript is too short (minimum 10 characters)'
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Interview is not in progress'
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    
    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: 'No current question found'
      });
    }

    if (currentQuestion.answered) {
      return res.status(400).json({
        success: false,
        message: 'Question already answered'
      });
    }

    // Speech analysis is handled by frontend Web Speech API
    // For interview mode, we focus on content analysis only
    // Default speech scores for backward compatibility
    const speechAnalysis = {
      confidence: 75,
      clarity: 75,
      pacing: 75,
      fillerWordCount: 0,
      hesitationCount: 0,
      energy: 75,
      professionalism: 75
    };

    // Use quick scoring during interview (detailed analysis deferred to final report)
    console.log('📊 Quick scoring answer...');
    let quickScores;
    try {
      quickScores = await InterviewAIService.quickScoreAnswer({
        question: currentQuestion.question,
        questionCategory: currentQuestion.category,
        userTranscript: transcript,
        jobTitle: session.jobTitle,
        experienceLevel: session.experienceLevel
      });
      console.log('✅ Quick scoring complete');
      console.log('📊 Scores:', {
        relevance: quickScores.relevance,
        depth: quickScores.depth,
        structure: quickScores.structure,
        overall: quickScores.overallScore
      });
    } catch (contentError) {
      console.error('❌ Quick scoring error:', contentError.message);
      console.error('❌ Full error:', contentError);
      // Use defaults if scoring fails
      quickScores = {
        relevance: 70,
        depth: 70,
        structure: 70,
        overallScore: 70
      };
    }

    // Validate and sanitize scores
    const validatedOverallScore = Number.isFinite(quickScores.overallScore) 
      ? Math.round(quickScores.overallScore) 
      : 70; // Default to 70 if invalid

    if (!Number.isFinite(quickScores.overallScore)) {
      console.warn('⚠️ Invalid overallScore detected, using default value:', validatedOverallScore);
    }

    // Create contentAnalysis structure from quick scores
    const sanitizedContentAnalysis = {
      relevanceScore: Number(quickScores.relevance) || 70,
      depthScore: Number(quickScores.depth) || 70,
      structureScore: Number(quickScores.structure) || 70,
      technicalAccuracy: 0, // Not analyzed during quick scoring
      keyPointsCovered: [],
      missingPoints: [],
      strengths: [],
      weaknesses: [],
      overallFeedback: '',
      improvementTips: []
    };

    // Update question with answer and minimal analysis
    currentQuestion.userAnswer = {
      audioUrl: audioUrl || null,
      transcript,
      duration,
      recordedAt: new Date(),
      speechAnalysis: {
        confidenceScore: speechAnalysis.confidence || 75,
        clarityScore: speechAnalysis.clarity || 75,
        pacingScore: speechAnalysis.pacing || 75,
        fillerWordsCount: speechAnalysis.fillerWordCount || 0,
        hesitations: speechAnalysis.hesitationCount || 0,
        energyLevel: speechAnalysis.energy || 75,
        professionalismScore: speechAnalysis.professionalism || 75
      },
      contentAnalysis: sanitizedContentAnalysis,
      overallScore: validatedOverallScore,
      feedback: 'Answer recorded. Detailed feedback will be available in your final report.',
      improvementTips: []
    };

    currentQuestion.answered = true;

    await session.save();

    console.log('✅ Answer quick-scored and saved');

    // Check if there are more questions
    const hasMoreQuestions = session.currentQuestionIndex < session.questions.length - 1;

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      analysis: {
        overallScore: validatedOverallScore,
        speechAnalysis: currentQuestion.userAnswer.speechAnalysis,
        contentAnalysis: {
          relevanceScore: sanitizedContentAnalysis.relevanceScore,
          depthScore: sanitizedContentAnalysis.depthScore,
          structureScore: sanitizedContentAnalysis.structureScore
        },
        feedback: 'Answer recorded. Continue to next question - detailed feedback at the end!'
      },
      hasMoreQuestions,
      nextQuestionNumber: hasMoreQuestions ? session.currentQuestionIndex + 2 : null
    });

  } catch (error) {
    console.error('❌ Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

/**
 * Move to next question
 * POST /api/interview/session/:sessionId/next
 */
exports.nextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Check if current question was answered
    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion.answered) {
      return res.status(400).json({
        success: false,
        message: 'Please answer the current question before proceeding'
      });
    }

    // Move to next question
    session.currentQuestionIndex += 1;

    // Check if interview is complete
    if (session.currentQuestionIndex >= session.questions.length) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.totalDuration = Math.floor((session.completedAt - session.startedAt) / 1000);
      
      await session.save();

      // Generate final report asynchronously
      generateFinalReportAsync(session._id, {
        jobTitle: session.jobTitle,
        company: session.company,
        experienceLevel: session.experienceLevel,
        questions: session.questions,
        overallPerformance: session.overallPerformance
      });

      return res.json({
        success: true,
        message: 'Interview completed!',
        completed: true
      });
    }

    await session.save();

    // Return next question
    const nextQuestion = session.questions[session.currentQuestionIndex];

    res.json({
      success: true,
      currentQuestion: {
        questionNumber: nextQuestion.questionNumber,
        question: nextQuestion.question,
        category: nextQuestion.category,
        timeLimit: nextQuestion.timeLimit
      },
      questionsRemaining: session.questions.length - session.currentQuestionIndex
    });

  } catch (error) {
    console.error('❌ Error moving to next question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move to next question',
      error: error.message
    });
  }
};

/**
 * Generate final report asynchronously
 */
async function generateFinalReportAsync(sessionId, config) {
  try {
    console.log('📊 Generating final report for session:', sessionId);

    const report = await InterviewAIService.generateFinalReport(config);

    await InterviewSession.findByIdAndUpdate(sessionId, {
      detailedReport: report
    });

    console.log('✅ Final report generated for session:', sessionId);

  } catch (error) {
    console.error('❌ Failed to generate final report:', error);
  }
}

/**
 * Get final interview report
 * GET /api/interview/session/:sessionId/report
 */
exports.getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Check if all questions are answered (even if status isn't 'completed')
    const allAnswered = session.questions.every(q => q.answered);
    
    if (session.status !== 'completed' && !allAnswered) {
      return res.status(400).json({
        success: false,
        message: 'Interview is not completed yet'
      });
    }

    // If all questions are answered but status is 'in_progress', complete it now
    if (allAnswered && session.status === 'in_progress') {
      console.log('🔧 Auto-completing interview session:', sessionId);
      session.status = 'completed';
      session.completedAt = new Date();
      session.totalDuration = session.startedAt 
        ? Math.floor((session.completedAt - session.startedAt) / 1000)
        : 0;
      
      await session.save();

      // Trigger report generation asynchronously
      generateFinalReportAsync(session._id, {
        jobTitle: session.jobTitle,
        company: session.company,
        experienceLevel: session.experienceLevel,
        questions: session.questions,
        overallPerformance: session.overallPerformance
      });
    }

    // If detailed report is not yet generated, return status indicating it's processing
    if (!session.detailedReport) {
      console.log('⏳ Detailed report not yet generated for session:', sessionId);
      return res.json({
        success: true,
        generating: true,
        message: 'Report is being generated. Please wait...',
        session: {
          jobTitle: session.jobTitle,
          company: session.company,
          experienceLevel: session.experienceLevel,
          completedAt: session.completedAt,
          totalQuestions: session.questions.length
        }
      });
    }

    res.json({
      success: true,
      generating: false,
      session: {
        jobTitle: session.jobTitle,
        company: session.company,
        interviewType: session.interviewType,
        experienceLevel: session.experienceLevel,
        completedAt: session.completedAt,
        totalDuration: session.totalDuration,
        questionsAnswered: session.questions.filter(q => q.answered).length,
        totalQuestions: session.questions.length,
        createdAt: session.createdAt,
        overallPerformance: session.overallPerformance,
        questions: session.questions
      },
      report: session.detailedReport
    });

  } catch (error) {
    console.error('❌ Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

/**
 * Get user's interview history
 * GET /api/interview/history
 */
exports.getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user: req.user._id
    })
    .sort({ createdAt: -1 })
    .select('jobTitle company interviewType status createdAt completedAt currentQuestionIndex questions overallPerformance')
    .limit(20);

    res.json({
      success: true,
      sessions: sessions.map(s => {
        // Calculate metrics from questions
        const answeredQuestions = s.questions?.filter(q => q.answered) || [];
        const totalQuestions = s.questions?.length || 0;
        
        let avgSpeechScore = 0;
        let avgContentScore = 0;
        let overallScore = 0;
        
        if (answeredQuestions.length > 0) {
          // Calculate average speech score
          const speechScores = answeredQuestions.map(q => {
            const sa = q.userAnswer?.speechAnalysis;
            if (!sa) return 0;
            return (
              (sa.confidenceScore || 0) +
              (sa.clarityScore || 0) +
              (sa.pacingScore || 0) +
              (sa.energyLevel || 0)
            ) / 4;
          });
          avgSpeechScore = Math.round(speechScores.reduce((a, b) => a + b, 0) / answeredQuestions.length);
          
          // Calculate average content score
          const contentScores = answeredQuestions.map(q => {
            const ca = q.userAnswer?.contentAnalysis;
            if (!ca) return 0;
            return (
              (ca.relevanceScore || 0) +
              (ca.depthScore || 0) +
              (ca.structureScore || 0)
            ) / 3;
          });
          avgContentScore = Math.round(contentScores.reduce((a, b) => a + b, 0) / answeredQuestions.length);
          
          // Calculate overall score (weighted average or from answers)
          const overallScores = answeredQuestions.map(q => q.userAnswer?.overallScore || 0);
          overallScore = Math.round(overallScores.reduce((a, b) => a + b, 0) / answeredQuestions.length);
        }
        
        return {
          _id: s._id,
          id: s._id,
          jobTitle: s.jobTitle,
          company: s.company,
          interviewType: s.interviewType,
          status: s.status,
          createdAt: s.createdAt,
          completedAt: s.completedAt,
          currentQuestionIndex: s.currentQuestionIndex,
          totalQuestions: totalQuestions,
          answeredQuestions: answeredQuestions.length,
          overallScore: overallScore || s.overallPerformance?.overallScore || null,
          overallPerformance: {
            overallScore: overallScore || s.overallPerformance?.overallScore || 0,
            averageSpeechScore: avgSpeechScore,
            averageContentScore: avgContentScore
          },
          questions: s.questions // Include questions for frontend calculations if needed
        };
      })
    });

  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

/**
 * Pause interview
 * POST /api/interview/session/:sessionId/pause
 */
exports.pauseInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOneAndUpdate(
      { _id: sessionId, user: req.user._id, status: 'in_progress' },
      { status: 'paused' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found or not in progress'
      });
    }

    res.json({
      success: true,
      message: 'Interview paused'
    });

  } catch (error) {
    console.error('❌ Error pausing interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause interview',
      error: error.message
    });
  }
};

/**
 * Delete interview session
 * DELETE /api/interview/session/:sessionId
 */
exports.deleteInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate sessionId
    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      console.error('❌ Invalid sessionId received:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID provided'
      });
    }

    // Validate MongoDB ObjectId format
    if (!sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('❌ Invalid MongoDB ObjectId format:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    console.log('🗑️ Attempting to delete session:', sessionId);

    const session = await InterviewSession.findOneAndDelete({
      _id: sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    res.json({
      success: true,
      message: 'Interview session deleted'
    });

  } catch (error) {
    console.error('❌ Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};

/**
 * Generate audio for interview intro
 * POST /api/interview/audio/intro
 */
exports.generateIntroAudio = async (req, res) => {
  try {
    const { name, role } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required'
      });
    }

    const audioBuffer = await ttsService.generateInterviewIntro(name, role);

    // Set response headers for audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Error generating intro audio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate intro audio',
      error: error.message
    });
  }
};

/**
 * Generate audio for a specific question
 * POST /api/interview/audio/question
 */
exports.generateQuestionAudio = async (req, res) => {
  try {
    const { question, questionNumber, totalQuestions } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }

    // Add context if question number provided
    let context = null;
    if (questionNumber && totalQuestions) {
      context = `Question ${questionNumber} of ${totalQuestions}.`;
    }

    const audioBuffer = await ttsService.generateInterviewQuestionAudio(question, context);

    // Set response headers for audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Error generating question audio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate question audio',
      error: error.message
    });
  }
};

/**
 * Generate audio for interview completion
 * POST /api/interview/audio/completion
 */
exports.generateCompletionAudio = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const audioBuffer = await ttsService.generateInterviewCompletion(name);

    // Set response headers for audio
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Error generating completion audio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate completion audio',
      error: error.message
    });
  }
};
