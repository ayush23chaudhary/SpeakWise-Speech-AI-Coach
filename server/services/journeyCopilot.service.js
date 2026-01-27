const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class JourneyCopilotService {
  /**
   * Generate personalized next task based on user's journey
   */
  static async generateNextTask({
    userId,
    currentLevel,
    userGoal,
    weaknesses,
    lastPerformance
  }) {
    try {
      console.log('🤖 Journey Copilot generating next task...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Use cheaper model for simple tasks
      
      // Map user goals to context
      const goalContext = {
        'interviews_evaluations': 'interview preparation - low pause tolerance, high uncertainty sensitivity',
        'presentations_pitches': 'presentation skills - energy-focused, engagement-critical',
        'everyday_conversations': 'daily conversation - natural flow, confidence building',
        'confidence_pressure': 'confidence under pressure - stress management, composure'
      };

      const prompt = `You are SpeakWise AI Copilot - a personalized speech coach.

**User Profile:**
- Goal: ${goalContext[userGoal] || 'general improvement'}
- Current Level: ${currentLevel} (1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert)
- Known Weaknesses: ${weaknesses.join(', ') || 'None identified yet'}

**Recent Performance:**
${lastPerformance ? `
- Fluency Score: ${lastPerformance.fluency}/100
- Confidence Score: ${lastPerformance.confidence}/100
- Filler Word Count: ${lastPerformance.fillerCount}
- Clarity Score: ${lastPerformance.clarity}/100
` : 'No recent data - this is their first task'}

**Your Task:**
Based on their level and weakness, recommend ONE specific practice task.

**Level Guidelines:**
- Level 1 (Foundation): Focus on pronunciation, slow speaking, simple sentences
- Level 2 (Clarity): Reduce fillers, improve flow, add strategic pauses
- Level 3 (Confidence): Storytelling, organization, vocal power
- Level 4 (Goal-Specific): Tailored to their goal (interview/presentation/conversation)

**Task Types:**
- "record": Free-form recording with topic
- "challenge": Timed challenge with constraints (e.g., no filler words)
- "exercise": Structured practice (e.g., STAR method, sentence restructuring)
- "interview": Mock interview question
- "presentation": Present on a topic

**Output JSON Format:**
{
  "taskType": "record|challenge|exercise|interview|presentation",
  "title": "Short task name",
  "description": "Clear instruction (1 sentence)",
  "topic": "Specific topic or question",
  "duration": 30,
  "focusArea": "confidence|fluency|clarity|fillers|pacing",
  "recommendation": "2 sentences: Why this task helps them specifically",
  "successCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"]
}

**Examples:**

Level 1, No data:
{
  "taskType": "record",
  "title": "Introduce Yourself",
  "description": "Record a 30-second self-introduction speaking slowly and clearly",
  "topic": "Tell me about yourself - your name, what you do, and one hobby",
  "duration": 30,
  "focusArea": "clarity",
  "recommendation": "Starting with self-introduction helps me understand your baseline speaking style. Focus on speaking slowly - it's better to finish early than rush.",
  "successCriteria": ["Speak at 120-140 WPM (slower pace)", "Clear pronunciation", "Complete sentences"]
}

Level 2, High filler count (12):
{
  "taskType": "challenge",
  "title": "Filler-Free Challenge",
  "description": "Describe your favorite place for 45 seconds without saying 'um', 'uh', or 'like'",
  "topic": "Describe a place you love visiting and why it's special to you",
  "duration": 45,
  "focusArea": "fillers",
  "recommendation": "You used 12 filler words last time. This challenge trains you to pause silently instead of filling gaps. It's OK to pause - silence is better than 'um'.",
  "successCriteria": ["Zero filler words (um, uh, like)", "Use silent pauses instead", "Maintain topic for full 45 seconds"]
}

Level 3, Interview goal, Low confidence (58):
{
  "taskType": "interview",
  "title": "Behavioral Question Practice",
  "description": "Answer this common interview question using the STAR method",
  "topic": "Tell me about a time you overcame a difficult challenge at work",
  "duration": 120,
  "focusArea": "confidence",
  "recommendation": "Your confidence score was 58 last time. Practicing structured answers (STAR: Situation, Task, Action, Result) boosts confidence by giving you a framework. Aim for steady vocal tone.",
  "successCriteria": ["Use STAR structure clearly", "Confidence score > 70", "No hesitations over 3 seconds"]
}

Generate the next task NOW (JSON only):`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse copilot response');
      }
      
      const task = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Copilot task generated:', task.title);
      
      return {
        ...task,
        generatedAt: new Date(),
        level: currentLevel
      };
      
    } catch (error) {
      console.error('❌ Copilot task generation failed:', error.message);
      
      // Fallback to rule-based task
      return this.generateFallbackTask(currentLevel, userGoal, weaknesses);
    }
  }

  /**
   * Fallback rule-based task generation if AI fails
   */
  static generateFallbackTask(level, goal, weaknesses) {
    const tasks = {
      1: {
        taskType: 'record',
        title: 'Introduce Yourself',
        description: 'Record a 30-second self-introduction',
        topic: 'Tell me about yourself',
        duration: 30,
        focusArea: 'clarity',
        recommendation: 'Start with basics - introduce yourself clearly and slowly.',
        successCriteria: ['Clear pronunciation', 'Complete sentences', 'Natural pacing']
      },
      2: {
        taskType: 'challenge',
        title: 'Speak Without Fillers',
        description: 'Talk for 60 seconds without using filler words',
        topic: 'Describe your typical day',
        duration: 60,
        focusArea: 'fillers',
        recommendation: 'Focus on eliminating filler words to sound more professional.',
        successCriteria: ['Zero filler words', 'Smooth flow', 'Complete thoughts']
      },
      3: {
        taskType: 'exercise',
        title: 'Tell a Story',
        description: 'Share a 2-minute story with clear structure',
        topic: 'Tell me about your proudest achievement',
        duration: 120,
        focusArea: 'confidence',
        recommendation: 'Build confidence through structured storytelling.',
        successCriteria: ['Clear beginning, middle, end', 'Confident tone', 'Engaging delivery']
      },
      4: {
        taskType: 'interview',
        title: 'Mock Interview Question',
        description: 'Answer a job interview question',
        topic: 'Why should we hire you?',
        duration: 90,
        focusArea: 'confidence',
        recommendation: 'Practice real interview scenarios to master your goal.',
        successCriteria: ['Structured answer', 'Specific examples', 'Strong closing']
      }
    };

    return tasks[level] || tasks[1];
  }

  /**
   * Evaluate task completion and update level
   */
  static async evaluateTaskCompletion({
    taskId,
    userPerformance,
    currentLevel
  }) {
    try {
      // Check if success criteria met
      const criteriaScore = this.calculateCriteriaScore(userPerformance);
      
      // Progression logic
      let newLevel = currentLevel;
      let levelUp = false;
      
      if (criteriaScore >= 80 && userPerformance.taskCount >= 3) {
        newLevel = Math.min(currentLevel + 1, 4);
        levelUp = newLevel > currentLevel;
      }
      
      return {
        success: criteriaScore >= 70,
        score: criteriaScore,
        levelUp,
        newLevel,
        feedback: this.generateFeedback(userPerformance, criteriaScore)
      };
      
    } catch (error) {
      console.error('Error evaluating task:', error);
      return {
        success: false,
        score: 0,
        levelUp: false,
        newLevel: currentLevel,
        feedback: 'Could not evaluate performance'
      };
    }
  }

  static calculateCriteriaScore(performance) {
    // Weighted scoring based on multiple factors
    const weights = {
      fluency: 0.25,
      confidence: 0.25,
      clarity: 0.25,
      fillers: 0.25
    };

    let score = 0;
    score += (performance.fluency || 70) * weights.fluency;
    score += (performance.confidence || 70) * weights.confidence;
    score += (performance.clarity || 70) * weights.clarity;
    
    // Filler penalty
    const fillerScore = Math.max(0, 100 - (performance.fillerCount || 0) * 5);
    score += fillerScore * weights.fillers;
    
    return Math.round(score);
  }

  static generateFeedback(performance, score) {
    if (score >= 85) {
      return 'Excellent work! You\'re ready for more challenging tasks.';
    } else if (score >= 70) {
      return 'Good progress! Keep practicing to solidify these skills.';
    } else if (score >= 60) {
      return 'You\'re improving! Focus on the specific areas highlighted.';
    } else {
      return 'Keep practicing! Consistency is key to improvement.';
    }
  }
}

module.exports = JourneyCopilotService;
