const Exercise = require('../models/Exercise.model');
const UserProgress = require('../models/UserProgress.model');
const AnalysisReport = require('../models/AnalysisReport.model');
const { generateAIFeedback } = require('./aiAnalysis.service');

class PracticeHubService {
    /**
     * Get personalized exercise recommendations based on user's weak areas
     */
    async getPersonalizedExercises(userId, limit = 5) {
        try {
            // Get user's recent speeches to analyze weak areas
            const recentSpeeches = await AnalysisReport.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(10);

            if (recentSpeeches.length === 0) {
                return this.getBeginnerExercises(limit);
            }

            // Analyze weak areas
            const weakAreas = this.analyzeWeakAreas(recentSpeeches);

            // Get AI recommendations
            const aiRecommendations = await this.getAIRecommendations(userId, weakAreas);

            // Fetch matching exercises
            const exercises = await Exercise.find({
                category: { $in: weakAreas.map(w => w.category) },
                isActive: true
            })
            .sort({ difficulty: 1 })
            .limit(limit);

            return {
                weakAreas,
                exercises,
                aiRecommendations,
                improvementPlan: this.generateImprovementPlan(weakAreas, exercises)
            };
        } catch (error) {
            console.error('Error getting personalized exercises:', error);
            throw error;
        }
    }

    /**
     * Analyze user's weak areas from recent speeches
     */
    analyzeWeakAreas(speeches) {
        const weakAreas = [];
        let totalClarity = 0, totalFluency = 0, totalFillerWords = 0, totalPace = 0;

        speeches.forEach(speech => {
            totalClarity += speech.metrics?.clarity || 0;
            totalFluency += speech.metrics?.fluency || 0;
            
            // Calculate filler words count from the Map
            let fillerCount = 0;
            if (speech.fillerWords) {
                speech.fillerWords.forEach((count) => {
                    fillerCount += count;
                });
            }
            totalFillerWords += fillerCount;
            
            totalPace += speech.pace?.wordsPerMinute || 0;
        });

        const avgClarity = totalClarity / speeches.length;
        const avgFluency = totalFluency / speeches.length;
        const avgFillerWords = totalFillerWords / speeches.length;
        const avgPace = totalPace / speeches.length;

        // Identify weak areas
        if (avgClarity < 70) {
            weakAreas.push({ category: 'pronunciation', severity: 'high', avgScore: avgClarity });
        } else if (avgClarity < 80) {
            weakAreas.push({ category: 'pronunciation', severity: 'medium', avgScore: avgClarity });
        }
        
        if (avgFluency < 70) {
            weakAreas.push({ category: 'fluency', severity: 'high', avgScore: avgFluency });
        } else if (avgFluency < 80) {
            weakAreas.push({ category: 'fluency', severity: 'medium', avgScore: avgFluency });
        }
        
        if (avgFillerWords > 5) {
            weakAreas.push({ category: 'filler-words', severity: 'high', avgScore: avgFillerWords });
        } else if (avgFillerWords > 3) {
            weakAreas.push({ category: 'filler-words', severity: 'medium', avgScore: avgFillerWords });
        }
        
        if (avgPace < 120 || avgPace > 180) {
            weakAreas.push({ category: 'pacing', severity: 'medium', avgScore: avgPace });
        }

        return weakAreas.sort((a, b) => {
            const severityOrder = { high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    /**
     * Get AI-powered exercise recommendations
     */
    async getAIRecommendations(userId, weakAreas) {
        if (weakAreas.length === 0) {
            return this.getFallbackRecommendations([]);
        }

        const prompt = `Based on a user's speech analysis showing the following weak areas:
${weakAreas.map(w => `- ${w.category}: ${w.severity} severity (avg: ${w.avgScore})`).join('\n')}

Provide 5 specific, actionable daily practice activities they can do to improve. 

Respond with ONLY valid JSON in this exact format:
{
    "activities": [
        {
            "title": "Activity name",
            "description": "What to do",
            "duration": 5,
            "category": "category name",
            "difficulty": "beginner"
        }
    ],
    "motivationalMessage": "Short encouraging message"
}`;

        try {
            // Create a mock analysis data object for the AI service
            const mockData = {
                transcript: "Practice exercise analysis",
                metrics: { clarity: 75, fluency: 70, pace: 70, confidence: 70, tone: 70 },
                pace: { wordsPerMinute: 150, status: 'Good' },
                fillerWords: {},
                overallScore: 70
            };

            // Use the existing AI feedback generation
            const aiResponse = await generateAIFeedback(mockData);
            
            // Transform the response to match our needs
            return {
                activities: [
                    {
                        title: "AI-Recommended Practice",
                        description: aiResponse.recommendations?.[0] || "Practice daily to improve",
                        duration: 10,
                        category: weakAreas[0]?.category || 'fluency',
                        difficulty: "intermediate"
                    }
                ],
                motivationalMessage: "Keep practicing! Small improvements lead to remarkable results! 🚀"
            };
        } catch (error) {
            console.error('AI recommendations failed, using fallback:', error);
            return this.getFallbackRecommendations(weakAreas);
        }
    }

    /**
     * Get fallback recommendations if AI fails
     */
    getFallbackRecommendations(weakAreas) {
        const recommendations = {
            'pronunciation': {
                title: "Tongue Twister Challenge",
                description: "Practice 5 tongue twisters daily to improve articulation",
                duration: 10,
                difficulty: "beginner"
            },
            'fluency': {
                title: "Read Aloud Practice",
                description: "Read news articles aloud for 10 minutes daily",
                duration: 10,
                difficulty: "beginner"
            },
            'filler-words': {
                title: "Pause & Replace",
                description: "Practice replacing filler words with intentional pauses",
                duration: 5,
                difficulty: "intermediate"
            },
            'pacing': {
                title: "Metronome Speaking",
                description: "Practice speaking with a metronome to control pace",
                duration: 15,
                difficulty: "intermediate"
            },
            'confidence': {
                title: "Power Pose Practice",
                description: "Practice confident body language and voice projection",
                duration: 5,
                difficulty: "beginner"
            }
        };

        const activities = weakAreas.length > 0 
            ? weakAreas.slice(0, 5).map(weak => ({
                ...recommendations[weak.category] || recommendations['fluency'],
                category: weak.category
            }))
            : [
                { ...recommendations['fluency'], category: 'fluency' },
                { ...recommendations['pronunciation'], category: 'pronunciation' },
                { ...recommendations['confidence'], category: 'confidence' }
            ];

        return {
            activities,
            motivationalMessage: "Small daily improvements lead to remarkable results! 🚀"
        };
    }

    /**
     * Generate a structured improvement plan
     */
    generateImprovementPlan(weakAreas, exercises) {
        return {
            weeklyGoals: weakAreas.slice(0, 3).map(area => ({
                category: area.category,
                targetImprovement: "20% improvement",
                recommendedPracticeTime: "15 minutes daily"
            })),
            thirtyDayChallenge: {
                title: "30-Day Speaking Transformation",
                description: "Complete daily exercises targeting your weak areas",
                milestones: [
                    { day: 7, goal: "Complete 7 exercises", reward: "🎯 Week Warrior badge" },
                    { day: 14, goal: "Show 10% improvement in clarity", reward: "📈 Progress Star badge" },
                    { day: 21, goal: "Reduce filler words by 50%", reward: "🎤 Smooth Speaker badge" },
                    { day: 30, goal: "Achieve consistent fluency above 75", reward: "🏆 Master Speaker badge" }
                ]
            }
        };
    }

    /**
     * Get beginner exercises for new users
     */
    async getBeginnerExercises(limit = 5) {
        const exercises = await Exercise.find({
            difficulty: 'beginner',
            isActive: true
        }).limit(limit);

        return {
            exercises,
            weakAreas: [],
            message: "Welcome! Start with these beginner exercises to build your foundation.",
            aiRecommendations: {
                activities: [
                    {
                        title: "Daily Voice Warm-up",
                        description: "5-minute breathing and vocal exercises",
                        duration: 5,
                        category: "confidence",
                        difficulty: "beginner"
                    },
                    {
                        title: "Read Aloud Practice",
                        description: "Read a short article clearly and slowly",
                        duration: 10,
                        category: "fluency",
                        difficulty: "beginner"
                    }
                ],
                motivationalMessage: "Every expert was once a beginner. Start your journey today! 🎤"
            },
            improvementPlan: {
                weeklyGoals: [
                    { category: 'fluency', targetImprovement: "Build foundation", recommendedPracticeTime: "10 minutes daily" },
                    { category: 'confidence', targetImprovement: "Build foundation", recommendedPracticeTime: "5 minutes daily" }
                ],
                thirtyDayChallenge: {
                    title: "30-Day Speaking Foundation",
                    description: "Build your speaking skills from the ground up",
                    milestones: [
                        { day: 7, goal: "Complete first 7 exercises", reward: "🎯 First Step badge" },
                        { day: 14, goal: "Practice for 14 consecutive days", reward: "🔥 Consistent Learner badge" },
                        { day: 21, goal: "Show measurable improvement", reward: "📈 Progress Maker badge" },
                        { day: 30, goal: "Complete the foundation program", reward: "🏆 Foundation Master badge" }
                    ]
                }
            }
        };
    }

    /**
     * Get daily challenge for user
     */
    async getDailyChallenge(userId) {
        const today = new Date().toDateString();
        
        const challenges = [
            {
                title: "60-Second Story",
                description: "Tell a complete story in exactly 60 seconds",
                category: "fluency",
                difficulty: "intermediate",
                duration: 5,
                targetMetrics: { minClarity: 70, maxFillerWords: 3 }
            },
            {
                title: "News Anchor Challenge",
                description: "Read a news article as if you're a TV news anchor",
                category: "pronunciation",
                difficulty: "intermediate",
                duration: 10,
                targetMetrics: { minClarity: 80, targetPace: { min: 150, max: 170 } }
            },
            {
                title: "No Filler Words",
                description: "Speak for 2 minutes without using any filler words",
                category: "filler-words",
                difficulty: "advanced",
                duration: 5,
                targetMetrics: { maxFillerWords: 0 }
            },
            {
                title: "Confident Presentation",
                description: "Deliver a 1-minute presentation on any topic with strong voice projection",
                category: "confidence",
                difficulty: "intermediate",
                duration: 5,
                targetMetrics: { minClarity: 75, minFluency: 70 }
            },
            {
                title: "Tongue Twister Marathon",
                description: "Say 5 different tongue twisters clearly, 3 times each",
                category: "pronunciation",
                difficulty: "beginner",
                duration: 8,
                targetMetrics: { minClarity: 70 }
            }
        ];

        // Rotate challenges based on day of year
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const challenge = challenges[dayOfYear % challenges.length];

        return {
            ...challenge,
            date: today,
            expiresIn: "24 hours",
            reward: "Complete to earn 10 XP and maintain your streak! 🔥"
        };
    }

    /**
     * Record exercise completion
     */
    async recordExerciseCompletion(userId, exerciseId, performance, analysisReportId = null, exerciseCategory = null) {
        try {
            console.log('🎯 Recording exercise completion:', {
                userId,
                exerciseId,
                performance,
                analysisReportId,
                exerciseCategory
            });

            let userProgress = await UserProgress.findOne({ userId });
            
            if (!userProgress) {
                console.log('📝 Creating new UserProgress for user:', userId);
                userProgress = new UserProgress({ userId });
            } else {
                console.log('📊 Found existing progress:', {
                    completedExercises: userProgress.completedExercises.length,
                    currentStreak: userProgress.dailyStreak.current,
                    achievements: userProgress.achievements.length
                });
            }

            // Add completed exercise
            userProgress.completedExercises.push({
                exerciseId,
                analysisReportId,  // Link to the full analysis report (can be null for practice exercises)
                completedAt: new Date(),
                performance,
                feedback: this.generatePerformanceFeedback(performance)
            });

            console.log('✅ Exercise added to completedExercises. Total:', userProgress.completedExercises.length);

            // Update daily streak
            this.updateDailyStreak(userProgress);
            console.log('🔥 Streak updated:', userProgress.dailyStreak);

            // Update skill levels (pass category for targeted updates)
            this.updateSkillLevels(userProgress, performance, exerciseCategory);
            console.log('📈 Skill levels updated:', userProgress.skillLevels);

            // Check and award achievements
            await this.checkAchievements(userProgress);
            console.log('🏆 Achievements checked. Total:', userProgress.achievements.length);

            console.log('💾 Attempting to save UserProgress...');
            console.log('   - Document:', {
                userId: userProgress.userId,
                completedExercisesCount: userProgress.completedExercises.length,
                streak: userProgress.dailyStreak.current,
                skillLevels: userProgress.skillLevels
            });
            
            try {
                await userProgress.save();
                console.log('✅ UserProgress saved successfully!');
            } catch (saveError) {
                console.error('❌ Error saving UserProgress:', saveError);
                console.error('   - Validation errors:', saveError.errors);
                console.error('   - Message:', saveError.message);
                throw saveError;
            }

            const newAchievements = userProgress.achievements.filter(a => {
                const timeDiff = Date.now() - new Date(a.earnedAt).getTime();
                return timeDiff < 5000; // Achievements earned in last 5 seconds
            });

            if (newAchievements.length > 0) {
                console.log('🎉 New achievements earned:', newAchievements.map(a => a.title));
            }

            return {
                success: true,
                progress: userProgress,
                newAchievements
            };
        } catch (error) {
            console.error('❌ Error recording exercise completion:', error);
            throw error;
        }
    }

    /**
     * Update user's daily streak
     */
    updateDailyStreak(userProgress) {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastPractice = userProgress.dailyStreak.lastPracticeDate 
            ? new Date(userProgress.dailyStreak.lastPracticeDate).setHours(0, 0, 0, 0)
            : null;

        if (!lastPractice || lastPractice < today) {
            const oneDayAgo = today - 86400000;
            
            if (lastPractice === oneDayAgo) {
                // Consecutive day
                userProgress.dailyStreak.current += 1;
            } else {
                // Streak broken
                userProgress.dailyStreak.current = 1;
            }

            userProgress.dailyStreak.lastPracticeDate = new Date();
            
            if (userProgress.dailyStreak.current > userProgress.dailyStreak.longest) {
                userProgress.dailyStreak.longest = userProgress.dailyStreak.current;
            }
        }
    }

    /**
     * Update skill levels based on performance
     */
    updateSkillLevels(userProgress, performance, exerciseCategory = null) {
        // Map exercise categories to skill level fields
        const categoryToSkillMap = {
            'pronunciation': 'pronunciation',
            'articulation': 'pronunciation',
            'fluency': 'fluency',
            'pacing': 'pacing',
            'confidence': 'confidence',
            'vocabulary': 'vocabulary',
            'filler-words': 'vocabulary', // Filler words relate to vocabulary improvement
            'tone': 'confidence' // Tone relates to confidence
        };

        // Update general skills based on performance metrics
        if (performance.clarity) {
            const increment = performance.clarity > 75 ? 2 : 1;
            userProgress.skillLevels.pronunciation = Math.min(100, 
                userProgress.skillLevels.pronunciation + increment
            );
        }
        
        if (performance.fluency) {
            const increment = performance.fluency > 75 ? 2 : 1;
            userProgress.skillLevels.fluency = Math.min(100,
                userProgress.skillLevels.fluency + increment
            );
        }
        
        if (performance.pace) {
            const increment = performance.pace > 75 ? 2 : 1;
            userProgress.skillLevels.pacing = Math.min(100,
                userProgress.skillLevels.pacing + increment
            );
        }

        // If we know the exercise category, give extra boost to related skill
        if (exerciseCategory && categoryToSkillMap[exerciseCategory]) {
            const skillField = categoryToSkillMap[exerciseCategory];
            const extraBoost = 1; // Extra point for targeted practice
            
            if (userProgress.skillLevels[skillField] !== undefined) {
                userProgress.skillLevels[skillField] = Math.min(100,
                    userProgress.skillLevels[skillField] + extraBoost
                );
                console.log(`   🎯 Extra boost for ${skillField} (category: ${exerciseCategory})`);
            }
        }

        // Update confidence based on overall performance
        const avgPerformance = ((performance.clarity || 0) + (performance.fluency || 0) + (performance.pace || 0)) / 3;
        if (avgPerformance > 70) {
            userProgress.skillLevels.confidence = Math.min(100,
                userProgress.skillLevels.confidence + (avgPerformance > 80 ? 2 : 1)
            );
        }
    }

    /**
     * Check and award achievements
     */
    async checkAchievements(userProgress) {
        const achievements = [
            {
                title: "First Step",
                description: "Completed your first exercise",
                condition: () => userProgress.completedExercises.length === 1,
                icon: "🎯"
            },
            {
                title: "Week Warrior",
                description: "Maintained a 7-day streak",
                condition: () => userProgress.dailyStreak.current >= 7,
                icon: "🔥"
            },
            {
                title: "Month Master",
                description: "Maintained a 30-day streak",
                condition: () => userProgress.dailyStreak.current >= 30,
                icon: "🏆"
            },
            {
                title: "Pronunciation Pro",
                description: "Reached level 50 in pronunciation",
                condition: () => userProgress.skillLevels.pronunciation >= 50,
                icon: "🎤"
            },
            {
                title: "Fluency Expert",
                description: "Reached level 75 in fluency",
                condition: () => userProgress.skillLevels.fluency >= 75,
                icon: "🌊"
            },
            {
                title: "Dedicated Learner",
                description: "Completed 10 exercises",
                condition: () => userProgress.completedExercises.length >= 10,
                icon: "📚"
            },
            {
                title: "Practice Champion",
                description: "Completed 50 exercises",
                condition: () => userProgress.completedExercises.length >= 50,
                icon: "🥇"
            },
            {
                title: "Century Club",
                description: "Completed 100 exercises",
                condition: () => userProgress.completedExercises.length >= 100,
                icon: "💯"
            }
        ];

        achievements.forEach(achievement => {
            const alreadyEarned = userProgress.achievements.some(a => a.title === achievement.title);
            
            if (!alreadyEarned && achievement.condition()) {
                userProgress.achievements.push({
                    title: achievement.title,
                    description: achievement.description,
                    earnedAt: new Date(),
                    icon: achievement.icon
                });
            }
        });
    }

    /**
     * Generate performance feedback
     */
    generatePerformanceFeedback(performance) {
        const { clarity, fluency, fillerWords } = performance;
        
        if (clarity >= 80 && fluency >= 80 && fillerWords <= 2) {
            return "Excellent work! You're speaking with great clarity and confidence! 🌟";
        } else if (clarity >= 70 && fluency >= 70) {
            return "Good job! Keep practicing to reach the next level! 👍";
        } else {
            return "Nice effort! Practice makes perfect. Try again! 💪";
        }
    }
}

module.exports = new PracticeHubService();
