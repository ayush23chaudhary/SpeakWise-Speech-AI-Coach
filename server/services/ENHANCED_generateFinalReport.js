/**
 * ENHANCED VERSION - Generate comprehensive final interview report
 * 
 * This is the enhanced version with 12+ new features:
 * - Hiring Decision with confidence
 * - Red Flags & Green Flags
 * - Performance Trajectory
 * - Category Analysis
 * - Benchmarking vs peers
 * - Follow-up questions
 * - Culture fit analysis
 * - Time management insights
 * - 30/60/90 day roadmap
 * - Salary negotiation readiness
 * - Missed opportunities
 * - Next steps
 * 
 * To integrate: Replace the existing generateFinalReport function in
 * server/services/interviewAI.service.js with this enhanced version
 */

static async generateFinalReport({
  jobTitle,
  company,
  experienceLevel,
  questions,
  overallPerformance
}) {
  try {
    console.log('📊 Generating ENHANCED comprehensive final interview report...');
    
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
        duration: q.userAnswer.duration || 0,
        keyPointsCovered: q.userAnswer.contentAnalysis.keyPointsCovered || [],
        missingPoints: q.userAnswer.contentAnalysis.missingPoints || []
      }));

    // Calculate category breakdown
    const categoryStats = {};
    questionDetails.forEach(q => {
      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { scores: [], count: 0 };
      }
      categoryStats[q.category].scores.push(q.score);
      categoryStats[q.category].count++;
    });

    const categoryBreakdown = Object.keys(categoryStats).map(cat => {
      const avg = categoryStats[cat].scores.reduce((a, b) => a + b, 0) / categoryStats[cat].count;
      return `${cat}: ${avg.toFixed(1)}/100 (${categoryStats[cat].count} questions)`;
    }).join(', ');
    
    // Calculate average duration
    const avgDuration = questionDetails.reduce((sum, q) => sum + q.duration, 0) / questionDetails.length;
    
    const prompt = `You are a **SENIOR HIRING MANAGER & INTERVIEW COACH** reviewing a COMPLETE interview for a ${jobTitle} position${company ? ` at ${company}` : ''} (${experienceLevel} level).

**Overall Performance Metrics:**
- Overall Score: ${overallPerformance.overallScore.toFixed(1)}/100
- Speech Performance: ${((overallPerformance.averageConfidence + overallPerformance.averageClarity + overallPerformance.averagePacing + overallPerformance.averageEnergy) / 4).toFixed(1)}/100
- Content Performance: ${((overallPerformance.averageRelevance + overallPerformance.averageDepth + overallPerformance.averageStructure) / 3).toFixed(1)}/100
- Hiring Recommendation: ${overallPerformance.hiringRecommendation}
- Category Breakdown: ${categoryBreakdown}
- Average Answer Duration: ${avgDuration.toFixed(0)} seconds

**COMPLETE INTERVIEW TRANSCRIPT:**

${questionDetails.map(q => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 QUESTION ${q.number} [${q.category}] - Score: ${q.score}/100 | Duration: ${q.duration}s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Question:** "${q.question}"

**What They Said:**
"${q.userAnswer}"

**What They Covered:** ${q.keyPointsCovered.length > 0 ? q.keyPointsCovered.join(', ') : 'None'}
**What They Missed:** ${q.missingPoints.length > 0 ? q.missingPoints.join(', ') : 'None'}

`).join('\n')}

**YOUR TASK - Generate COMPREHENSIVE Final Report with DEEP INSIGHTS:**

Analyze ALL ${questionDetails.length} answers together and create an executive-level report that goes BEYOND surface-level feedback.

**CRITICAL REQUIREMENTS:**
1. For weak answers (score < 75): Provide "Say This Instead" with EXACT improved answer (3-4 sentences)
2. Identify RED FLAGS (deal-breakers) and GREEN FLAGS (stand-out positives)
3. Show performance trajectory (did they improve/decline over the interview?)
4. Benchmark against typical ${experienceLevel} ${jobTitle} candidates
5. Provide category-specific analysis (breakdown by question type)
6. Include realistic follow-up questions a hiring manager would ask
7. Give company-specific culture fit insights${company ? ` for ${company}` : ''}
8. Create 30/60/90 day improvement roadmap with weekly milestones
9. Assess salary negotiation readiness based on performance
10. Be BRUTALLY HONEST but CONSTRUCTIVE - this is for their growth

Output this EXACT JSON structure:

{
  "executiveSummary": "4-5 sentences. Overall impression as hiring manager. Would you advance them to next round? Why/why not? What's your confidence level in this assessment (High/Medium/Low)? Be honest but constructive. End with one sentence on their biggest opportunity for improvement.",
  
  "hiringDecision": {
    "recommendation": "Strong Hire | Hire | Maybe | No Hire | Strong No",
    "confidence": "High | Medium | Low",
    "reasoning": "2-3 sentences explaining the decision logic based on specific evidence from their answers"
  },
  
  "strengthsAnalysis": "• Bullet 1: Specific strength with EXACT quote or example from their answers\\n• Bullet 2: Another strength with evidence showing impact or skill\\n• Bullet 3: Unique quality or approach they demonstrated\\n• Bullet 4: Communication style strength with specific observation\\n• Bullet 5: Problem-solving, leadership, or technical quality that stood out",
  
  "weaknessesAnalysis": "• Bullet 1: Critical gap with specific example from their answer showing the issue\\n• Bullet 2: Communication weakness with quote demonstrating the problem\\n• Bullet 3: Knowledge gap in specific technical/domain area\\n• Bullet 4: Structural or methodology weakness in how they approach problems\\n• Bullet 5: Soft skill area needing development with observable evidence",
  
  "redFlags": [
    "🚩 Red Flag 1: Critical issue that would seriously concern hiring managers - be specific with examples",
    "🚩 Red Flag 2: Another major concern or deal-breaker pattern observed"
  ],
  
  "greenFlags": [
    "🟢 Green Flag 1: Stand-out positive that genuinely impressed you - what top 10% candidates do",
    "🟢 Green Flag 2: Exceptional quality that sets them apart from typical candidates",
    "🟢 Green Flag 3: Unique strength or insight that would make a hiring manager excited"
  ],
  
  "performanceTrajectory": {
    "trend": "Improving | Consistent | Declining | Uneven",
    "analysis": "3-4 sentences. Did they warm up as interview progressed? Show fatigue? Excel in certain categories but struggle in others? What does the pattern reveal about their interview readiness or knowledge gaps?",
    "bestQuestion": ${questionDetails.reduce((max, q) => q.score > max.score ? q : max).number},
    "worstQuestion": ${questionDetails.reduce((min, q) => q.score < min.score ? q : min).number},
    "scoreRange": "From ${Math.min(...questionDetails.map(q => q.score))} to ${Math.max(...questionDetails.map(q => q.score))} - ${Math.max(...questionDetails.map(q => q.score)) - Math.min(...questionDetails.map(q => q.score))} point variation"
  },
  
  "categoryAnalysis": {
    ${Object.keys(categoryStats).map(cat => {
      const avg = categoryStats[cat].scores.reduce((a,b) => a+b, 0) / categoryStats[cat].count;
      return `"${cat}": {
      "averageScore": ${avg.toFixed(1)},
      "assessment": "${avg >= 80 ? 'Strong' : avg >= 70 ? 'Adequate' : 'Weak'}",
      "specificFeedback": "2-3 sentences on what they did well/poorly in ${cat} questions and why"
    }`;
    }).join(',\n    ')}
  },
  
  "benchmarkComparison": {
    "percentile": "Top 10% | Top 25% | Average (50%) | Below Average (30%) | Bottom 25%",
    "comparedTo": "Typical ${experienceLevel} ${jobTitle} candidates at ${company || 'top tech companies'}",
    "standoutQualities": "What specifically makes them better OR worse than their peer group",
    "gapAnalysis": "What do top 10% performers do differently that this candidate doesn't? Be specific with examples."
  },
  
  "comparisonToExpectations": "3-4 sentences. Are they performing at the right level for ${experienceLevel}? Should they be targeting more junior roles or ready for senior? Specific examples from their answers supporting this assessment. What's the gap between current level and where they think they are?",
  
  "questionByQuestionFeedback": [
    {
      "questionNumber": 1,
      "question": "The exact question asked",
      "category": "Behavioral | Technical | Situational | etc",
      "score": 85,
      "duration": 45,
      "whatTheyDidWell": "Specific things they did right - reference exact quotes or approaches",
      "whatToImprove": "Specific improvements needed - be actionable",
      "missedOpportunities": "What would a top performer have included? What did they gloss over that should have been detailed?",
      "sayThisInstead": "ONLY if score < 75. Provide EXACT improved answer (3-4 sentences) showing what excellent looks like. Include structure (STAR method), specific metrics, and business impact. Set to null if score >= 75.",
      "followUpQuestion": "Realistic question the hiring manager would ask next based on their answer - especially probing weak points or vague claims"
    }
  ],
  
  "likelyFollowUpQuestions": [
    "Question 1: Probing deeper on the weakest area - explain WHY the interviewer would ask this",
    "Question 2: Validating a claim that seemed questionable - what are they trying to confirm?",
    "Question 3: Testing knowledge in an area they glossed over - what gap are they checking?"
  ],
  
  "cultureFitAnalysis": {
    "assessment": "Strong Fit | Good Fit | Uncertain | Poor Fit",
    "reasoning": "Based on their communication style (direct/diplomatic), values expressed (results/process), problem-solving approach (independent/collaborative), how well do they align with ${company || 'typical tech company'} culture? 2-3 sentences with specific observations.",
    "concerns": "Any cultural misalignment red flags or areas where they might clash with team dynamics"
  },
  
  "timeManagementInsights": {
    "averageDuration": ${avgDuration.toFixed(0)},
    "assessment": "${avgDuration > 120 ? 'Too Long' : avgDuration < 30 ? 'Too Brief' : 'Good'}",
    "feedback": "Your answers averaged ${avgDuration.toFixed(0)} seconds. ${avgDuration > 90 ? 'This is too long - aim for 60-90 seconds. Practice being more concise.' : avgDuration < 45 ? 'This is too brief - add more specific examples and details. Aim for 60-90 seconds.' : 'Good pacing - you balanced depth with conciseness.'}"
  },
  
  "actionableSteps": [
    "1. IMMEDIATE (This Week): Very specific action with exact resource - e.g., 'Watch YouTube: Mock Interview - ${jobTitle} at Google (channel: TechInterviewPro), then practice answering those 5 questions and record yourself'",
    "2. SHORT-TERM (Week 2-3): Build specific skill - e.g., 'Complete 15 LeetCode Easy problems on arrays/strings. Document your approach for each. Target: 85% success rate'",
    "3. MID-TERM (Month 1): Deeper study - e.g., 'Read Chapters 3-7 of Cracking the Coding Interview focusing on [specific weak area]. Create a 1-page cheat sheet for each chapter'",
    "4. ONGOING: Daily habit - e.g., 'Every morning: Record yourself answering one ${categoryStats[Object.keys(categoryStats)[0]] ? Object.keys(categoryStats)[0] : 'behavioral'} question. Watch playback, eliminate filler words, track progress'",
    "5. BEFORE NEXT INTERVIEW: Critical prep - e.g., 'Research ${company || 'target company'} recent product launches, challenges, culture. Prepare 3 thoughtful questions about [specific aspect]'"
  ],
  
  "resourceRecommendations": [
    "Book: 'Cracking the Coding Interview' by Gayle McDowell - Chapters [specific chapters matching their gaps], focus on [specific concepts]",
    "Course: LinkedIn Learning '${experienceLevel} Interview Mastery' - Modules [2, 4, 7] directly address your [specific weakness]",
    "Practice: LeetCode/HackerRank - Do [X] problems per day for [Y] weeks, focus on [specific problem types]",
    "Tool: Pramp.com or InterviewBit - Schedule 3 mock interviews focusing on [weak category], record and review",
    "Website: ${company ? company + ' Engineering Blog' : 'Tech company blogs'} - Read 5 recent posts to understand their tech stack and challenges"
  ],
  
  "practiceAreas": [
    "${Object.keys(categoryStats)[0] || 'Technical'} questions - scored ${categoryStats[Object.keys(categoryStats)[0]]?.scores.reduce((a,b) => a+b, 0) / (categoryStats[Object.keys(categoryStats)[0]]?.count || 1)}/100, target 85+ by practicing [specific type of questions]",
    "Answer structure - ${avgDuration > 90 ? 'Too long-winded, practice 60-90 second responses' : avgDuration < 45 ? 'Too brief, add more specific examples with metrics' : 'Good pacing, maintain it'}",
    "Specificity - ${questionDetails.filter(q => q.keyPointsCovered.length < 2).length > 0 ? 'Use more concrete examples with numbers/metrics instead of vague descriptions' : 'Continue using specific examples'}",
    "Business impact - Always connect technical work to business outcomes (revenue, efficiency, user experience)",
    "Follow-up readiness - Practice deep-dive questions on your claimed experiences to handle probing"
  ],
  
  "improvementRoadmap": {
    "week1to2": [
      "Daily: Answer 1 practice question, record yourself, watch playback, eliminate filler words",
      "Study: Read/watch [specific resource] on your weakest category - take notes, create examples"
    ],
    "week3to4": [
      "Daily: Continue recordings but increase to 2 questions per day",
      "Practice: Do [X] exercises on [specific skill], track success rate, aim for 80%+",
      "Mock: Schedule 1 full mock interview with peer or platform"
    ],
    "month2to3": [
      "Weekly: 2 full-length mock interviews recording and reviewing",
      "Study: Deep dive into ${company || 'target company'} tech stack, products, challenges",
      "Refine: Based on mock feedback, iterate on weakest areas"
    ],
    "readyForNextInterview": "After ${overallPerformance.overallScore < 60 ? '8-12' : overallPerformance.overallScore < 75 ? '4-6' : '2-3'} weeks of consistent practice (1-2 hours daily) focusing on [key weak areas]. Re-take SpeakWise interview to validate improvement before applying."
  },
  
  "salaryNegotiationReadiness": {
    "level": "${overallPerformance.overallScore >= 80 ? 'Strong' : overallPerformance.overallScore >= 70 ? 'Moderate' : 'Weak'}",
    "reasoning": "Based on your ${overallPerformance.overallScore}/100 performance, you ${overallPerformance.overallScore >= 80 ? 'can confidently' : overallPerformance.overallScore >= 70 ? 'should moderately' : 'should NOT aggressively'} negotiate salary because ${overallPerformance.overallScore >= 80 ? 'your performance clearly demonstrates value above typical candidates' : overallPerformance.overallScore >= 70 ? 'you showed solid competence but not standout excellence' : 'there are significant gaps that weaken your negotiating position'}. ${overallPerformance.overallScore >= 80 ? 'Aim for 10-15% above initial offer.' : overallPerformance.overallScore >= 70 ? 'You can ask for 5-8% above initial offer.' : 'Accept first reasonable offer, focus on getting the job and proving yourself.'}",
    "recommendation": "${overallPerformance.overallScore >= 80 ? 'Negotiate aggressively' : overallPerformance.overallScore >= 70 ? 'Be moderately flexible' : 'Accept first reasonable offer'}"
  },
  
  "nextSteps": [
    "1. Review this entire report carefully - spend 30-45 minutes taking detailed notes on each section",
    "2. Start TODAY with 'Immediate' action item from Actionable Steps - don't delay",
    "3. Schedule practice blocks - commit to ${overallPerformance.overallScore < 70 ? '2 hours daily' : overallPerformance.overallScore < 80 ? '1 hour daily' : '30 min daily'} for next ${overallPerformance.overallScore < 70 ? '8' : overallPerformance.overallScore < 80 ? '4' : '2'} weeks",
    "4. Set calendar reminder to re-take SpeakWise interview in [${overallPerformance.overallScore < 70 ? '8' : overallPerformance.overallScore < 80 ? '4' : '2'} weeks] to measure improvement",
    "5. Apply to roles where your GREEN FLAGS shine - focus on companies valuing [your standout strength]"
  ]
}

**FORMATTING RULES:**
1. Use \\n for line breaks in multi-line strings
2. Use • for bullet points in strengths/weaknesses
3. Use 🚩 for red flags and 🟢 for green flags
4. Be BRUTALLY HONEST but CONSTRUCTIVE - this is for their improvement, not to hurt feelings
5. Include SPECIFIC QUOTES from their answers to support claims (put in "quotes")
6. "sayThisInstead" should be 3-4 sentences showing EXACT improved answer with STAR structure and metrics
7. All arrays must have at least 2 items (redFlags can have 0-1 if they're excellent, but typically 1-2)
8. Numbers should be specific (e.g., "60-90 seconds" not "shorter", "15 problems" not "some")
9. Percentiles and benchmarks should reflect realistic distributions
10. Follow-up questions should be realistic things actual interviewers ask

Generate the ULTRA-COMPREHENSIVE report now:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }
    
    const report = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure structure with defaults
    report.questionByQuestionFeedback = report.questionByQuestionFeedback || [];
    report.actionableSteps = report.actionableSteps || [];
    report.resourceRecommendations = report.resourceRecommendations || [];
    report.practiceAreas = report.practiceAreas || [];
    report.redFlags = report.redFlags || [];
    report.greenFlags = report.greenFlags || [];
    report.likelyFollowUpQuestions = report.likelyFollowUpQuestions || [];
    report.nextSteps = report.nextSteps || [];
    
    // Ensure nested objects exist with defaults
    report.hiringDecision = report.hiringDecision || {
      recommendation: 'Maybe',
      confidence: 'Low',
      reasoning: 'Insufficient data for confident assessment'
    };
    
    report.performanceTrajectory = report.performanceTrajectory || {
      trend: 'Consistent',
      analysis: 'Performance remained relatively stable throughout',
      bestQuestion: 1,
      worstQuestion: 1,
      scoreRange: 'N/A'
    };
    
    report.categoryAnalysis = report.categoryAnalysis || {};
    report.benchmarkComparison = report.benchmarkComparison || {
      percentile: 'Average (50%)',
      comparedTo: `Typical ${experienceLevel} ${jobTitle} candidates`,
      standoutQualities: 'Performance is average for the level',
      gapAnalysis: 'Need more data to assess gaps'
    };
    
    report.cultureFitAnalysis = report.cultureFitAnalysis || {
      assessment: 'Uncertain',
      reasoning: 'Need more behavioral insights for culture assessment',
      concerns: 'None identified'
    };
    
    report.timeManagementInsights = report.timeManagementInsights || {
      averageDuration: avgDuration,
      assessment: 'Good',
      feedback: 'Time management appears adequate'
    };
    
    report.improvementRoadmap = report.improvementRoadmap || {
      week1to2: ['Focus on identified weak areas'],
      week3to4: ['Continue practice and refinement'],
      month2to3: ['Advanced preparation'],
      readyForNextInterview: 'After consistent practice'
    };
    
    report.salaryNegotiationReadiness = report.salaryNegotiationReadiness || {
      level: 'Moderate',
      reasoning: 'Performance suggests moderate negotiating position',
      recommendation: 'Be moderately flexible'
    };
    
    console.log('✅ ENHANCED comprehensive final report generated with 12+ advanced insights');
    console.log('📊 Report includes: Hiring Decision, Red/Green Flags, Trajectory, Benchmarking, Culture Fit, Roadmap, and more');
    
    return report;
    
  } catch (error) {
    console.error('❌ Error generating enhanced final report:', error);
    throw new Error('Failed to generate final report: ' + error.message);
  }
}
