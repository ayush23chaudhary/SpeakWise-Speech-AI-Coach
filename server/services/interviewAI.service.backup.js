const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class InterviewAIService {
  /**
   * Generate interview questions based on job description and context
   */
  static async generateInterviewQuestions({
    jobTitle,
    company,
    jobDescription,
    interviewType,
    experienceLevel,
    numberOfQuestions,
    difficulty
  }) {
    try {
      console.log('🎯 Generating interview questions...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `You are an expert technical recruiter and interviewer conducting a ${interviewType} interview for a ${jobTitle} position${company ? ` at ${company}` : ''}.

**Experience Level:** ${experienceLevel}
**Difficulty:** ${difficulty}

**Job Description:**
${jobDescription}

**Your Task:**
Generate exactly ${numberOfQuestions} interview questions that are:
1. Highly relevant to the job description and required skills
2. Appropriate for ${experienceLevel}-level candidates
3. ${difficulty} difficulty level
4. Mix of question types based on interview type

**Interview Type Guidelines:**
${this.getInterviewTypeGuidelines(interviewType)}

**For EACH question, provide:**
1. The question text (clear and professional)
2. Category (technical/behavioral/situational/company_specific/role_specific)
3. Difficulty (easy/medium/hard)
4. 3-5 key points an ideal answer should cover
5. Recommended time limit (in seconds)

**Output Format (JSON):**
Return a JSON array with this exact structure:
[
  {
    "question": "The interview question",
    "category": "technical|behavioral|situational|company_specific|role_specific",
    "difficulty": "easy|medium|hard",
    "expectedKeyPoints": [
      "Key point 1 to look for",
      "Key point 2 to look for",
      "Key point 3 to look for"
    ],
    "timeLimit": 180,
    "rationale": "Why this question is important for this role"
  }
]

**Important:**
- Questions should progress from easier to harder (warm-up → depth)
- For technical roles: Include coding concepts, system design, problem-solving
- For behavioral: Use STAR method scenarios
- Make questions realistic (what top companies actually ask)
- Avoid generic questions; be specific to the job description

Generate ${numberOfQuestions} questions now:`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }
      
      const questions = JSON.parse(jsonMatch[0]);
      console.log(`✅ Generated ${questions.length} questions`);
      
      return questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        expectedKeyPoints: q.expectedKeyPoints || [],
        timeLimit: q.timeLimit || 180,
        answered: false
      }));
      
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      throw new Error('Failed to generate interview questions: ' + error.message);
    }
  }

  /**
   * Analyze candidate's answer (both content and speech)
   */
  /**
   * Quick scoring for answer (minimal tokens, no detailed feedback)
   * Used during interview to avoid blocking - detailed analysis comes at the end
   */
  static async quickScoreAnswer({
    question,
    questionCategory,
    userTranscript,
    jobTitle
  }) {
    try {
      console.log('⚡ Quick scoring answer...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Minimized prompt - just scores, no detailed feedback
      const prompt = `Rate this interview answer 0-100 for a ${jobTitle} position.

Q: "${question}"
Category: ${questionCategory}

Answer: "${userTranscript}"

Return only JSON:
{
  "relevance": 85,
  "depth": 75,
  "structure": 80
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse scores');
      }
      
      const scores = JSON.parse(jsonMatch[0]);
      
      // Calculate quick overall score
      const contentScore = (
        (Number(scores.relevance) || 70) +
        (Number(scores.depth) || 70) +
        (Number(scores.structure) || 70)
      ) / 3;
      
      console.log('✅ Quick score:', Math.round(contentScore));
      
      return {
        relevance: Number(scores.relevance) || 70,
        depth: Number(scores.depth) || 70,
        structure: Number(scores.structure) || 70,
        overallScore: Math.round(contentScore)
      };
      
    } catch (error) {
      console.error('❌ Quick scoring failed:', error.message);
      // Return default scores if AI fails
      return {
        relevance: 70,
        depth: 70,
        structure: 70,
        overallScore: 70
      };
    }
  }

  /**
   * Comprehensive analysis of ALL answers at the end of interview
   * Provides detailed feedback with actionable "say this instead" suggestions
   */
  static async analyzeAnswer({
    question,
    questionCategory,
    expectedKeyPoints,
    userTranscript,
    speechAnalysis,
    jobTitle,
    experienceLevel
  }) {
    try {
      console.log('🔍 Analyzing answer...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `You are an expert interviewer evaluating a candidate's answer for a ${jobTitle} position (${experienceLevel} level).

**Question Asked:**
"${question}"

**Question Category:** ${questionCategory}

**Expected Key Points (what a strong answer should include):**
${expectedKeyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

**Candidate's Answer (transcript):**
"${userTranscript}"

**Speech Performance (already analyzed):**
- Confidence: ${speechAnalysis.confidenceScore}%
- Clarity: ${speechAnalysis.clarityScore}%
- Pacing: ${speechAnalysis.pacingScore}%
- Filler Words: ${speechAnalysis.fillerWordsCount}
- Hesitations: ${speechAnalysis.hesitations}
- Energy: ${speechAnalysis.energyLevel}%

**Your Task:**
Evaluate the CONTENT of this answer (not the speech delivery). Provide:

1. **Relevance Score (0-100):** How well does the answer address the question?
2. **Depth Score (0-100):** How detailed and insightful is the answer?
3. **Structure Score (0-100):** Is the answer well-organized (STAR method for behavioral, logical flow for technical)?
4. **Technical Accuracy (0-100):** For technical questions, how accurate are the concepts? (N/A for behavioral)
5. **Key Points Covered:** List which expected key points were mentioned
6. **Missing Points:** What important aspects did they NOT mention?
7. **Strengths:** 2-3 specific strengths in their answer content
8. **Weaknesses:** 2-3 specific weaknesses or gaps
9. **Overall Feedback:** 2-3 sentences on content quality
10. **Improvement Tips:** 3 specific actionable tips to improve this answer

**Evaluation Criteria:**
- For technical questions: Correctness, depth of understanding, real-world application
- For behavioral questions: STAR structure, specific examples, learning/growth mindset
- For situational questions: Problem-solving approach, reasoning, consideration of tradeoffs

**Output Format (JSON):**
{
  "relevanceScore": 85,
  "depthScore": 75,
  "structureScore": 80,
  "technicalAccuracy": 90,
  "keyPointsCovered": ["point 1", "point 2"],
  "missingPoints": ["point 3", "point 4"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "overallFeedback": "2-3 sentences here",
  "improvementTips": ["tip 1", "tip 2", "tip 3"]
}

Analyze now:`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize scores from AI
      const relevanceScore = Number(analysis.relevanceScore) || 70;
      const depthScore = Number(analysis.depthScore) || 70;
      const structureScore = Number(analysis.structureScore) || 70;
      const technicalAccuracy = Number(analysis.technicalAccuracy) || 0;
      
      console.log('📊 Parsed scores:', { relevanceScore, depthScore, structureScore, technicalAccuracy });
      
      // Calculate overall score for this answer (60% content + 40% speech)
      const contentScore = technicalAccuracy > 0
        ? (relevanceScore + depthScore + structureScore + technicalAccuracy) / 4
        : (relevanceScore + depthScore + structureScore) / 3;
      
      const speechScore = (
        (Number(speechAnalysis.confidenceScore) || 75) +
        (Number(speechAnalysis.clarityScore) || 75) +
        (Number(speechAnalysis.pacingScore) || 75) +
        (Number(speechAnalysis.energyLevel) || 75)
      ) / 4;
      
      const overallScore = (contentScore * 0.6) + (speechScore * 0.4);
      
      console.log('✅ Answer analyzed:', { contentScore, speechScore, overallScore });
      
      // Ensure overallScore is valid
      if (!Number.isFinite(overallScore)) {
        console.error('❌ Invalid overall score calculated, using default');
        return {
          contentAnalysis: analysis,
          overallScore: 70,
          feedback: this.generateCombinedFeedback(analysis, speechAnalysis, 70)
        };
      }
      
      return {
        contentAnalysis: analysis,
        overallScore: Math.round(overallScore),
        feedback: this.generateCombinedFeedback(analysis, speechAnalysis, overallScore)
      };
      
    } catch (error) {
      console.error('❌ Error analyzing answer:', error);
      throw new Error('Failed to analyze answer: ' + error.message);
    }
  }

  /**
   * Generate comprehensive final interview report with actionable "Say this instead" suggestions
   */
  static async generateFinalReport({
    jobTitle,
    company,
    experienceLevel,
    questions,
    overallPerformance
  }) {
    try {
      console.log('📊 Generating comprehensive final interview report...');
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // Prepare detailed question analysis with actual answers
      const questionDetails = questions
        .filter(q => q.answered)
        .map((q, idx) => ({
          number: idx + 1,
          question: q.question,
          category: q.category,
          userAnswer: q.userAnswer.transcript || 'No transcript available',
          score: q.userAnswer.overallScore,
          keyPointsCovered: q.userAnswer.contentAnalysis.keyPointsCovered || [],
          missingPoints: q.userAnswer.contentAnalysis.missingPoints || []
        }));
      
      const prompt = `You are a senior hiring manager reviewing a COMPLETE interview for a ${jobTitle} position${company ? ` at ${company}` : ''} (${experienceLevel} level).

**Overall Performance Metrics:**
- Overall Score: ${overallPerformance.overallScore.toFixed(1)}/100
- Speech Performance: ${((overallPerformance.averageConfidence + overallPerformance.averageClarity + overallPerformance.averagePacing + overallPerformance.averageEnergy) / 4).toFixed(1)}/100
- Content Performance: ${((overallPerformance.averageRelevance + overallPerformance.averageDepth + overallPerformance.averageStructure) / 3).toFixed(1)}/100
- Hiring Recommendation: ${overallPerformance.hiringRecommendation}

**COMPLETE INTERVIEW TRANSCRIPT:**

${questionDetails.map(q => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 QUESTION ${q.number} [${q.category}] - Score: ${q.score}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Question:** "${q.question}"

**What They Said:**
"${q.userAnswer}"

**What They Covered:** ${q.keyPointsCovered.length > 0 ? q.keyPointsCovered.join(', ') : 'None'}
**What They Missed:** ${q.missingPoints.length > 0 ? q.missingPoints.join(', ') : 'None'}

`).join('\n')}

**YOUR TASK - Generate Comprehensive Final Report:**

Analyze ALL ${questionDetails.length} answers together and create an executive-level report with ACTIONABLE feedback.

**CRITICAL: For weak answers (score < 75), provide "Say This Instead" examples.**

Output this EXACT JSON structure:

{
  "executiveSummary": "3-4 sentences. Overall impression as hiring manager. Would you advance them? Why/why not? Be honest but constructive.",
  
  "strengthsAnalysis": "• Bullet 1: Specific strength with example from their answers\\n• Bullet 2: Another strength with evidence\\n• Bullet 3: Third strength\\n• Bullet 4: Fourth strength\\n• Bullet 5: Fifth strength",
  
  "weaknessesAnalysis": "• Bullet 1: Specific weakness with example\\n• Bullet 2: Gap in knowledge or communication\\n• Bullet 3: Third area needing improvement\\n• Bullet 4: Fourth weakness\\n• Bullet 5: Fifth area to develop",
  
  "comparisonToExpectations": "2-3 sentences. Are they at the right level for ${experienceLevel}? Above, at, or below expected performance? Be specific.",
  
  "questionByQuestionFeedback": [
    {
      "questionNumber": 1,
      "question": "The exact question asked",
      "score": 85,
      "whatTheyDid": "What worked in their answer - specific praise",
      "whatToImprove": "What needs improvement",
      "sayThisInstead": "ONLY include this field if score < 75. Provide the EXACT improved answer they should have given (2-3 sentences). Show them what excellent sounds like. If score >= 75, set this to null."
    }
  ],
  
  "actionableSteps": [
    "1. Specific action: Study X topic by reading Y resource, focus on Z concepts",
    "2. Practice X type of questions using STAR method, record yourself",
    "3. Research company's tech stack: learn about X, Y, Z technologies",
    "4. Improve communication: pause before answering, structure with 'First..., Second..., Finally...'",
    "5. Build confidence: practice 10 behavioral questions daily for 2 weeks"
  ],
  
  "resourceRecommendations": [
    "Book: 'Cracking the Coding Interview' - Chapter 7 (Technical Questions)",
    "Course: LinkedIn Learning 'Ace Your Interview' - Focus on behavioral section",
    "Practice: LeetCode Easy problems - 3 per day for 2 weeks",
    "Website: Glassdoor company reviews - Research ${company || 'target company'} interview experiences"
  ],
  
  "practiceAreas": [
    "${questionDetails[0]?.category || 'Technical'} questions - you scored ${questionDetails[0]?.score || 0}, need to reach 85+",
    "STAR method for behavioral questions - structure your stories better",
    "Company research - demonstrate knowledge of their products/culture"
  ]
}

**FORMATTING RULES:**
1. Use \\n for line breaks in multi-line strings
2. Use • for bullet points
3. Keep "sayThisInstead" SHORT (2-3 sentences max)
4. Be SPECIFIC in action items (not "practice more" but "practice 10 STAR questions daily")
5. Only include "sayThisInstead" when score < 75

Generate the comprehensive report now:`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from AI response');
      }
      
      const report = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure structure
      report.questionByQuestionFeedback = report.questionByQuestionFeedback || [];
      report.actionableSteps = report.actionableSteps || [];
      report.resourceRecommendations = report.resourceRecommendations || [];
      report.practiceAreas = report.practiceAreas || [];
      
      console.log('✅ Comprehensive final report generated with actionable suggestions');
      
      return report;
      
    } catch (error) {
      console.error('❌ Error generating final report:', error);
      throw new Error('Failed to generate final report: ' + error.message);
    }
  }

  /**
   * Generate follow-up question based on user's answer
   */
  static async generateFollowUpQuestion({
    originalQuestion,
    userAnswer,
    questionCategory
  }) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Original Question: "${originalQuestion}"

Candidate's Answer: "${userAnswer}"

Generate ONE insightful follow-up question that:
1. Probes deeper into their answer
2. Tests understanding or asks for clarification
3. Is realistic (what a real interviewer would ask)
4. Category: ${questionCategory}

Return ONLY the follow-up question text (no JSON, no explanation):`;

      const result = await model.generateContent(prompt);
      const followUpQuestion = result.response.text().trim().replace(/^["']|["']$/g, '');
      
      return followUpQuestion;
      
    } catch (error) {
      console.error('❌ Error generating follow-up:', error);
      return null;
    }
  }

  // Helper methods
  
  static getInterviewTypeGuidelines(type) {
    const guidelines = {
      'technical_coding': 'Focus on algorithms, data structures, coding patterns, complexity analysis, debugging skills',
      'technical_system_design': 'Focus on scalability, architecture decisions, tradeoffs, system components, real-world constraints',
      'behavioral': 'Use STAR method scenarios - past experiences, conflict resolution, teamwork, leadership, growth mindset',
      'case_study': 'Business problems, analytical thinking, structured problem-solving, quantitative reasoning',
      'product_management': 'Product strategy, user research, prioritization, metrics, stakeholder management',
      'data_science': 'ML algorithms, statistics, data pipelines, experimentation, business impact',
      'marketing': 'Campaign strategy, metrics, customer acquisition, brand positioning, market analysis',
      'sales': 'Sales methodology, objection handling, pipeline management, relationship building',
      'general': 'Mix of behavioral (50%), role-specific (30%), company fit (20%)',
      'mixed': 'Balanced mix: 40% technical, 40% behavioral, 20% situational'
    };
    
    return guidelines[type] || guidelines['general'];
  }
  
  static generateCombinedFeedback(contentAnalysis, speechAnalysis, overallScore) {
    let feedback = `**Overall Score: ${overallScore}/100**\n\n`;
    
    // Content feedback
    feedback += `**Content Quality:**\n${contentAnalysis.overallFeedback}\n\n`;
    
    // Speech feedback
    feedback += `**Delivery & Communication:**\n`;
    if (speechAnalysis.confidenceScore < 60) {
      feedback += `• Your confidence came across as low (${speechAnalysis.confidenceScore}%) - practice power posing and vocal projection.\n`;
    } else if (speechAnalysis.confidenceScore > 80) {
      feedback += `• Excellent confidence (${speechAnalysis.confidenceScore}%) - you sound self-assured.\n`;
    }
    
    if (speechAnalysis.fillerWordsCount > 10) {
      feedback += `• Too many filler words (${speechAnalysis.fillerWordsCount}) - practice pausing instead of "um"/"uh".\n`;
    }
    
    if (speechAnalysis.pacingScore < 60) {
      feedback += `• Pacing needs work (${speechAnalysis.pacingScore}%) - either too fast or too slow.\n`;
    }
    
    return feedback;
  }
}

module.exports = InterviewAIService;
